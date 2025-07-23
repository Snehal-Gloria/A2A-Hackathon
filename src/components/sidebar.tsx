'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons';
import { LayoutDashboard, ReceiptText, Bot, Target, Settings, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserNav } from './user-nav';

const menuItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ReceiptText },
  { href: '/recommendations', label: 'AI Recommendations', icon: Bot },
  { href: '/goals', label: 'Financial Goals', icon: Target },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r">
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold text-primary">EcoFinance</h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  className="w-full"
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <UserNav />
      </SidebarFooter>
    </Sidebar>
  );
}
