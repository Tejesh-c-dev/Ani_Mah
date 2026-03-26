import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { isHydrated, isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;

    if (!isAuthenticated) {
      void router.replace("/login");
      return;
    }

    if (user?.role !== "ADMIN") {
      void router.replace("/");
    }
  }, [isHydrated, isAuthenticated, user, router]);

  if (!isHydrated || !isAuthenticated || user?.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
};

export default AdminRoute;
