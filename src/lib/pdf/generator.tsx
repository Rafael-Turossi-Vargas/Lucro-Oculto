import React from "react"
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer"

const C = {
  bg: "#0F1117",
  card: "#1A1D27",
  border: "#2A2D3A",
  green: "#00D084",
  red: "#FF4D4F",
  amber: "#F59E0B",
  blue: "#3B82F6",
  text: "#F4F4F5",
  muted: "#8B8FA8",
  dim: "#4B4F6A",
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: C.bg,
    padding: 40,
    fontFamily: "Helvetica",
    color: C.text,
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  brand: { color: C.green, fontSize: 16, fontFamily: "Helvetica-Bold" },
  brandSub: { color: C.muted, fontSize: 8, marginTop: 2 },
  metaText: { color: C.muted, fontSize: 8, textAlign: "right" },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: C.muted,
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  kpiGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    padding: 12,
  },
  kpiLabel: { color: C.dim, fontSize: 8, marginBottom: 4 },
  kpiValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  scoreBig: { fontSize: 48, fontFamily: "Helvetica-Bold", color: C.green },
  scoreLabel: { color: C.muted, fontSize: 10, marginBottom: 4 },
  scoreDesc: { color: C.text, fontSize: 12, fontFamily: "Helvetica-Bold" },
  itemTitle: { color: C.text, fontSize: 10, fontFamily: "Helvetica-Bold", marginBottom: 3 },
  itemDesc: { color: C.muted, fontSize: 8, lineHeight: 1.5 },
  badge: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  amountRed: { color: C.red, fontSize: 11, fontFamily: "Helvetica-Bold" },
  amountGreen: { color: C.green, fontSize: 11, fontFamily: "Helvetica-Bold" },
  stepNum: {
    width: 20,
    height: 20,
    backgroundColor: "#212435",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepNumText: { color: C.dim, fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 8,
  },
  footerText: { color: C.dim, fontSize: 7 },
})

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v)
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
}

type Insight = {
  id: string
  type: string
  title: string
  description: string
  impact: string
  amount: string | null
}

type Alert = {
  id: string
  severity: string
  title: string
  message: string
  amount: string | null
}

type Recommendation = {
  id: string
  title: string
  description: string
  urgency: string | null
  savingsEstimate: string | null
  priority: number
}

export type PdfReportData = {
  orgName: string
  fileName: string
  score: number
  totalExpenses: string
  totalIncome: string
  netResult: string
  savingsMin: string
  savingsMax: string
  periodStart: string | null
  periodEnd: string | null
  rowsCount: number | null
  insights: Insight[]
  alerts: Alert[]
  recommendations: Recommendation[]
  generatedAt: string
}

function ScoreColor(score: number) {
  return score >= 75 ? C.green : score >= 50 ? C.amber : C.red
}

function ScoreLabel(score: number) {
  return score >= 75 ? "Eficiência Boa" : score >= 50 ? "Atenção Necessária" : "Situação Crítica"
}

function ImpactColor(impact: string) {
  return impact === "high" ? C.red : impact === "medium" ? C.amber : C.muted
}

function ImpactLabel(impact: string) {
  return impact === "high" ? "Alto" : impact === "medium" ? "Médio" : "Baixo"
}

function SevColor(sev: string) {
  return sev === "critical" ? C.red : sev === "warning" ? C.amber : C.blue
}

const ReportDocument = ({ data }: { data: PdfReportData }) => {
  const leaks = data.insights.filter(i => i.type === "leak")
  const opps = data.insights.filter(i => i.type === "opportunity")
  const scoreColor = ScoreColor(data.score)

  const period = data.periodStart
    ? `${fmtDate(data.periodStart)} — ${fmtDate(data.periodEnd ?? data.periodStart)}`
    : null

  return (
    <Document title={`Relatório Lucro Oculto — ${data.orgName}`}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Lucro Oculto</Text>
            <Text style={styles.brandSub}>Diagnóstico de Eficiência Financeira</Text>
          </View>
          <View>
            <Text style={styles.metaText}>{data.orgName}</Text>
            {period && <Text style={styles.metaText}>{period}</Text>}
            <Text style={styles.metaText}>Gerado em {data.generatedAt}</Text>
          </View>
        </View>

        {/* Score + KPIs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Score de Eficiência</Text>
          <View style={styles.scoreRow}>
            <View>
              <Text style={[styles.scoreBig, { color: scoreColor }]}>{data.score}</Text>
              <Text style={[styles.scoreLabel, { color: scoreColor }]}>/ 100</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.scoreDesc}>{ScoreLabel(data.score)}</Text>
              <Text style={[styles.itemDesc, { marginTop: 4 }]}>
                {data.fileName}
                {data.rowsCount ? ` · ${data.rowsCount.toLocaleString("pt-BR")} transações` : ""}
              </Text>
              <Text style={[styles.itemDesc, { marginTop: 2, color: C.green }]}>
                Economia estimada: {fmt(Number(data.savingsMin))} – {fmt(Number(data.savingsMax))}/mês
              </Text>
            </View>
          </View>
          <View style={styles.kpiGrid}>
            {[
              { label: "Total de Despesas", value: fmt(Number(data.totalExpenses)), color: C.red },
              { label: "Total de Receitas", value: fmt(Number(data.totalIncome)), color: C.green },
              { label: "Resultado Líquido", value: fmt(Number(data.netResult)), color: Number(data.netResult) >= 0 ? C.green : C.red },
            ].map(kpi => (
              <View key={kpi.label} style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <Text style={[styles.kpiValue, { color: kpi.color }]}>{kpi.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Leaks */}
        {leaks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vazamentos Financeiros ({leaks.length})</Text>
            {leaks.map(leak => (
              <View key={leak.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.badge, { backgroundColor: `${ImpactColor(leak.impact)}20`, color: ImpactColor(leak.impact) }]}>
                      {ImpactLabel(leak.impact)}
                    </Text>
                    <Text style={styles.itemTitle}>{leak.title}</Text>
                    <Text style={styles.itemDesc}>{leak.description}</Text>
                  </View>
                  {leak.amount && (
                    <Text style={styles.amountRed}>−{fmt(Number(leak.amount))}/mês</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Opportunities */}
        {opps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Oportunidades ({opps.length})</Text>
            {opps.map(opp => (
              <View key={opp.id} style={styles.card}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{opp.title}</Text>
                    <Text style={styles.itemDesc}>{opp.description}</Text>
                  </View>
                  {opp.amount && (
                    <Text style={styles.amountGreen}>+{fmt(Number(opp.amount))}/mês</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Lucro Oculto — Confidencial</Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>

      {/* Page 2: Alerts + Action Plan */}
      {(data.alerts.length > 0 || data.recommendations.length > 0) && (
        <Page size="A4" style={styles.page}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.brand}>Lucro Oculto</Text>
            <Text style={styles.metaText}>{data.orgName}</Text>
          </View>

          {/* Alerts */}
          {data.alerts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Alertas ({data.alerts.length})</Text>
              {data.alerts.map(alert => (
                <View key={alert.id} style={[styles.card, { borderColor: `${SevColor(alert.severity)}40` }]}>
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemTitle, { color: SevColor(alert.severity) }]}>{alert.title}</Text>
                      <Text style={styles.itemDesc}>{alert.message}</Text>
                    </View>
                    {alert.amount && (
                      <Text style={[styles.kpiValue, { color: SevColor(alert.severity) }]}>
                        {fmt(Number(alert.amount))}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Action Plan */}
          {data.recommendations.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Plano de Ação ({data.recommendations.length})</Text>
              {data.recommendations.map((rec, i) => (
                <View key={rec.id} style={[styles.card, { flexDirection: "row", alignItems: "flex-start" }]}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.row}>
                      <Text style={[styles.itemTitle, { flex: 1 }]}>{rec.title}</Text>
                      {rec.savingsEstimate && (
                        <Text style={styles.amountGreen}>+{fmt(Number(rec.savingsEstimate))}/mês</Text>
                      )}
                    </View>
                    <Text style={styles.itemDesc}>{rec.description}</Text>
                    {rec.urgency && (
                      <Text style={[styles.badge, { marginTop: 4, backgroundColor: rec.urgency === "immediate" ? "rgba(255,77,79,0.1)" : "rgba(245,158,11,0.1)", color: rec.urgency === "immediate" ? C.red : C.amber }]}>
                        {rec.urgency === "immediate" ? "Imediato" : rec.urgency === "soon" ? "Em breve" : "Monitorar"}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer} fixed>
            <Text style={styles.footerText}>Lucro Oculto — Confidencial</Text>
            <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
          </View>
        </Page>
      )}
    </Document>
  )
}

export async function generateAnalysisPdf(data: PdfReportData): Promise<Buffer> {
  const buffer = await renderToBuffer(<ReportDocument data={data} />)
  return Buffer.from(buffer)
}
