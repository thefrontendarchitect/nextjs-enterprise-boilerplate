'use client';

import { useState } from 'react';
// useRouter not needed - handled by useAuth hook
import { LogOut } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { useAuth } from '../hooks/use-auth';
// Simplified logout button using unified auth hook

interface LogoutButtonProps {
  showIcon?: boolean;
  showText?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  className?: string;
  confirmLogout?: boolean;
}

export function LogoutButton({
  showIcon = true,
  showText = true,
  variant = 'ghost',
  className,
  confirmLogout = true,
}: LogoutButtonProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Router not needed - handled by useAuth hook
  const { logout } = useAuth();

  const handleLogout = async () => {
    setIsLoggingOut(true);

    // Use the unified logout method
    await logout();

    setIsLoggingOut(false);
    setShowConfirmDialog(false);
  };

  const onLogoutClick = () => {
    if (confirmLogout) {
      setShowConfirmDialog(true);
    } else {
      handleLogout();
    }
  };

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={onLogoutClick}
        disabled={isLoggingOut}
      >
        {showIcon && <LogOut className="h-4 w-4" />}
        {showIcon && showText && <span className="ml-2" />}
        {showText && (isLoggingOut ? 'Logging out...' : 'Logout')}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
