import type { Metadata } from "next"
import { LegalPageWrapper, LegalSection, LegalHighlight } from "@/components/landing/LegalPageWrapper"

export const metadata: Metadata = {
  title: "Política de Reembolso | Lucro Oculto",
  description: "Política de cancelamento e reembolso do Lucro Oculto.",
}

export default function RefundPage() {
  return (
    <LegalPageWrapper title="Política de Reembolso" lastUpdated="01 de março de 2026">
      <LegalHighlight>
        Nossa política de reembolso foi criada para ser justa e transparente. Queremos que você tenha total confiança ao assinar qualquer plano do Lucro Oculto.
      </LegalHighlight>

      <LegalSection title="1. Período de Teste Gratuito">
        <p>
          Os planos <strong style={{ color: "#F4F4F5" }}>Pro</strong> e <strong style={{ color: "#F4F4F5" }}>Premium</strong> incluem um período de teste gratuito de <strong style={{ color: "#F4F4F5" }}>7 (sete) dias</strong> sem cobrança.
        </p>
        <p className="mt-3">
          Durante o período de teste, você pode cancelar a assinatura a qualquer momento sem nenhum custo. Nenhum valor será cobrado no seu cartão de crédito até o término do período de teste.
        </p>
        <p className="mt-3">
          Para cancelar durante o teste, acesse: <strong style={{ color: "#F4F4F5" }}>Configurações → Plano e Cobrança → Cancelar assinatura</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Garantia de Satisfação (7 dias após a 1ª cobrança)">
        <p>
          Se você foi cobrado e não ficou satisfeito com o serviço, oferecemos reembolso integral da primeira mensalidade, desde que solicitado em até <strong style={{ color: "#F4F4F5" }}>7 (sete) dias corridos</strong> após a data da primeira cobrança.
        </p>
        <p className="mt-3">
          Para solicitar o reembolso, envie um email para{" "}
          <a href="mailto:suporte@lucrooculto.com.br" style={{ color: "#00D084" }}>suporte@lucrooculto.com.br</a>{" "}
          com o assunto <strong style={{ color: "#F4F4F5" }}>&quot;Solicitação de Reembolso&quot;</strong> e informe o email cadastrado na conta.
        </p>
        <p className="mt-3">
          O reembolso será processado em até 10 dias úteis, diretamente no cartão utilizado na compra.
        </p>
      </LegalSection>

      <LegalSection title="3. Cancelamento de Assinatura">
        <p>
          Você pode cancelar sua assinatura a qualquer momento, sem multa ou carência, diretamente pelo painel da plataforma em <strong style={{ color: "#F4F4F5" }}>Configurações → Plano e Cobrança</strong>.
        </p>
        <p className="mt-3">
          Após o cancelamento, sua assinatura permanece ativa até o final do período já pago. Não há cobranças adicionais após o cancelamento.
        </p>
        <p className="mt-3">
          Exemplo: se você cancelar no dia 10 de um ciclo que vai até o dia 30, continuará tendo acesso até o dia 30, sem nenhuma cobrança adicional.
        </p>
      </LegalSection>

      <LegalSection title="4. Casos Não Elegíveis a Reembolso">
        <p>
          Não são elegíveis a reembolso:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-1.5">
          <li>Cobranças de meses anteriores ao mês corrente (apenas a cobrança mais recente é elegível).</li>
          <li>Solicitações realizadas após 7 dias da data de cobrança.</li>
          <li>Contas suspensas por violação dos Termos de Uso.</li>
          <li>Planos anuais após o uso de mais de 30 dias do ciclo contratado.</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Planos Anuais">
        <p>
          Para assinantes de planos anuais (com desconto), oferecemos reembolso proporcional nos primeiros 30 dias após a contratação. Após esse período, não são realizados reembolsos de planos anuais, mas o cancelamento impede cobranças futuras.
        </p>
      </LegalSection>

      <LegalSection title="6. Como Solicitar">
        <p>
          Para qualquer solicitação de cancelamento ou reembolso, entre em contato com nossa equipe:
        </p>
        <ul className="list-disc list-inside mt-3 space-y-1.5">
          <li>
            <strong style={{ color: "#F4F4F5" }}>Email:</strong>{" "}
            <a href="mailto:suporte@lucrooculto.com.br" style={{ color: "#00D084" }}>suporte@lucrooculto.com.br</a>
          </li>
          <li>
            <strong style={{ color: "#F4F4F5" }}>Assunto:</strong> &quot;Solicitação de Reembolso&quot; ou &quot;Cancelamento de Assinatura&quot;
          </li>
          <li>
            <strong style={{ color: "#F4F4F5" }}>Prazo de resposta:</strong> até 1 dia útil (Seg–Sex, 9h–18h BRT)
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Processamento pelo Stripe">
        <p>
          Os pagamentos do Lucro Oculto são processados pela <strong style={{ color: "#F4F4F5" }}>Stripe</strong>, plataforma certificada PCI DSS nível 1. Os reembolsos são emitidos pela Stripe e o prazo de crédito pode variar conforme a instituição financeira do cliente (geralmente de 5 a 10 dias úteis).
        </p>
      </LegalSection>

      <LegalSection title="8. Dúvidas">
        <p>
          Em caso de dúvidas sobre esta política, entre em contato pelo email{" "}
          <a href="mailto:suporte@lucrooculto.com.br" style={{ color: "#00D084" }}>suporte@lucrooculto.com.br</a>.
          Respondemos em até 1 dia útil.
        </p>
      </LegalSection>
    </LegalPageWrapper>
  )
}
