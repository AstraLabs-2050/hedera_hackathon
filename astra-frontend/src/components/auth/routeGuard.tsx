import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface RouteGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireVerified?: boolean;
  requireProfile?: boolean;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireAuth = false,
  requireVerified = false,
  requireProfile = false,
  redirectTo = "/register",
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requireVerified && (!user || !user.verified)) {
      router.replace("/register/verify-otp");
      return;
    }

    if (requireProfile && (!user || !user.profileCompleted)) {
      router.replace("/register/brand-profile");
      return;
    }
  }, [
    isLoading,
    isAuthenticated,
    user,
    requireAuth,
    requireVerified,
    requireProfile,
    redirectTo,
    router,
  ]);

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-black'></div>
      </div>
    );
  }

  return <>{children}</>;
};

// Specific guards for common use cases
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <RouteGuard requireAuth>{children}</RouteGuard>;

export const VerifiedGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RouteGuard requireAuth requireVerified>
    {children}
  </RouteGuard>
);

export const CompleteGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <RouteGuard requireAuth requireVerified requireProfile>
    {children}
  </RouteGuard>
);
