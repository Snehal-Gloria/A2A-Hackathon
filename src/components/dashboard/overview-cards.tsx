import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingDown, Leaf, PiggyBank } from 'lucide-react';

const overviewData = [
  {
    title: 'Total Income',
    value: '₹4,490',
    change: '+11% from last month',
    icon: Wallet,
  },
  {
    title: 'Total Expenses',
    value: '₹4,300',
    change: '+1.2% from last month',
    icon: TrendingDown,
  },
  {
    title: 'Carbon Footprint',
    value: '133.6 kg CO2e',
    change: '-5% from last month',
    icon: Leaf,
  },
  {
    title: 'Total Savings',
    value: '₹190',
    change: '+180.1% from last month',
    icon: PiggyBank,
  },
];

export function OverviewCards() {
  return (
    <>
      {overviewData.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.change}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
