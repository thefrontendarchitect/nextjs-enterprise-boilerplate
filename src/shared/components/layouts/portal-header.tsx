'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from '@/shared/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { ThemeSwitcher } from '@/shared/components/theme-switcher';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { authService } from '@/shared/services/auth.service';
import {
  Search,
  Bell,
  MessageSquare,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Command,
  Sun,
  Moon,
  Laptop,
  Grid3x3,
  Activity,
  CreditCard,
  Users,
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/shared/components/ui/command';

export function PortalHeader() {
  const router = useRouter();
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  // Mock notifications
  const notifications = [
    { id: 1, title: 'New message', description: 'You have a new message from John', time: '5m ago' },
    { id: 2, title: 'Server update', description: 'Server maintenance scheduled', time: '1h ago' },
    { id: 3, title: 'Payment received', description: 'Payment of $250 received', time: '2h ago' },
  ];

  return (
    <header className="sticky top-0 z-40 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-4">
        {/* Search Bar */}
        <div className="flex items-center flex-1 max-w-md">
          <Button
            variant="outline"
            className="relative w-full justify-start text-sm text-muted-foreground"
            onClick={() => setIsCommandOpen(true)}
          >
            <Search className="mr-2 h-4 w-4" />
            Search...
            <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        </div>

        {/* Right side actions */}
        <div className="ml-auto flex items-center space-x-2">
          {/* Quick Stats */}
          <div className="hidden lg:flex items-center space-x-4 mr-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm">98.2%</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm">1,234</span>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-purple-500" />
              <span className="text-sm">$45.2k</span>
            </div>
          </div>

          {/* Apps Grid */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Grid3x3 className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Quick Links</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link href="/portal/components/forms/basic" className="flex items-center">
                  Forms
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/portal/components/tables" className="flex items-center">
                  Tables
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/portal/components/charts/analytics" className="flex items-center">
                  Charts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href="/portal/components/overlays/modals" className="flex items-center">
                  Modals
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="relative">
            <MessageSquare className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              2
            </span>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                <Badge variant="secondary">{notifications.length} new</Badge>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                  <div className="flex w-full justify-between">
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-xs text-muted-foreground">{notification.time}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{notification.description}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="w-full text-center">
                <Link href="/portal" className="w-full">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatar.jpg" alt="User" />
                  <AvatarFallback>TU</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Test User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    test@example.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/user/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                  <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/user/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Log out'}
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Command Palette */}
      <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem onSelect={() => { router.push('/dashboard'); setIsCommandOpen(false); }}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/portal/components/forms/basic'); setIsCommandOpen(false); }}>
              <Grid3x3 className="mr-2 h-4 w-4" />
              <span>Forms</span>
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/portal/components/tables'); setIsCommandOpen(false); }}>
              <Grid3x3 className="mr-2 h-4 w-4" />
              <span>Tables</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem onSelect={() => { router.push('/user/profile'); setIsCommandOpen(false); }}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => { router.push('/user/settings'); setIsCommandOpen(false); }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}