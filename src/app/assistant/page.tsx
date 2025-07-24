
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { askFinancialAssistant, AskFinancialAssistantInput } from '@/ai/flows/financial-assistant-flow';
import { authenticate as authenticateTool, checkAuth as checkAuthTool } from '@/services/fi-mcp';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Bot, Loader2, User, KeyRound } from 'lucide-react';
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
  const [passcode, setPasscode] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });
  
  useEffect(() => {
    async function verifyAuth() {
      try {
        const authStatus = await checkAuthTool();
        setIsAuthenticated(authStatus);
        if (authStatus) {
            setMessages([{ role: 'assistant', content: "I'm ready! How can I help you with your finances today?" }]);
        }
      } catch (error) {
        setIsAuthenticated(false);
        toast({ title: 'Error', description: 'Could not verify authentication status. Please try again.', variant: 'destructive' });
      }
    }
    verifyAuth();
  }, [toast]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) return;
    setIsAuthLoading(true);
    try {
      // The passcode is a phone number from the test data scenarios.
      const success = await authenticateTool({ passcode });
      if (success) {
        setIsAuthenticated(true);
        setMessages([{ role: 'assistant', content: "Authentication successful! How can I help you with your finances?" }]);
        toast({ title: 'Success', description: 'Authenticated with Fi-MCP.' });
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setIsAuthenticated(false);
      toast({
        title: 'Authentication Failed',
        description: 'The passcode is incorrect or the service is unavailable. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

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
      toast({
        title: 'Error',
        description: 'Failed to get a response from the assistant. Please try again.',
        variant: 'destructive',
      });
      setMessages([...newMessages, { role: 'assistant', content: "Sorry, I ran into an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  }
  
  if (isAuthenticated === undefined) {
    return (
        <div className="flex items-center justify-center h-screen">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <KeyRound className="w-12 h-12 text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Fi-MCP Authentication</h2>
              <p className="text-muted-foreground mb-6">
                Enter a phone number from the test data to simulate login and connect your financial data.
              </p>
              <form onSubmit={handlePasscodeSubmit} className="w-full space-y-4">
                <Input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="e.g., 2222222222"
                  disabled={isAuthLoading}
                />
                <Button type="submit" className="w-full" disabled={isAuthLoading || !passcode}>
                  {isAuthLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Connect
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
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
