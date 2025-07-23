import { OverviewCards } from '@/components/dashboard/overview-cards';
import { SpendingChart } from '@/components/dashboard/spending-chart';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { CarbonFootprintCard } from '@/components/dashboard/carbon-footprint-card';
import { RecentTransactions } from '@/components/dashboard/recent-transactions';
import { PageHeader } from '@/components/page-header';

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PageHeader title="Dashboard" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <OverviewCards />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-4">
          <SpendingChart />
        </div>
        <div className="lg:col-span-3">
          <CategoryChart />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        <div className="lg:col-span-3">
          <CarbonFootprintCard />
        </div>
        <div className="lg:col-span-4">
          <RecentTransactions />
        </div>
      </div>
    </div>
  );
}
