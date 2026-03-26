// ProtectedRoute — redirects to login if user is not authenticated
import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      void router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
