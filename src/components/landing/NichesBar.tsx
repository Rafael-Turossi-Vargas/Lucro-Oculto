const niches = [
  { emoji: "🎨", label: "Agências" },
  { emoji: "🏥", label: "Clínicas" },
  { emoji: "🏋️", label: "Academias" },
  { emoji: "🍽️", label: "Restaurantes" },
  { emoji: "📦", label: "E-commerces" },
  { emoji: "⚖️", label: "Escritórios" },
  { emoji: "🏗️", label: "Construtoras" },
  { emoji: "🔑", label: "Imobiliárias" },
]

export function NichesBar() {
  return (
    <div style={{ background: "#1A1D27", borderTop: "1px solid #2A2D3A", borderBottom: "1px solid #2A2D3A" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <span className="text-xs font-medium shrink-0" style={{ color: "#4B4F6A" }}>
            Usado por PMEs em:
          </span>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {niches.map((n) => (
              <span
                key={n.label}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                style={{ background: "#212435", border: "1px solid #2A2D3A", color: "#8B8FA8" }}
              >
                <span>{n.emoji}</span>
                {n.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
