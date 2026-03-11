import { FileUploader } from "@/components/upload/FileUploader"
import { AccessGuard } from "@/components/auth/AccessGuard"
import { FileText, Shield, Zap } from "lucide-react"

const FEATURES = [
  { icon: Zap, title: "Análise em segundos", desc: "Engine financeira processa centenas de transações automaticamente." },
  { icon: Shield, title: "100% privado", desc: "Seus dados ficam apenas no seu servidor. Nunca compartilhamos com terceiros." },
  { icon: FileText, title: "CSV e XLSX", desc: "Compatível com qualquer banco ou planilha financeira." },
]

export default function UploadPage() {
  return (
    <AccessGuard permission="upload:create">
    <div className="px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-black mb-1" style={{ color: "#F4F4F5" }}>
          Nova análise financeira
        </h1>
        <p className="text-sm" style={{ color: "#8B8FA8" }}>
          Faça upload do extrato bancário para descobrir onde seu dinheiro está indo.
        </p>
      </div>

      <FileUploader />

      <div className="grid grid-cols-3 gap-4 mt-8">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl p-4" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <Icon className="w-5 h-5 mb-3" style={{ color: "#00D084" }} />
            <p className="text-sm font-semibold mb-1" style={{ color: "#F4F4F5" }}>{title}</p>
            <p className="text-xs leading-relaxed" style={{ color: "#8B8FA8" }}>{desc}</p>
          </div>
        ))}
      </div>
    </div>
    </AccessGuard>
  )
}
