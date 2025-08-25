'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  LayoutGrid,
  Component,
  FileText,
  MessageSquare,
  PieChart,
  Settings,
  User,
  Calendar,
  FolderOpen,
  Kanban,
  Mail,
  Bell,
  Shield,
  Palette,
  FormInput,
  Table,
  AlertCircle,
  Square,
  Compass,
  SlidersHorizontal,
  BarChart3,
  Grid3x3,
  Sparkles,
  Wand2,
  Activity,
  HelpCircle,
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Overview',
    icon: Home,
    href: '/portal',
  },
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    href: '/dashboard',
  },
  {
    title: 'Components',
    icon: Component,
    children: [
      {
        title: 'Forms',
        icon: FormInput,
        children: [
          { title: 'Basic Forms', href: '/portal/components/forms/basic' },
          { title: 'Form Wizard', href: '/portal/components/forms/wizard', icon: Wand2, badge: 'New' },
        ],
      },
      {
        title: 'Data Display',
        icon: Table,
        children: [
          { title: 'Tables', href: '/portal/components/tables' },
          { title: 'Cards', href: '/portal/components/cards' },
          { title: 'Lists', href: '/portal/components/lists' },
        ],
      },
      {
        title: 'Feedback',
        icon: AlertCircle,
        children: [
          { title: 'Alerts & Toasts', href: '/portal/components/feedback/alerts' },
          { title: 'Notifications', href: '/portal/components/notifications' },
          { title: 'Loading States', href: '/portal/components/loading' },
        ],
      },
      {
        title: 'Overlays',
        icon: Square,
        children: [
          { title: 'Modals & Dialogs', href: '/portal/components/overlays/modals' },
        ],
      },
      {
        title: 'Navigation',
        icon: Compass,
        children: [
          { title: 'Tabs & Breadcrumbs', href: '/portal/components/navigation/tabs' },
        ],
      },
      {
        title: 'Data Input',
        icon: SlidersHorizontal,
        children: [
          { title: 'Basic Inputs', href: '/portal/components/inputs' },
          { title: 'Advanced Inputs', href: '/portal/components/data-input/advanced', badge: 'Pro' },
        ],
      },
      {
        title: 'Charts',
        icon: PieChart,
        children: [
          { title: 'Analytics & Charts', href: '/portal/components/charts/analytics' },
        ],
      },
      {
        title: 'Layouts',
        icon: Grid3x3,
        children: [
          { title: 'Grids & Containers', href: '/portal/components/layout/grids' },
        ],
      },
      {
        title: 'Foundation',
        icon: Palette,
        children: [
          { title: 'Colors', href: '/portal/components/colors' },
          { title: 'Typography', href: '/portal/components/typography' },
          { title: 'Icons', href: '/portal/components/icons' },
        ],
      },
    ],
  },
  {
    title: 'Demo Apps',
    icon: Sparkles,
    badge: 'New',
    children: [
      { title: 'Calendar', href: '/apps/calendar', icon: Calendar },
      { title: 'Kanban Board', href: '/apps/kanban', icon: Kanban },
      { title: 'Chat', href: '/apps/chat', icon: MessageSquare },
      { title: 'Email', href: '/apps/email', icon: Mail },
      { title: 'File Manager', href: '/apps/file-manager', icon: FolderOpen },
    ],
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    children: [
      { title: 'Overview', href: '/analytics/overview', icon: Activity },
      { title: 'Reports', href: '/analytics/reports', icon: FileText },
    ],
  },
  {
    title: 'User',
    icon: User,
    children: [
      { title: 'Profile', href: '/user/profile', icon: User },
      { title: 'Settings', href: '/user/settings', icon: Settings },
      { title: 'Notifications', href: '/user/notifications', icon: Bell },
      { title: 'Security', href: '/user/security', icon: Shield },
    ],
  },
  {
    title: 'Help',
    icon: HelpCircle,
    href: '/help',
  },
];

function NavItemComponent({ 
  item, 
  depth = 0,
  isCollapsed 
}: { 
  item: NavItem; 
  depth?: number;
  isCollapsed: boolean;
}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname;
  const Icon = item.icon;

  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start font-normal",
              depth > 0 && "pl-4",
              depth > 1 && "pl-8"
            )}
          >
            {Icon && <Icon className="mr-2 h-4 w-4" />}
            {!isCollapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180"
                )} />
              </>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {item.children?.map((child) => (
            <NavItemComponent
              key={child.title}
              item={child}
              depth={depth + 1}
              isCollapsed={isCollapsed}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  if (!item.href) {
    return null;
  }

  return (
    <Link href={item.href}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start font-normal",
          depth > 0 && "pl-4",
          depth > 1 && "pl-8",
          depth > 2 && "pl-12"
        )}
      >
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <span className="ml-2 rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Button>
    </Link>
  );
}

export function PortalSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={cn(
      "relative flex h-full flex-col border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Portal</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {navigation.map((item) => (
            <NavItemComponent
              key={item.title}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* Footer */}
      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="text-xs text-muted-foreground">
            <p>UI Components v1.0</p>
            <p className="mt-1">© 2024 Your Company</p>
          </div>
        </div>
      )}
    </div>
  );
}