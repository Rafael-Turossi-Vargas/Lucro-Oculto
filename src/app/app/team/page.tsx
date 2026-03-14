"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import {
  Users, Mail, Trash2, Crown, Clock, Send, X, AlertCircle,
  ChevronDown, Check, Pencil,
} from "lucide-react"
import { ROLES, ROLE_COLORS, can, getInvitableRoles, type Role } from "@/lib/roles"

type Member = {
  id: string
  role: string
  createdAt: string
  user: { id: string; name: string | null; email: string; createdAt: string }
}

type Invite = {
  id: string
  email: string
  role: string
  token: string
  invitedByName: string | null
  expiresAt: string
  createdAt: string
}

type TeamData = {
  members: Member[]
  invites: Invite[]
  maxMembers: number
  role: string
}

function RoleBadge({ role }: { role: string }) {
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.viewer
  const label = ROLES[role as Role]?.label ?? role
  const Icon = role === "owner" ? Crown : Users
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap"
      style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  )
}

function RoleSelect({
  value, onChange, availableRoles, disabled,
}: {
  value: string; onChange: (r: string) => void; availableRoles: Role[]; disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const colors = ROLE_COLORS[value] ?? ROLE_COLORS.viewer
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(o => !o)} disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50"
        style={{ background: colors.bg, color: colors.text, borderColor: colors.border }}>
        {ROLES[value as Role]?.label ?? value}
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl w-60 overflow-hidden">
          {availableRoles.map(r => {
            const c = ROLE_COLORS[r]
            return (
              <button key={r} type="button" onClick={() => { onChange(r); setOpen(false) }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-subtle)] transition-colors text-left">
                <div className="mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0"
                  style={{ background: c.bg, borderColor: c.border }}>
                  {value === r && <Check className="w-3 h-3" style={{ color: c.text }} />}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: c.text }}>{ROLES[r].label}</p>
                  <p className="text-[11px] text-[var(--text-faint)] leading-tight mt-0.5">{ROLES[r].description}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function TeamPage() {
  const { data: session } = useSession()
  const plan = session?.user?.plan ?? "free"
  const currentUserId = session?.user?.id
  const myRole = session?.user?.role ?? "viewer"

  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<Role>("analyst")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState("")
  const [inviteSuccess, setInviteSuccess] = useState("")
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [cancellingToken, setCancellingToken] = useState<string | null>(null)
  const [editingRole, setEditingRole] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true); setError("")
    const res = await fetch("/api/app/team")
    if (!res.ok) { const e = await res.json().catch(() => ({})); setError(e.error ?? "Erro ao carregar equipe"); setLoading(false); return }
    setData(await res.json()); setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const invitableRoles = getInvitableRoles(myRole)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault(); setInviting(true); setInviteError(""); setInviteSuccess("")
    const res = await fetch("/api/app/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: inviteEmail, role: inviteRole }) })
    const result = await res.json(); setInviting(false)
    if (!res.ok) { setInviteError(result.error ?? "Erro ao enviar convite"); return }
    setInviteSuccess(`Convite enviado para ${inviteEmail} como ${ROLES[inviteRole]?.label}`)
    setInviteEmail(""); load()
  }

  const handleRemove = async (userId: string) => {
    if (!confirm("Remover este membro da equipe?")) return
    setRemovingId(userId)
    await fetch(`/api/app/team/${userId}`, { method: "DELETE" })
    setRemovingId(null); load()
  }

  const handleCancelInvite = async (token: string) => {
    setCancellingToken(token)
    await fetch(`/api/app/team/invite/${token}`, { method: "DELETE" })
    setCancellingToken(null); load()
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    setEditingRole(userId)
    await fetch(`/api/app/team/${userId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: newRole }) })
    setEditingRole(null); load()
  }

  const canInvite    = can(myRole, "team:invite")
  const canRemove    = can(myRole, "team:remove")
  const canEditRole  = can(myRole, "team:change_role")

  if (plan !== "premium" && plan !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#A855F7]/15 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#A855F7]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Recurso Premium</h2>
          <p className="text-[var(--text-muted)] mb-6">Gerencie até 5 membros na sua equipe com o plano Premium.</p>
          <a href="/app/settings#upgrade" className="inline-block bg-[#A855F7] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#9333EA] transition-colors">
            Fazer upgrade para Premium
          </a>
        </div>
      </div>
    )
  }

  if (loading) return <div className="px-6 py-8 space-y-4 animate-pulse">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl bg-[var(--bg-subtle)]" />)}</div>
  if (error) return <div className="p-6"><div className="flex items-center gap-3 p-4 bg-[#FF4D4F]/10 border border-[#FF4D4F]/25 rounded-xl text-[#FF4D4F]"><AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span></div></div>

  const memberCount = data?.members.length ?? 0
  const maxMembers  = data?.maxMembers ?? 5

  return (
    <div className="px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Equipe</h1>
        <p className="text-[var(--text-muted)] mt-1">{memberCount}/{maxMembers} membros · Plano Premium</p>
      </div>

      {/* Roles legend */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5">
        <p className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-widest mb-3">Funções e permissões</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(Object.entries(ROLES) as [Role, typeof ROLES[Role]][]).map(([key, def]) => {
            const c = ROLE_COLORS[key]
            return (
              <div key={key} className="flex items-start gap-2.5 p-2.5 rounded-lg border"
                style={{ background: c.bg, borderColor: c.border }}>
                <div className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                  style={{ borderColor: c.border, color: c.text }}>{def.label[0]}</div>
                <div>
                  <p className="text-xs font-semibold" style={{ color: c.text }}>{def.label}</p>
                  <p className="text-[11px] text-[var(--text-muted)] leading-tight">{def.description}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Invite Form */}
      {canInvite && memberCount < maxMembers && invitableRoles.length > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#A855F7]" />Convidar membro
          </h2>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="flex gap-3">
              <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@empresa.com" required
                className="flex-1 bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[#A855F7] transition-colors" />
              <RoleSelect value={inviteRole} onChange={v => setInviteRole(v as Role)} availableRoles={invitableRoles} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--text-faint)] flex-1">{ROLES[inviteRole]?.description}</p>
              <button type="submit" disabled={inviting}
                className="flex items-center gap-2 bg-[#A855F7] text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-[#9333EA] disabled:opacity-50 transition-colors text-sm shrink-0">
                <Send className="w-4 h-4" />{inviting ? "Enviando..." : "Convidar"}
              </button>
            </div>
          </form>
          {inviteError && <p className="mt-2 text-sm text-[#FF4D4F] flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" />{inviteError}</p>}
          {inviteSuccess && <p className="mt-2 text-sm text-[#00D084] flex items-center gap-1.5"><Check className="w-3.5 h-3.5 shrink-0" />{inviteSuccess}</p>}
        </div>
      )}

      {/* Members List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#A855F7]" />Membros ({memberCount})
          </h2>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {data?.members.map(m => {
            const isMe       = m.user.id === currentUserId
            const isOwnerRow = m.role === "owner"
            const canEdit    = canEditRole && !isMe && !isOwnerRow
            const isEditing  = editingRole === m.user.id
            return (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 border"
                  style={{ background: ROLE_COLORS[m.role]?.bg ?? ROLE_COLORS.viewer.bg, borderColor: ROLE_COLORS[m.role]?.border ?? ROLE_COLORS.viewer.border }}>
                  <span className="text-xs font-bold" style={{ color: ROLE_COLORS[m.role]?.text ?? ROLE_COLORS.viewer.text }}>
                    {(m.user.name ?? m.user.email)[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{m.user.name ?? "—"}</p>
                    {isMe && <span className="text-[10px] text-[var(--text-faint)]">(você)</span>}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] truncate">{m.user.email}</p>
                </div>
                {canEdit ? (
                  <div className="flex items-center gap-1.5">
                    {isEditing
                      ? <span className="text-xs text-[var(--text-faint)] px-2">Salvando...</span>
                      : <><RoleSelect value={m.role} onChange={nr => handleChangeRole(m.user.id, nr)} availableRoles={invitableRoles} disabled={isEditing} /><Pencil className="w-3 h-3 text-[var(--text-faint)]" /></>
                    }
                  </div>
                ) : (
                  <RoleBadge role={m.role} />
                )}
                {canRemove && !isMe && !isOwnerRow && (
                  <button onClick={() => handleRemove(m.user.id)} disabled={removingId === m.user.id}
                    className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[#FF4D4F] hover:bg-[#FF4D4F]/10 transition-colors disabled:opacity-50" title="Remover membro">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Pending Invites */}
      {(data?.invites.length ?? 0) > 0 && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F59E0B]" />Convites pendentes ({data?.invites.length})
            </h2>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {data?.invites.map(inv => {
              const daysLeft  = Math.max(0, Math.ceil((new Date(inv.expiresAt).getTime() - Date.now()) / 86400000))
              const c         = ROLE_COLORS[inv.role] ?? ROLE_COLORS.viewer
              const roleLabel = ROLES[inv.role as Role]?.label ?? inv.role
              return (
                <div key={inv.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-9 h-9 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-[#F59E0B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{inv.email}</p>
                    <p className="text-xs text-[var(--text-muted)]">Expira em {daysLeft} dia{daysLeft !== 1 ? "s" : ""}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold border whitespace-nowrap"
                    style={{ color: c.text, background: c.bg, borderColor: c.border }}>{roleLabel}</span>
                  {canInvite && (
                    <button onClick={() => handleCancelInvite(inv.token)} disabled={cancellingToken === inv.token}
                      className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[#FF4D4F] hover:bg-[#FF4D4F]/10 transition-colors disabled:opacity-50" title="Cancelar convite">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {memberCount >= maxMembers && canInvite && (
        <div className="flex items-center gap-3 p-4 bg-[#F59E0B]/08 border border-[#F59E0B]/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <p className="text-sm text-[#F59E0B]">Limite de {maxMembers} membros atingido.</p>
        </div>
      )}
    </div>
  )
}
