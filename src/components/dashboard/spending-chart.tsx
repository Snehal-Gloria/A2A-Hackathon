'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { spendingData } from '@/lib/data';

export function SpendingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Analytics</CardTitle>
        <CardDescription>Income vs. Expenses over the last 7 months.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full p-2">
        <ResponsiveContainer>
          <BarChart data={spendingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))'
              }}
            />
            <Legend iconSize={10} />
            <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="hsl(var(--accent))" name="Expenses" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
