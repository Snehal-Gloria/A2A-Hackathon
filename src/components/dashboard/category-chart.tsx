'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { categoryData } from '@/lib/data';

export function CategoryChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>A breakdown of your expenses this month.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px] w-full p-2">
        <ResponsiveContainer>
          <PieChart>
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent) / 0.1)' }}
              contentStyle={{ 
                backgroundColor: 'hsl(var(--background))',
                borderColor: 'hsl(var(--border))'
              }}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={10} />
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              dataKey="value"
              nameKey="category"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
