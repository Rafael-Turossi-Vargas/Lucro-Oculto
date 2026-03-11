// ─── Role Definitions ─────────────────────────────────────────────────────────

export const ROLES = {
  owner:    { label: "Proprietário", description: "Acesso total ao sistema, incluindo plano, equipe e empresas" },
  manager:  { label: "Gerente",      description: "Gerencia dados, uploads e equipe; sem acesso a plano e empresas" },
  analyst:  { label: "Analista",     description: "Pode fazer uploads e visualizar análises; sem gerenciar equipe" },
  viewer:   { label: "Visualizador", description: "Somente leitura: dashboards e relatórios; sem upload ou ações" },
  contador: { label: "Contador",     description: "Acesso exclusivo a dados financeiros, plano e integrações bancárias (requer PIN)" },
} as const

export type Role = keyof typeof ROLES

// Roles that can be assigned when inviting (owner can assign any, manager can assign analyst/viewer)
export const INVITABLE_BY_OWNER:   Role[] = ["manager", "analyst", "viewer", "contador"]
export const INVITABLE_BY_MANAGER: Role[] = ["analyst", "viewer"]

// ─── Permission Matrix ─────────────────────────────────────────────────────────

const PERMISSIONS = {
  "dashboard:view":       ["owner", "manager", "analyst", "viewer"],
  "leaks:view":           ["owner", "manager", "analyst", "viewer"],
  "opportunities:view":   ["owner", "manager", "analyst", "viewer"],
  "alerts:view":          ["owner", "manager", "analyst", "viewer"],
  "history:view":         ["owner", "manager", "analyst", "viewer"],
  "reports:view":         ["owner", "manager", "analyst", "viewer"],
  "reports:generate":     ["owner", "manager", "analyst"],
  "action_plan:view":     ["owner", "manager", "analyst"],
  "action_plan:edit":     ["owner", "manager"],
  "upload:create":        ["owner", "manager", "analyst"],
  "team:view":            ["owner", "manager"],
  "team:invite":          ["owner", "manager"],
  "team:remove":          ["owner"],
  "team:change_role":     ["owner"],
  "companies:manage":     ["owner"],
  "settings:profile":     ["owner", "manager", "analyst", "contador"],
  "settings:billing":     ["owner"],
  // Finance: view = can see financial data (billing, openfinance); manage = can make changes (checkout, cancel)
  "finance:view":         ["owner", "contador"],
  "finance:manage":       ["owner"],
} as const

export type Permission = keyof typeof PERMISSIONS

export function can(role: string | undefined, permission: Permission): boolean {
  if (!role) return false
  if (role === "admin") return true // system admin bypass
  return (PERMISSIONS[permission] as readonly string[]).includes(role)
}

// Returns which roles a given role can invite
export function getInvitableRoles(role: string): Role[] {
  if (role === "owner" || role === "admin") return INVITABLE_BY_OWNER
  if (role === "manager") return INVITABLE_BY_MANAGER
  return []
}

// Role badge config for UI
export const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  owner:    { bg: "rgba(168,85,247,0.12)",  text: "#A855F7", border: "rgba(168,85,247,0.25)" },
  manager:  { bg: "rgba(59,130,246,0.12)",  text: "#3B82F6", border: "rgba(59,130,246,0.25)" },
  analyst:  { bg: "rgba(0,208,132,0.1)",    text: "#00D084", border: "rgba(0,208,132,0.2)"  },
  viewer:   { bg: "rgba(139,143,168,0.1)",  text: "#8B8FA8", border: "rgba(139,143,168,0.2)" },
  contador: { bg: "rgba(245,158,11,0.1)",   text: "#F59E0B", border: "rgba(245,158,11,0.2)"  },
  admin:    { bg: "rgba(59,130,246,0.12)",  text: "#3B82F6", border: "rgba(59,130,246,0.25)" },
}
