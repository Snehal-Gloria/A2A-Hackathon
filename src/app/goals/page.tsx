'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateFinancialPlans, type GenerateFinancialPlansOutput } from '@/ai/flows/generate-financial-plans';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import { Bot, Loader2, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  goal: z.string().min(5, 'Please describe your financial goal.'),
  currentSavings: z.coerce.number().min(0, 'Current savings cannot be negative.'),
  monthlyIncome: z.coerce.number().positive('Monthly income must be a positive number.'),
  monthlyExpenses: z.coerce.number().positive('Monthly expenses must be a positive number.'),
});

type FormData = z.infer<typeof formSchema>;

export default function GoalsPage() {
  const [plan, setPlan] = useState<GenerateFinancialPlansOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      goal: 'Save for a vacation to Europe',
      currentSavings: 10000,
      monthlyIncome: 60000,
      monthlyExpenses: 45000,
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setPlan(null);
    try {
      const result = await generateFinancialPlans(values);
      setPlan(result);
    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate financial plan. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full p-4 md:p-8 pt-6">
      <PageHeader title="Financial Goals" />
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Set Your Financial Goal</CardTitle>
            <CardDescription>Tell us what you're saving for, and our AI will create a personalized plan to get you there.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="goal" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Financial Goal</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="currentSavings" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Savings (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="monthlyIncome" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="monthlyExpenses" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Expenses (₹)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create My Plan
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isLoading ? (
            <Card className="flex flex-col items-center justify-center h-full">
              <CardContent className="text-center">
                <Bot className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <p className="mt-4 text-lg font-medium">Crafting your plan...</p>
                <p className="text-muted-foreground">Our AI is building your path to success.</p>
              </CardContent>
            </Card>
          ) : plan ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  <CardTitle>Your Personalized Financial Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="whitespace-pre-wrap text-sm leading-relaxed">{plan.plan}</CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
