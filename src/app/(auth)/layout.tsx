import { ProtectedRoute } from '@/modules/auth/components/protected-route';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}