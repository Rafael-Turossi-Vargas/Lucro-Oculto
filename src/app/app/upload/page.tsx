import { FileUploader } from "@/components/upload/FileUploader"
import { AccessGuard } from "@/components/auth/AccessGuard"
import { FileText, Shield, Zap, TrendingUp } from "lucide-react"

const FEATURES = [
  {
    icon: Zap,
    color: "#F59E0B",
    title: "Análise em segundos",
    desc: "Engine financeira com IA processa centenas de transações automaticamente.",
  },
  {
    icon: Shield,
    color: "#3B82F6",
    title: "100% privado",
    desc: "Seus dados ficam apenas no seu servidor. Nunca compartilhamos com terceiros.",
  },
  {
    icon: FileText,
    color: "#8B5CF6",
    title: "CSV e XLSX",
    desc: "Compatível com exportações de qualquer banco ou planilha financeira.",
  },
  {
    icon: TrendingUp,
    color: "#00D084",
    title: "Insights acionáveis",
    desc: "Receba vazamentos, alertas e um plano de ação pronto para executar.",
  },
]

export default function UploadPage() {
  return (
    <AccessGuard permission="upload:create">
      <div className="px-6 py-10 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-black mb-1" style={{ color: "#F4F4F5" }}>
            Nova análise financeira
          </h1>
          <p className="text-sm" style={{ color: "#8B8FA8" }}>
            Faça upload do extrato bancário para descobrir onde seu dinheiro está indo.
          </p>
        </div>

        {/* Uploader */}
        <FileUploader />

        {/* Features grid */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="rounded-xl p-4 flex items-start gap-3"
              style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
              <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ background: `${color}14` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-semibold mb-0.5" style={{ color: "#F4F4F5" }}>{title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccessGuard>
  )
}
