import { SidebarTrigger } from '@/components/ui/sidebar';

type PageHeaderProps = {
  title: string;
};

export function PageHeader({ title }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      </div>
    </div>
  );
}
