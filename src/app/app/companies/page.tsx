"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { Building2, Plus, Check, AlertCircle, Loader2, X, Trash2, Clock, ShieldAlert } from "lucide-react"
import { can } from "@/lib/roles"
import { AccessGuard } from "@/components/auth/AccessGuard"

type OrgSummary = {
  id: string
  name: string
  slug: string
  plan: string
  cnpj: string | null
  niche: string | null
  createdAt: string
}

type MembershipEntry = {
  id: string
  role: string
  organization: OrgSummary
}

type OrgsData = {
  memberships: MembershipEntry[]
  currentOrgId: string
  maxOrgs: number
  cooldownUntil: string | null
  cooldownHours: number
}

function PlanBadge({ plan }: { plan: string }) {
  const map: Record<string, { label: string; color: string }> = {
    premium: { label: "Premium", color: "#A855F7" },
    pro: { label: "Pro", color: "#F59E0B" },
    free: { label: "Grátis", color: "var(--text-faint)" },
    admin: { label: "Admin", color: "#3B82F6" },
  }
  const { label, color } = map[plan] ?? { label: plan, color: "var(--text-faint)" }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
      style={{ color, background: `${color}18`, borderColor: `${color}30` }}>
      {label}
    </span>
  )
}

function CooldownBanner({ cooldownUntil, cooldownHours }: { cooldownUntil: string; cooldownHours: number }) {
  const [timeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    const update = () => {
      const ms = new Date(cooldownUntil).getTime() - Date.now()
      if (ms <= 0) { setTimeLeft(""); return }
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      setTimeLeft(`${h}h ${m}min`)
    }
    update()
    const interval = setInterval(update, 30000)
    return () => clearInterval(interval)
  }, [cooldownUntil])

  if (!timeLeft) return null

  return (
    <div className="flex items-start gap-3 p-4 bg-[#FF4D4F]/08 border border-[#FF4D4F]/25 rounded-xl">
      <ShieldAlert className="w-5 h-5 text-[#FF4D4F] shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-[#FF4D4F]">Criação de nova empresa bloqueada</p>
        <p className="text-xs text-[#FF4D4F]/80 mt-0.5">
          Você excluiu uma empresa quando estava no limite de 3. Por segurança,
          aguarde <strong>{timeLeft}</strong> antes de cadastrar uma nova.
        </p>
        <p className="text-xs text-[var(--text-faint)] mt-1">Política de cooldown: {cooldownHours}h após exclusão no limite máximo</p>
      </div>
    </div>
  )
}

function DeleteConfirmModal({
  orgName,
  isActive,
  onConfirm,
  onClose,
  atLimit,
  cooldownHours,
}: {
  orgName: string
  isActive: boolean
  onConfirm: () => void
  onClose: () => void
  atLimit: boolean
  cooldownHours: number
}) {
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-[var(--bg-card)] border border-[#FF4D4F]/30 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#FF4D4F]/10 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-[#FF4D4F]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">Excluir empresa</h2>
            <p className="text-xs text-[var(--text-muted)]">Esta ação não pode ser desfeita</p>
          </div>
        </div>

        {isActive && (
          <div className="mb-4 p-3 bg-[#F59E0B]/08 border border-[#F59E0B]/20 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <p className="text-xs text-[#F59E0B]">
              Esta é sua empresa ativa. Troque para outra empresa antes de excluí-la.
            </p>
          </div>
        )}

        <div className="bg-[var(--bg-subtle)] border border-[var(--border)] rounded-xl p-4 mb-5 space-y-2 text-sm text-[var(--text-muted)]">
          <p>⚠️ Todos os dados de <strong className="text-[var(--text-primary)]">{orgName}</strong> serão arquivados.</p>
          {atLimit && (
            <p>⏱️ Como você está no limite de 3 empresas, precisará aguardar <strong className="text-[#FF4D4F]">{cooldownHours} horas</strong> para criar uma nova.</p>
          )}
          <p>👥 Os membros da equipe desta empresa perderão acesso.</p>
          <p>🔒 Convites pendentes serão cancelados automaticamente.</p>
        </div>

        <div className="mb-5">
          <label className="block text-xs text-[var(--text-muted)] mb-2">
            Digite <strong className="text-[var(--text-primary)]">EXCLUIR</strong> para confirmar
          </label>
          <input
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="EXCLUIR"
            disabled={isActive}
            className="w-full bg-[var(--bg-page)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[#FF4D4F] transition-colors disabled:opacity-50"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirm !== "EXCLUIR" || isActive || loading}
            className="flex-1 py-2.5 rounded-lg bg-[#FF4D4F] text-white font-semibold hover:bg-[#e53935] disabled:opacity-40 transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Excluir empresa
          </button>
        </div>
      </div>
    </div>
  )
}

function NewOrgModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [name, setName] = useState("")
  const [cnpj, setCnpj] = useState("")
  const [niche, setNiche] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/api/app/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, cnpj: cnpj || undefined, niche: niche || undefined }),
    })
    const result = await res.json()
    setLoading(false)
    if (!res.ok) { setError(result.error ?? "Erro ao criar empresa"); return }
    onCreated()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Nova empresa</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--text-faint)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Nome da empresa *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              required minLength={2}
              placeholder="Minha Empresa Ltda"
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[#A855F7] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">CNPJ</label>
            <input
              value={cnpj}
              onChange={e => setCnpj(e.target.value)}
              placeholder="00.000.000/0000-00"
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[#A855F7] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-1.5">Segmento</label>
            <input
              value={niche}
              onChange={e => setNiche(e.target.value)}
              placeholder="Varejo, Serviços, Tecnologia..."
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-faint)] focus:outline-none focus:border-[#A855F7] transition-colors"
            />
          </div>
          {error && (
            <p className="text-sm text-[#FF4D4F] flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors text-sm font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-[#A855F7] text-white font-semibold hover:bg-[#9333EA] disabled:opacity-50 transition-colors text-sm flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CompaniesContent() {
  const { data: session, update } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const role = session?.user?.role ?? ""

  const [data, setData] = useState<OrgsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [switching, setSwitching] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<OrgSummary | null>(null)
  const [deleteError, setDeleteError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/app/organizations")
    if (!res.ok) { setError("Erro ao carregar empresas"); setLoading(false); return }
    setData(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleSwitch = async (orgId: string) => {
    if (orgId === data?.currentOrgId) return
    setSwitching(orgId)
    await fetch("/api/app/switch-org", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationId: orgId }),
    })
    await update({ organizationId: orgId })
    setSwitching(null)
    window.location.reload()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleteError("")
    const res = await fetch(`/api/app/organizations/${deleteTarget.id}`, { method: "DELETE" })
    const result = await res.json()
    if (!res.ok) {
      setDeleteError(result.error ?? "Erro ao excluir empresa")
      return
    }
    setDeleteTarget(null)
    await load()
  }

  if (plan !== "premium" && plan !== "admin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-[#A855F7]/15 flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#A855F7]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Recurso Premium</h2>
          <p className="text-[var(--text-muted)] mb-6">Gerencie até 3 empresas com o plano Premium.</p>
          <a href="/app/settings#upgrade"
            className="inline-block bg-[#A855F7] text-white font-semibold px-6 py-3 rounded-lg hover:bg-[#9333EA] transition-colors">
            Fazer upgrade para Premium
          </a>
        </div>
      </div>
    )
  }

  if (loading) return (
    <div className="p-6 space-y-4 animate-pulse">
      {[1, 2].map(i => <div key={i} className="h-24 rounded-xl bg-[var(--bg-subtle)]" />)}
    </div>
  )

  if (error) return (
    <div className="p-6">
      <div className="flex items-center gap-3 p-4 bg-[#FF4D4F]/10 border border-[#FF4D4F]/25 rounded-xl text-[#FF4D4F]">
        <AlertCircle className="w-5 h-5 shrink-0" />{error}
      </div>
    </div>
  )

  const ownedActive = data?.memberships.filter(m => m.role === "owner") ?? []
  const maxOrgs = data?.maxOrgs ?? 3
  const cooldownActive = !!data?.cooldownUntil
  const atLimit = ownedActive.length >= maxOrgs
  const canCreate = can(role, "companies:manage") && !atLimit && !cooldownActive

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Empresas</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {ownedActive.length}/{maxOrgs} empresas cadastradas · Plano Premium
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#A855F7] text-white font-semibold px-4 py-2.5 rounded-lg hover:bg-[#9333EA] transition-colors text-sm shrink-0"
          >
            <Plus className="w-4 h-4" />
            Nova empresa
          </button>
        )}
      </div>

      {/* Cooldown warning */}
      {cooldownActive && data?.cooldownUntil && (
        <CooldownBanner cooldownUntil={data.cooldownUntil} cooldownHours={data.cooldownHours} />
      )}

      {/* Companies List */}
      <div className="space-y-3">
        {data?.memberships.map(m => {
          const org = m.organization
          const isCurrent = org.id === data.currentOrgId
          const isOwner = m.role === "owner"
          const canDelete = isOwner && ownedActive.length > 1
          const isSwitching = switching === org.id

          return (
            <div key={m.id}
              className={`bg-[var(--bg-card)] border rounded-2xl p-5 transition-all ${
                isCurrent
                  ? "border-[#A855F7]/40 shadow-[0_0_0_1px_rgba(168,85,247,0.12)]"
                  : "border-[var(--border)]"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  isCurrent ? "bg-[#A855F7]/15 border border-[#A855F7]/30" : "bg-[var(--bg-subtle)] border border-[var(--border)]"
                }`}>
                  <Building2 className={`w-5 h-5 ${isCurrent ? "text-[#A855F7]" : "text-[var(--text-faint)]"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-semibold text-[var(--text-primary)]">{org.name}</h3>
                    <PlanBadge plan={org.plan} />
                    {isCurrent && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/25 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ativa
                      </span>
                    )}
                  </div>
                  {org.cnpj && <p className="text-xs text-[var(--text-muted)] mt-0.5">CNPJ: {org.cnpj}</p>}
                  {org.niche && <p className="text-xs text-[var(--text-faint)] mt-0.5">{org.niche}</p>}
                  <p className="text-[10px] text-[var(--text-faint)] mt-1">
                    Criada em {new Date(org.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isCurrent && (
                    <button
                      onClick={() => handleSwitch(org.id)}
                      disabled={!!switching}
                      className="flex items-center gap-1.5 text-sm font-medium text-[#A855F7] border border-[#A855F7]/30 px-3 py-1.5 rounded-lg hover:bg-[#A855F7]/08 disabled:opacity-50 transition-colors"
                    >
                      {isSwitching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      {isSwitching ? "Trocando..." : "Ativar"}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => { setDeleteError(""); setDeleteTarget(org) }}
                      title="Excluir empresa"
                      className="p-2 rounded-lg text-[var(--text-faint)] hover:text-[#FF4D4F] hover:bg-[#FF4D4F]/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Alerta de cooldown futuro ao excluir no limite */}
              {isOwner && atLimit && !cooldownActive && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#F59E0B]/80 border-t border-[var(--border)] pt-3">
                  <Clock className="w-3.5 h-3.5 shrink-0 text-[#F59E0B]" />
                  Excluir uma empresa agora gerará cooldown de {data?.cooldownHours}h para criar outra.
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Limite atingido */}
      {atLimit && !cooldownActive && (
        <div className="flex items-center gap-3 p-4 bg-[#F59E0B]/08 border border-[#F59E0B]/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <p className="text-sm text-[#F59E0B]">
            Limite de {maxOrgs} empresas atingido. Exclua uma para criar outra (cooldown de {data?.cooldownHours}h será aplicado).
          </p>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <NewOrgModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); load() }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          orgName={deleteTarget.name}
          isActive={deleteTarget.id === data?.currentOrgId}
          onConfirm={handleDelete}
          onClose={() => { setDeleteTarget(null); setDeleteError("") }}
          atLimit={atLimit}
          cooldownHours={data?.cooldownHours ?? 72}
        />
      )}

      {/* Toast de erro na exclusão */}
      {deleteError && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--bg-card)] border border-[#FF4D4F]/40 rounded-xl shadow-xl max-w-sm">
          <AlertCircle className="w-4 h-4 text-[#FF4D4F] shrink-0" />
          <span className="text-sm text-[#FF4D4F] flex-1">{deleteError}</span>
          <button onClick={() => setDeleteError("")} className="text-[var(--text-faint)] hover:text-[var(--text-primary)]">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

export default function CompaniesPage() {
  return (
    <AccessGuard permission="companies:manage">
      <CompaniesContent />
    </AccessGuard>
  )
}
