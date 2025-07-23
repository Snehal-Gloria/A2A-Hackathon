import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const carbonData = {
  total: 133.6,
  target: 150,
  breakdown: [
    { category: 'Utilities', value: 50.1, percentage: 37.5 },
    { category: 'Transport', value: 25.2, percentage: 18.9 },
    { category: 'Shopping', value: 20.0, percentage: 15.0 },
  ],
};

export function CarbonFootprintCard() {
  const progressValue = (carbonData.total / carbonData.target) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Carbon Footprint</CardTitle>
        <CardDescription>
          Your estimated CO2e for this month is {carbonData.total.toFixed(1)}kg.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Monthly Footprint</span>
              <span className="text-sm text-muted-foreground">{progressValue.toFixed(0)}% of target</span>
            </div>
            <Progress value={progressValue} aria-label={`${progressValue.toFixed(0)}% of carbon footprint target`} />
            <p className="text-xs text-muted-foreground mt-1">Target: {carbonData.target}kg CO2e</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Top Categories</h4>
            <ul className="space-y-2">
              {carbonData.breakdown.map((item) => (
                <li key={item.category} className="flex justify-between items-center text-sm">
                  <span>{item.category}</span>
                  <span className="font-mono text-muted-foreground">{item.value.toFixed(1)}kg</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
