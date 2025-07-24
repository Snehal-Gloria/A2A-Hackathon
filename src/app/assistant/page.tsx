
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askFinancialAssistant, AskFinancialAssistantInput } from '@/ai/flows/financial-assistant-flow';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Bot, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  query: z.string().min(1, 'Please enter a query.'),
});

type FormData = z.infer<typeof formSchema>;

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });
  
  useEffect(() => {
    setMessages([{ role: 'assistant', content: "Hello! I'm your EcoFinance AI Assistant. How can I help you with your finances today? For example, you can ask 'What is my net worth?'" }]);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    const newMessages: Message[] = [...messages, { role: 'user', content: values.query }];
    setMessages(newMessages);
    form.reset();

    try {
      const input: AskFinancialAssistantInput = { query: values.query };
      const result = await askFinancialAssistant(input);
      setMessages([...newMessages, { role: 'assistant', content: result.response }]);
    } catch (error) {
      console.error('Error with assistant:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast({
        title: 'Error',
        description: `Failed to get a response from the assistant. ${errorMessage}`,
        variant: 'destructive',
      });
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen w-full p-4 md:p-6 bg-background">
      <PageHeader title="AI Financial Assistant" />
      <Card className="mt-6 flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="p-2 rounded-full bg-primary/20 border border-primary">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-prose p-3 rounded-lg prose prose-sm prose-invert ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  dangerouslySetInnerHTML={{ __html: msg.content.replace(/\[(Login to Fi Money)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline">$1</a>') }}
                >
                </div>
                {msg.role === 'user' && (
                  <div className="p-2 rounded-full bg-accent/80 border border-accent">
                    <User className="h-6 w-6 text-accent-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                 <div className="p-2 rounded-full bg-primary/20 border border-primary">
                    <Bot className="h-6 w-6 text-primary" />
                  </div>
                <div className="max-w-lg p-3 rounded-lg bg-muted flex items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <div className="border-t p-4 md:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
              <FormField control={form.control} name="query" render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Ask about your finances..." autoComplete="off" disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send
              </Button>
            </form>
          </Form>
        </div>
      </Card>
    </div>
  );
}
