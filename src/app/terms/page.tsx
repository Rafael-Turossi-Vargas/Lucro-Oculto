import type { Metadata } from "next"
import { LegalPageWrapper, LegalSection, LegalHighlight } from "@/components/landing/LegalPageWrapper"

export const metadata: Metadata = {
  title: "Termos de Uso | Lucro Oculto",
  description: "Termos de uso do Lucro Oculto — Auditor Financeiro para PMEs.",
}

export default function TermsPage() {
  return (
    <LegalPageWrapper title="Termos de Uso" lastUpdated="01 de março de 2026">
      <LegalHighlight>
        Ao criar uma conta ou usar qualquer funcionalidade do Lucro Oculto, você concorda com estes Termos. Leia com atenção antes de usar a plataforma.
      </LegalHighlight>

      <LegalSection title="1. Sobre o Serviço">
        <p>
          O <strong style={{ color: "#F4F4F5" }}>Lucro Oculto</strong> é uma plataforma SaaS de diagnóstico financeiro para pequenas e médias empresas. O serviço analisa extratos bancários e planilhas de despesas para identificar vazamentos, oportunidades de economia e alertas de risco de caixa.
        </p>
        <p className="mt-2">
          A plataforma é operada por Lucro Oculto Tecnologia Ltda., com sede no Brasil. Ao usar nossos serviços, você confirma que tem ao menos 18 anos e capacidade legal para celebrar contratos.
        </p>
      </LegalSection>

      <LegalSection title="2. Cadastro e Conta">
        <p>Para usar o Lucro Oculto, você deve criar uma conta com informações verdadeiras e atualizadas. Você é responsável por:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Manter a confidencialidade da sua senha</li>
          <li>Todas as atividades realizadas na sua conta</li>
          <li>Notificar imediatamente qualquer uso não autorizado</li>
          <li>Fornecer informações precisas de cadastro</li>
        </ul>
        <p className="mt-2">
          Reservamo-nos o direito de suspender contas com atividade suspeita, uso abusivo ou violação destes Termos.
        </p>
      </LegalSection>

      <LegalSection title="3. Planos e Pagamentos">
        <p>
          O Lucro Oculto oferece planos gratuito e pagos (Pro e Premium). Ao contratar um plano pago:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>A cobrança é processada de forma recorrente (mensal ou anual) via Stripe</li>
          <li>Os preços estão em reais (BRL) e sujeitos a alterações com aviso prévio de 30 dias</li>
          <li>Novos usuários recebem <strong style={{ color: "#F4F4F5" }}>7 dias do plano Pro gratuitamente</strong>, sem cartão de crédito</li>
          <li>Após o trial, sem assinatura ativa, a conta retorna automaticamente ao plano Grátis</li>
        </ul>
        <p className="mt-2">
          Cancelamentos são possíveis a qualquer momento pelo painel. O acesso ao plano pago permanece até o final do período já pago. Não há reembolso proporcional de períodos parciais.
        </p>
      </LegalSection>

      <LegalSection title="4. Dados e Privacidade">
        <p>
          Seus dados financeiros são tratados com máxima confidencialidade. Consulte nossa <a href="/privacy" style={{ color: "#00D084" }}>Política de Privacidade</a> para detalhes completos. Em resumo:
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Não compartilhamos seus dados financeiros com terceiros para fins comerciais</li>
          <li>Os dados são criptografados em trânsito (HTTPS/TLS) e em repouso (AES-256)</li>
          <li>Você pode solicitar exclusão completa dos seus dados a qualquer momento</li>
          <li>Cumprimos a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Uso Aceitável">
        <p>Você concorda em não usar o Lucro Oculto para:</p>
        <ul className="list-disc list-inside space-y-1 mt-2 ml-2">
          <li>Atividades ilegais ou fraudulentas</li>
          <li>Fazer engenharia reversa ou extrair código-fonte da plataforma</li>
          <li>Revender, sublicenciar ou compartilhar acesso não autorizado</li>
          <li>Sobrecarregar os servidores com requisições automatizadas (scraping)</li>
          <li>Carregar arquivos com malware ou conteúdo malicioso</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Limitação de Responsabilidade">
        <p>
          O Lucro Oculto fornece diagnósticos baseados nos dados enviados pelo usuário. As análises e recomendações têm caráter informativo e não substituem assessoria financeira ou contábil profissional.
        </p>
        <p className="mt-2">
          Não somos responsáveis por decisões financeiras tomadas com base nas análises da plataforma, nem por perdas decorrentes de dados incorretos fornecidos pelo usuário.
        </p>
      </LegalSection>

      <LegalSection title="7. Propriedade Intelectual">
        <p>
          Todo o conteúdo da plataforma — incluindo interface, código, algoritmos, marca e textos — é de propriedade exclusiva do Lucro Oculto. Os dados que você carrega pertencem a você; concedemos apenas uma licença limitada para processá-los e exibir os resultados para você.
        </p>
      </LegalSection>

      <LegalSection title="8. Modificações e Encerramento">
        <p>
          Podemos modificar estes Termos a qualquer momento. Alterações significativas serão comunicadas por email com antecedência mínima de 15 dias. O uso continuado após a vigência das alterações configura aceitação dos novos Termos.
        </p>
        <p className="mt-2">
          Podemos encerrar ou suspender o acesso à plataforma por violação destes Termos, sem aviso prévio e sem reembolso.
        </p>
      </LegalSection>

      <LegalSection title="9. Lei Aplicável e Foro">
        <p>
          Estes Termos são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas serão resolvidas no Foro da Comarca de São Paulo, SP, com renúncia a qualquer outro, por mais privilegiado que seja.
        </p>
      </LegalSection>

      <LegalSection title="10. Contato">
        <p>
          Para dúvidas sobre estes Termos, entre em contato pelo email{" "}
          <a href="mailto:legal@lucrooculto.com.br" style={{ color: "#00D084" }}>legal@lucrooculto.com.br</a>{" "}
          ou acesse nossa <a href="/contact" style={{ color: "#00D084" }}>página de contato</a>.
        </p>
      </LegalSection>
    </LegalPageWrapper>
  )
}
