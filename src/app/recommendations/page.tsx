'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { generateFinancialRecommendations, type GenerateFinancialRecommendationsOutput } from '@/ai/flows/generate-financial-recommendations';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PageHeader } from '@/components/page-header';
import { Bot, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  income: z.coerce.number().positive('Income must be a positive number.'),
  expenses: z.coerce.number().positive('Expenses must be a positive number.'),
  carbonFootprint: z.coerce.number().positive('Carbon footprint must be a positive number.'),
  location: z.string().min(2, 'Location is required.'),
  spendingData: z.string().min(10, 'Please describe your spending habits.'),
});

type FormData = z.infer<typeof formSchema>;

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<GenerateFinancialRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      income: 5000,
      expenses: 4300,
      carbonFootprint: 133,
      location: 'Mumbai, India',
      spendingData: 'High spending on dining out and frequent travel by car. Utilities are also a major expense.',
    },
  });

  async function onSubmit(values: FormData) {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await generateFinancialRecommendations(values);
      setRecommendations(result);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full p-4 md:p-8 pt-6">
      <PageHeader title="AI Recommendations" />
      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Get Eco-Friendly Advice</CardTitle>
            <CardDescription>Fill in your details to receive personalized financial and lifestyle recommendations from our AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField control={form.control} name="income" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Income (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="expenses" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Expenses (₹)</FormLabel>
                      <FormControl><Input type="number" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="carbonFootprint" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbon Footprint (kg CO2e)</FormLabel>
                    <FormControl><Input type="number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="spendingData" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Spending Habits</FormLabel>
                    <FormControl><Textarea {...field} rows={4} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Generate Recommendations
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isLoading && (
            <Card className="flex flex-col items-center justify-center h-full">
              <CardContent className="text-center">
                <Bot className="h-12 w-12 mx-auto text-primary animate-pulse" />
                <p className="mt-4 text-lg font-medium">Our AI is thinking...</p>
                <p className="text-muted-foreground">Generating personalized recommendations for you.</p>
              </CardContent>
            </Card>
          )}

          {recommendations && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Financial Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-sm">{recommendations.financialRecommendations}</CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Lifestyle Adjustments</CardTitle>
                </CardHeader>
                <CardContent className="whitespace-pre-wrap text-sm">{recommendations.lifestyleAdjustments}</CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
