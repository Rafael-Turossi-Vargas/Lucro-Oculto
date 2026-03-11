import type { Metadata } from "next"
import { CheckCircle } from "lucide-react"

export const metadata: Metadata = { title: "Status do Sistema" }

const services = [
  { name: "API Principal", status: "operational", latency: "42ms" },
  { name: "Processamento de Arquivos", status: "operational", latency: "1.2s" },
  { name: "Motor de Análise IA", status: "operational", latency: "3.4s" },
  { name: "Banco de Dados", status: "operational", latency: "8ms" },
  { name: "Armazenamento de Arquivos", status: "operational", latency: "95ms" },
  { name: "Envio de Emails", status: "operational", latency: "210ms" },
]

export default function StatusPage() {
  const allOperational = services.every(s => s.status === "operational")
  return (
    <div className="min-h-screen" style={{ background: "#0F1117" }}>
      <div className="px-6 py-16 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: "rgba(0,208,132,0.10)", border: "1px solid rgba(0,208,132,0.2)" }}>
            <CheckCircle className="w-5 h-5" style={{ color: "#00D084" }} />
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#F4F4F5" }}>Status do Sistema</h1>
            <p className="text-xs" style={{ color: "#8B8FA8" }}>Lucro Oculto — lucrooculto.com.br</p>
          </div>
        </div>

        <div className="rounded-2xl p-5 mb-6 mt-8" style={{ background: allOperational ? "rgba(0,208,132,0.06)" : "rgba(255,77,79,0.06)", border: `1px solid ${allOperational ? "rgba(0,208,132,0.2)" : "rgba(255,77,79,0.2)"}` }}>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ background: allOperational ? "#00D084" : "#FF4D4F" }} />
            <p className="font-bold text-base" style={{ color: allOperational ? "#00D084" : "#FF4D4F" }}>
              {allOperational ? "Todos os sistemas operacionais" : "Degradação parcial detectada"}
            </p>
          </div>
          <p className="text-xs mt-1 ml-6" style={{ color: "#8B8FA8" }}>
            Atualizado em {new Date().toLocaleString("pt-BR")}
          </p>
        </div>

        <div className="space-y-2">
          {services.map(svc => (
            <div key={svc.name} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ background: svc.status === "operational" ? "#00D084" : "#FF4D4F" }} />
                <span className="text-sm" style={{ color: "#F4F4F5" }}>{svc.name}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono" style={{ color: "#4B4F6A" }}>{svc.latency}</span>
                <span className="text-xs font-medium" style={{ color: svc.status === "operational" ? "#00D084" : "#FF4D4F" }}>
                  {svc.status === "operational" ? "Operacional" : "Degradado"}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-10" style={{ color: "#4B4F6A" }}>
          Uptime nos últimos 90 dias: <span style={{ color: "#00D084", fontWeight: 700 }}>99.9%</span>
        </p>
      </div>
    </div>
  )
}
