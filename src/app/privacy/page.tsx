import type { Metadata } from "next"
import { LegalPageWrapper, LegalSection, LegalHighlight } from "@/components/landing/LegalPageWrapper"

export const metadata: Metadata = {
  title: "Política de Privacidade | Lucro Oculto",
  description: "Como o Lucro Oculto coleta, usa e protege seus dados financeiros — em conformidade com a LGPD.",
}

export default function PrivacyPage() {
  return (
    <LegalPageWrapper title="Política de Privacidade" lastUpdated="01 de março de 2026">
      <LegalHighlight>
        Esta Política descreve como coletamos, usamos e protegemos seus dados em conformidade com a <strong style={{ color: "#F4F4F5" }}>Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</strong>. Levamos sua privacidade financeira muito a sério.
      </LegalHighlight>

      <LegalSection title="1. Dados que Coletamos">
        <p><strong style={{ color: "#F4F4F5" }}>Dados de cadastro:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li>Nome completo, email e senha (hash bcrypt)</li>
          <li>Nome e CNPJ da empresa (opcional)</li>
          <li>Nicho de atuação e faturamento estimado (para calibrar benchmarks)</li>
        </ul>

        <p className="mt-3"><strong style={{ color: "#F4F4F5" }}>Dados financeiros (fornecidos por você):</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li>Extratos bancários e planilhas de despesas em CSV/XLSX</li>
          <li>Dados de transações: data, descrição, valor e categoria</li>
        </ul>

        <p className="mt-3"><strong style={{ color: "#F4F4F5" }}>Dados de uso:</strong></p>
        <ul className="list-disc list-inside space-y-1 mt-1 ml-2">
          <li>Logs de acesso (IP, data/hora, ações realizadas)</li>
          <li>Preferências de notificação e configurações de conta</li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Como Usamos Seus Dados">
        <p>Usamos seus dados exclusivamente para:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li><strong style={{ color: "#F4F4F5" }}>Fornecer o serviço:</strong> processar e analisar seus extratos para gerar diagnóstico financeiro</li>
          <li><strong style={{ color: "#F4F4F5" }}>Comunicação:</strong> enviar resultados de análises, alertas e atualizações do serviço</li>
          <li><strong style={{ color: "#F4F4F5" }}>Cobrança:</strong> processar pagamentos via Stripe (não armazenamos dados de cartão)</li>
          <li><strong style={{ color: "#F4F4F5" }}>Segurança:</strong> detectar e prevenir fraudes, acessos não autorizados e abuso</li>
          <li><strong style={{ color: "#F4F4F5" }}>Melhoria do produto:</strong> análise agregada e anônima de padrões de uso</li>
        </ul>
        <p className="mt-2">
          <strong style={{ color: "#FF4D4F" }}>Não vendemos, alugamos ou compartilhamos seus dados financeiros com terceiros para fins publicitários ou comerciais.</strong>
        </p>
      </LegalSection>

      <LegalSection title="3. Base Legal (LGPD)">
        <p>Processamos seus dados com base nas seguintes hipóteses previstas na LGPD:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li><strong style={{ color: "#F4F4F5" }}>Execução de contrato</strong> — para prestar o serviço contratado</li>
          <li><strong style={{ color: "#F4F4F5" }}>Legítimo interesse</strong> — para segurança, prevenção de fraudes e melhoria do produto</li>
          <li><strong style={{ color: "#F4F4F5" }}>Consentimento</strong> — para comunicações de marketing (você pode revogar a qualquer momento)</li>
          <li><strong style={{ color: "#F4F4F5" }}>Obrigação legal</strong> — para cumprimento de exigências regulatórias</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Segurança dos Dados">
        <p>Adotamos medidas técnicas e organizacionais de segurança:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Criptografia em trânsito via HTTPS/TLS 1.3</li>
          <li>Criptografia em repouso via AES-256</li>
          <li>Senhas armazenadas com hash bcrypt (fator 12)</li>
          <li>Infraestrutura em data centers com certificação ISO 27001</li>
          <li>Acesso aos dados restrito a colaboradores com necessidade justificada</li>
          <li>Logs de acesso monitorados e auditados</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Compartilhamento com Terceiros">
        <p>Compartilhamos dados apenas com prestadores de serviço essenciais à operação:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li><strong style={{ color: "#F4F4F5" }}>Stripe</strong> — processamento de pagamentos (não vê seus dados financeiros)</li>
          <li><strong style={{ color: "#F4F4F5" }}>Resend</strong> — envio de emails transacionais</li>
          <li><strong style={{ color: "#F4F4F5" }}>Anthropic</strong> — motor de análise de IA (apenas dados necessários para análise, sem identificação)</li>
          <li><strong style={{ color: "#F4F4F5" }}>Neon/Vercel</strong> — hospedagem de banco de dados e infraestrutura cloud</li>
        </ul>
        <p className="mt-2">Todos os parceiros são vinculados por acordos de processamento de dados compatíveis com a LGPD/GDPR.</p>
      </LegalSection>

      <LegalSection title="6. Seus Direitos (LGPD, Art. 18)">
        <p>Como titular dos dados, você tem direito a:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Confirmar a existência de tratamento dos seus dados</li>
          <li>Acessar seus dados (via painel em Configurações → Exportar Dados)</li>
          <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
          <li>Solicitar anonimização, bloqueio ou eliminação dos dados</li>
          <li>Portabilidade dos dados para outro serviço</li>
          <li>Revogar consentimento a qualquer momento</li>
          <li>Excluir sua conta e todos os dados (Configurações → Excluir Conta)</li>
        </ul>
        <p className="mt-2">
          Para exercer qualquer desses direitos, acesse as <a href="/app/settings" style={{ color: "#00D084" }}>Configurações</a> ou envie email para{" "}
          <a href="mailto:privacidade@lucrooculto.com.br" style={{ color: "#00D084" }}>privacidade@lucrooculto.com.br</a>.
          Respondemos em até 15 dias úteis.
        </p>
      </LegalSection>

      <LegalSection title="7. Retenção de Dados">
        <p>
          Mantemos seus dados enquanto sua conta estiver ativa. Após o cancelamento ou exclusão da conta:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Dados financeiros são excluídos em até 30 dias</li>
          <li>Logs de acesso são retidos por 90 dias para fins de segurança</li>
          <li>Dados de cobrança são mantidos pelo período exigido pela legislação fiscal (5 anos)</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Cookies">
        <p>
          Usamos cookies essenciais para autenticação e funcionamento da plataforma. Consulte nossa{" "}
          <a href="/cookies" style={{ color: "#00D084" }}>Política de Cookies</a> para detalhes.
        </p>
      </LegalSection>

      <LegalSection title="9. Contato e DPO">
        <p>
          Para questões de privacidade e proteção de dados, entre em contato com nosso Encarregado de Dados (DPO):
        </p>
        <p className="mt-2">
          📧 <a href="mailto:privacidade@lucrooculto.com.br" style={{ color: "#00D084" }}>privacidade@lucrooculto.com.br</a><br />
          🌐 <a href="/contact" style={{ color: "#00D084" }}>Formulário de contato</a>
        </p>
      </LegalSection>
    </LegalPageWrapper>
  )
}
