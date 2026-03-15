import { db } from "@/lib/db"

export type AuditAction =
  | "login.success"
  | "login.failure"
  | "login.blocked"
  | "password.changed"
  | "password.reset_requested"
  | "password.reset_completed"
  | "pin.set"
  | "pin.deleted"
  | "pin.verify_success"
  | "pin.verify_failure"
  | "account.deleted"
  | "team.member_invited"
  | "team.member_removed"
  | "team.role_changed"
  | "team.invite_accepted"
  | "org.created"
  | "org.deleted"

export interface AuditParams {
  action: AuditAction
  status: "success" | "failure"
  userId?: string
  organizationId?: string
  ip?: string
  userAgent?: string
  metadata?: Record<string, unknown>
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        action: params.action,
        status: params.status,
        userId: params.userId ?? null,
        organizationId: params.organizationId ?? null,
        ip: params.ip ?? null,
        userAgent: params.userAgent ?? null,
        metadata: params.metadata ? JSON.parse(JSON.stringify(params.metadata)) : undefined,
      },
    })
  } catch (err) {
    if (process.env.NODE_ENV === "development") throw err
    console.error("[audit] Failed to write audit log:", err)
  }
}
