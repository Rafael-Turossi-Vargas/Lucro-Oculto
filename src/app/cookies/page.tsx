import type { Metadata } from "next"
import { LegalPageWrapper, LegalSection, LegalHighlight } from "@/components/landing/LegalPageWrapper"

export const metadata: Metadata = {
  title: "Política de Cookies | Lucro Oculto",
  description: "Como o Lucro Oculto usa cookies e tecnologias similares.",
}

export default function CookiesPage() {
  return (
    <LegalPageWrapper title="Política de Cookies" lastUpdated="01 de março de 2026">
      <LegalHighlight>
        O Lucro Oculto usa apenas cookies essenciais para o funcionamento da plataforma. <strong style={{ color: "#F4F4F5" }}>Não usamos cookies de rastreamento de terceiros ou publicidade comportamental.</strong>
      </LegalHighlight>

      <LegalSection title="1. O que são Cookies?">
        <p>
          Cookies são pequenos arquivos de texto armazenados no seu navegador quando você acessa um site. Eles permitem que o site reconheça seu dispositivo em visitas futuras e mantenha informações de sessão.
        </p>
      </LegalSection>

      <LegalSection title="2. Cookies que Usamos">
        <div className="space-y-4 mt-2">
          <div className="p-4 rounded-xl" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <p className="font-semibold text-sm mb-1" style={{ color: "#00D084" }}>next-auth.session-token</p>
            <p className="text-xs" style={{ color: "#8B8FA8" }}>Tipo: Essencial · Duração: 30 dias</p>
            <p className="text-xs mt-1">Token de sessão criptografado para manter você autenticado. Sem este cookie, você precisa fazer login a cada acesso.</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <p className="font-semibold text-sm mb-1" style={{ color: "#00D084" }}>next-auth.csrf-token</p>
            <p className="text-xs" style={{ color: "#8B8FA8" }}>Tipo: Segurança · Duração: Sessão</p>
            <p className="text-xs mt-1">Proteção contra ataques CSRF (Cross-Site Request Forgery). Essencial para a segurança da sua conta.</p>
          </div>

          <div className="p-4 rounded-xl" style={{ background: "#1A1D27", border: "1px solid #2A2D3A" }}>
            <p className="font-semibold text-sm mb-1" style={{ color: "#3B82F6" }}>__stripe_mid / __stripe_sid</p>
            <p className="text-xs" style={{ color: "#8B8FA8" }}>Tipo: Pagamento · Duração: 1 ano / Sessão</p>
            <p className="text-xs mt-1">Cookies do Stripe para prevenção de fraudes em transações de pagamento. Ativados apenas na página de checkout.</p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="3. O que NÃO usamos">
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Cookies de rastreamento de comportamento (Google Analytics, Facebook Pixel)</li>
          <li>Cookies de publicidade ou retargeting</li>
          <li>Cookies de redes sociais para fins de coleta de dados</li>
          <li>Fingerprinting de dispositivo</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Como Gerenciar Cookies">
        <p>
          Você pode bloquear ou excluir cookies nas configurações do seu navegador. Porém, bloquear cookies essenciais impedirá o funcionamento correto da autenticação e você não conseguirá acessar sua conta.
        </p>
        <p className="mt-2">Guias por navegador:</p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2 text-xs">
          <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: "#00D084" }}>Google Chrome</a></li>
          <li><a href="https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" style={{ color: "#00D084" }}>Firefox</a></li>
          <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: "#00D084" }}>Safari</a></li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Contato">
        <p>
          Dúvidas sobre cookies? Entre em contato:{" "}
          <a href="mailto:privacidade@lucrooculto.com.br" style={{ color: "#00D084" }}>privacidade@lucrooculto.com.br</a>
        </p>
      </LegalSection>
    </LegalPageWrapper>
  )
}
