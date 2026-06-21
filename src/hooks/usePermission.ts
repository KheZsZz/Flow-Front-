import { useAuth } from "@/contexts/authContext";
import { UserTypeEnum } from "@/schemas/enumSchema";

const ROLE_LEVEL: Record<UserTypeEnum, number> = {
  Manager: 5,
  Admin: 4,
  Financer: 3,
  Requestor: 2,
  Driver: 1,
  Commum: 0,
};

export const ROLE_ALLOWED_ROUTES: Record<UserTypeEnum, string[]> = {
  Manager: ["*"],
  Admin: ["*"],
  Financer: [
    "/dashboard",
    "/finance",
    "/invoices",
    "/collections",
    "/settings",
  ],
  Requestor: ["/orders/create", "/orders", "/status", "/settings"],
  Driver: ["/driver", "/settings"],
  Commum: [
    "/dashboard",
    "/orders",
    "/invoices",
    "/collections",

    "/orders/create",
    "/invoices/create",
    "/collections/create",
    "/settings",
  ],
};

// Rota home por perfil (para onde redirecionar após login)
export const HOME_BY_ROLE: Record<UserTypeEnum, string> = {
  Manager: "/(app)/dashboard",
  Admin: "/(app)/dashboard",
  Financer: "/(app)/finance",
  Requestor: "/(app)/orders/create",
  Driver: "/(app)/driver",
  Commum: "/(app)/invoices",
};

export function usePermissions() {
  const { user } = useAuth();
  const profile = (user?.user?.profile_user ?? "Commum") as UserTypeEnum;
  const level = ROLE_LEVEL[profile] ?? 0;
  const allowed = ROLE_ALLOWED_ROUTES[profile] ?? [];

  const isAdmin = profile === "Admin" || profile === "Manager";

  const hasMinRole = (minRole: UserTypeEnum): boolean => {
    return level >= ROLE_LEVEL[minRole];
  };

  const canAccess = (path: string): boolean => {
    if (allowed.includes("*")) return true;
    return allowed.some((r) => path === r || path.startsWith(r + "/"));
  };

  return { profile, level, isAdmin, hasMinRole, canAccess };
}
