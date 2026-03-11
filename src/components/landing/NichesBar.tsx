const niches = [
  { label: "Agências", color: "#00D084" },
  { label: "Clínicas", color: "#3B82F6" },
  { label: "Academias", color: "#F59E0B" },
  { label: "Restaurantes", color: "#FF4D4F" },
  { label: "E-commerces", color: "#8B5CF6" },
  { label: "Escritórios", color: "#06B6D4" },
  { label: "Construtoras", color: "#F97316" },
  { label: "Imobiliárias", color: "#10B981" },
  { label: "Franquias", color: "#EC4899" },
  { label: "Clínicas Odonto", color: "#3B82F6" },
  { label: "Transportadoras", color: "#F59E0B" },
  { label: "Contabilidades", color: "#00D084" },
]

export function NichesBar() {
  const doubled = [...niches, ...niches]

  return (
    <>
      <style>{`
        @keyframes marquee-fwd {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-fwd {
          animation: marquee-fwd 36s linear infinite;
          display: flex;
          width: max-content;
        }
        .marquee-fwd:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div
        style={{
          background: "#0F1117",
          borderTop: "1px solid #1E2130",
          borderBottom: "1px solid #1E2130",
          paddingTop: "18px",
          paddingBottom: "18px",
        }}
      >
        {/* Label */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, #2A2D3A)" }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#4B4F6A" }}
          >
            Usado por PMEs em
          </span>
          <div className="h-px w-12" style={{ background: "linear-gradient(90deg, #2A2D3A, transparent)" }} />
        </div>

        {/* Marquee with fade masks */}
        <div className="relative overflow-hidden">
          {/* Left fade */}
          <div
            className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #0F1117 0%, transparent 100%)" }}
          />
          {/* Right fade */}
          <div
            className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(270deg, #0F1117 0%, transparent 100%)" }}
          />

          <div className="marquee-fwd">
            {doubled.map((n, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-2 mx-2 shrink-0 px-4 py-2 rounded-full text-xs font-medium"
                style={{
                  background: `${n.color}0D`,
                  border: `1px solid ${n.color}28`,
                  color: "#D4D4D8",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{
                    background: n.color,
                    boxShadow: `0 0 6px ${n.color}`,
                  }}
                />
                {n.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
