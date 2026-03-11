import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev"
const REPLY_TO = process.env.EMAIL_REPLY_TO
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lucrooculto.com.br"
// Em desenvolvimento sem domínio verificado, redireciona todos os emails para este endereço
const DEV_TO = process.env.DEV_EMAIL_OVERRIDE

// ─── Welcome Email ─────────────────────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string) {
  return resend.emails.send({
    from: `Lucro Oculto <${FROM}>`,
    to: DEV_TO ?? to,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    subject: "Bem-vindo ao Lucro Oculto! Seu diagnóstico financeiro começa agora.",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bem-vindo ao Lucro Oculto</title>
</head>
<body style="margin:0;padding:0;background:#0F1117;font-family:'Inter',Arial,sans-serif;color:#F4F4F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1A1D27;border-radius:16px;border:1px solid #2A2D3A;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="padding:32px;background:linear-gradient(135deg,rgba(0,208,132,0.1) 0%,rgba(59,130,246,0.05) 100%);border-bottom:1px solid #2A2D3A;">
              <p style="margin:0;color:#00D084;font-size:22px;font-weight:700;letter-spacing:-0.5px;">💡 Lucro Oculto</p>
              <p style="margin:4px 0 0;color:#8B8FA8;font-size:13px;">Veja onde seu lucro está vazando.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 12px;color:#F4F4F5;font-size:24px;font-weight:700;line-height:1.3;">
                Olá, ${name}! Sua conta está pronta. 🎉
              </h1>
              <p style="margin:0 0 24px;color:#8B8FA8;font-size:15px;line-height:1.6;">
                Bem-vindo ao Lucro Oculto. Agora você pode descobrir exatamente onde sua empresa está perdendo dinheiro — e receber um plano de ação para aumentar o lucro.
              </p>
              <div style="background:#212435;border:1px solid #2A2D3A;border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 12px;color:#F4F4F5;font-size:14px;font-weight:600;">Seus próximos passos:</p>
                <p style="margin:0 0 8px;color:#8B8FA8;font-size:14px;">✅ 1. Complete o onboarding (2 minutos)</p>
                <p style="margin:0 0 8px;color:#8B8FA8;font-size:14px;">📂 2. Suba seu extrato ou planilha de despesas</p>
                <p style="margin:0;color:#8B8FA8;font-size:14px;">📊 3. Veja seu diagnóstico financeiro completo</p>
              </div>
              <a href="${APP_URL}/app/onboarding" style="display:inline-block;background:#00D084;color:#0F1117;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;letter-spacing:-0.3px;">
                Começar diagnóstico →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2A2D3A;">
              <p style="margin:0;color:#4B4F6A;font-size:12px;text-align:center;">
                Lucro Oculto · <a href="${APP_URL}" style="color:#00D084;">lucrooculto.com.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

// ─── Analysis Ready Email ─────────────────────────────────────────────────────
export async function sendAnalysisReadyEmail(
  to: string,
  name: string,
  analysisId: string,
  score: number,
  savingsMin: number,
  savingsMax: number
) {
  const scoreLabel =
    score >= 71 ? "Bom" : score >= 41 ? "Atenção" : "Crítico"

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    }).format(v)

  return resend.emails.send({
    from: `Lucro Oculto <${FROM}>`,
    to: DEV_TO ?? to,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    subject: `Seu diagnóstico financeiro está pronto — Score: ${score}/100`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F1117;font-family:'Inter',Arial,sans-serif;color:#F4F4F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1A1D27;border-radius:16px;border:1px solid #2A2D3A;overflow:hidden;">
          <tr>
            <td style="padding:32px;background:linear-gradient(135deg,rgba(0,208,132,0.1) 0%,rgba(59,130,246,0.05) 100%);border-bottom:1px solid #2A2D3A;">
              <p style="margin:0;color:#00D084;font-size:22px;font-weight:700;">💡 Lucro Oculto</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 8px;color:#F4F4F5;font-size:22px;font-weight:700;">
                Olá, ${name}! Seu diagnóstico está pronto.
              </h1>
              <p style="margin:0 0 28px;color:#8B8FA8;font-size:15px;line-height:1.6;">
                Analisamos seus dados e encontramos informações importantes sobre a saúde financeira da sua empresa.
              </p>
              <!-- Score -->
              <div style="background:#212435;border:1px solid #2A2D3A;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
                <p style="margin:0 0 4px;color:#8B8FA8;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Score de Eficiência</p>
                <p style="margin:0;color:#00D084;font-size:48px;font-weight:800;font-family:monospace;letter-spacing:-2px;">${score}<span style="font-size:20px;color:#4B4F6A;">/100</span></p>
                <p style="margin:4px 0 0;color:#8B8FA8;font-size:14px;">${scoreLabel}</p>
              </div>
              <!-- Savings -->
              <div style="background:linear-gradient(135deg,rgba(0,208,132,0.08) 0%,rgba(0,168,107,0.04) 100%);border:1px solid rgba(0,208,132,0.2);border-radius:12px;padding:20px;margin-bottom:28px;">
                <p style="margin:0 0 4px;color:#8B8FA8;font-size:13px;">Economia potencial identificada</p>
                <p style="margin:0;color:#00D084;font-size:22px;font-weight:700;">${formatCurrency(savingsMin)} – ${formatCurrency(savingsMax)}<span style="color:#8B8FA8;font-size:14px;"> / mês</span></p>
              </div>
              <a href="${APP_URL}/app/dashboard" style="display:inline-block;background:#00D084;color:#0F1117;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;">
                Ver diagnóstico completo →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2A2D3A;">
              <p style="margin:0;color:#4B4F6A;font-size:12px;text-align:center;">
                Lucro Oculto · <a href="${APP_URL}" style="color:#00D084;">lucrooculto.com.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

// ─── Team Invite Email ───────────────────────────────────────────────────────
export async function sendTeamInviteEmail(
  to: string,
  inviteToken: string,
  organizationName: string,
  invitedByName: string
) {
  const inviteUrl = `${APP_URL}/invite/${inviteToken}`

  return resend.emails.send({
    from: `Lucro Oculto <${FROM}>`,
    to: DEV_TO ?? to,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    subject: `${invitedByName} te convidou para ${organizationName} no Lucro Oculto`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F1117;font-family:'Inter',Arial,sans-serif;color:#F4F4F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1A1D27;border-radius:16px;border:1px solid #2A2D3A;overflow:hidden;">
          <tr>
            <td style="padding:32px;background:linear-gradient(135deg,rgba(168,85,247,0.1) 0%,rgba(59,130,246,0.05) 100%);border-bottom:1px solid #2A2D3A;">
              <p style="margin:0;color:#00D084;font-size:22px;font-weight:700;">💡 Lucro Oculto</p>
              <p style="margin:4px 0 0;color:#8B8FA8;font-size:13px;">Convite para equipe</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 12px;color:#F4F4F5;font-size:22px;font-weight:700;">
                Você foi convidado para a equipe!
              </h1>
              <p style="margin:0 0 24px;color:#8B8FA8;font-size:15px;line-height:1.6;">
                <strong style="color:#F4F4F5;">${invitedByName}</strong> te convidou para colaborar em
                <strong style="color:#A855F7;">${organizationName}</strong> no Lucro Oculto.
              </p>
              <div style="background:#212435;border:1px solid #2A2D3A;border-radius:12px;padding:20px;margin-bottom:28px;">
                <p style="margin:0 0 8px;color:#F4F4F5;font-size:14px;font-weight:600;">Com acesso à equipe você poderá:</p>
                <p style="margin:0 0 6px;color:#8B8FA8;font-size:14px;">📊 Ver diagnósticos financeiros da empresa</p>
                <p style="margin:0 0 6px;color:#8B8FA8;font-size:14px;">📂 Enviar e analisar extratos</p>
                <p style="margin:0;color:#8B8FA8;font-size:14px;">📋 Acompanhar planos de ação</p>
              </div>
              <a href="${inviteUrl}" style="display:inline-block;background:#A855F7;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;letter-spacing:-0.3px;">
                Aceitar convite →
              </a>
              <p style="margin:20px 0 0;color:#4B4F6A;font-size:13px;">
                Este convite expira em 7 dias. Se você não conhece ${invitedByName}, pode ignorar este email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2A2D3A;">
              <p style="margin:0;color:#4B4F6A;font-size:12px;text-align:center;">
                Lucro Oculto · <a href="${APP_URL}" style="color:#00D084;">lucrooculto.com.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

// ─── Invite Credentials Email ────────────────────────────────────────────────
export async function sendInviteCredentialsEmail(
  to: string,
  temporaryPassword: string,
  organizationName: string,
  invitedByName: string
) {
  const loginUrl = `${APP_URL}/login`

  return resend.emails.send({
    from: `Lucro Oculto <${FROM}>`,
    to: DEV_TO ?? to,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    subject: `Sua conta foi criada — ${organizationName} no Lucro Oculto`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0F1117;font-family:'Inter',Arial,sans-serif;color:#F4F4F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1A1D27;border-radius:16px;border:1px solid #2A2D3A;overflow:hidden;">
          <tr>
            <td style="padding:32px;background:linear-gradient(135deg,rgba(168,85,247,0.1) 0%,rgba(59,130,246,0.05) 100%);border-bottom:1px solid #2A2D3A;">
              <p style="margin:0;color:#00D084;font-size:22px;font-weight:700;">💡 Lucro Oculto</p>
              <p style="margin:4px 0 0;color:#8B8FA8;font-size:13px;">Sua conta de acesso foi criada</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 12px;color:#F4F4F5;font-size:22px;font-weight:700;">
                Convite aceito com sucesso!
              </h1>
              <p style="margin:0 0 24px;color:#8B8FA8;font-size:15px;line-height:1.6;">
                <strong style="color:#F4F4F5;">${invitedByName}</strong> te adicionou à equipe de
                <strong style="color:#A855F7;">${organizationName}</strong>. Sua conta foi criada automaticamente. Use as credenciais abaixo para acessar o sistema:
              </p>
              <div style="background:#212435;border:1px solid #2A2D3A;border-radius:12px;padding:24px;margin-bottom:28px;">
                <p style="margin:0 0 16px;color:#F4F4F5;font-size:14px;font-weight:600;">Suas credenciais de acesso:</p>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:8px 0;border-bottom:1px solid #2A2D3A;">
                      <p style="margin:0;color:#8B8FA8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Email</p>
                      <p style="margin:4px 0 0;color:#F4F4F5;font-size:15px;font-weight:500;">${to}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;">
                      <p style="margin:0;color:#8B8FA8;font-size:12px;text-transform:uppercase;letter-spacing:0.8px;">Senha temporária</p>
                      <p style="margin:4px 0 0;font-size:20px;font-weight:700;letter-spacing:2px;color:#A855F7;font-family:monospace;">${temporaryPassword}</p>
                    </td>
                  </tr>
                </table>
              </div>
              <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:14px 18px;margin-bottom:28px;">
                <p style="margin:0;color:#F59E0B;font-size:13px;">
                  ⚠️ Por segurança, recomendamos trocar sua senha após o primeiro acesso em <strong>Configurações → Segurança</strong>.
                </p>
              </div>
              <a href="${loginUrl}" style="display:inline-block;background:#A855F7;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;letter-spacing:-0.3px;">
                Acessar o sistema →
              </a>
              <p style="margin:20px 0 0;color:#4B4F6A;font-size:13px;">
                Se você não esperava receber este email, entre em contato com ${invitedByName}.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2A2D3A;">
              <p style="margin:0;color:#4B4F6A;font-size:12px;text-align:center;">
                Lucro Oculto · <a href="${APP_URL}" style="color:#00D084;">lucrooculto.com.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}

// ─── Password Reset Email ────────────────────────────────────────────────────
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetToken: string
) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}`

  return resend.emails.send({
    from: `Lucro Oculto <${FROM}>`,
    to: DEV_TO ?? to,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
    subject: "Redefinição de senha — Lucro Oculto",
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0F1117;font-family:'Inter',Arial,sans-serif;color:#F4F4F5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1A1D27;border-radius:16px;border:1px solid #2A2D3A;overflow:hidden;">
          <tr>
            <td style="padding:32px;border-bottom:1px solid #2A2D3A;">
              <p style="margin:0;color:#00D084;font-size:20px;font-weight:700;">💡 Lucro Oculto</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 12px;color:#F4F4F5;font-size:22px;font-weight:700;">Redefinição de senha</h1>
              <p style="margin:0 0 24px;color:#8B8FA8;font-size:15px;line-height:1.6;">
                Olá, ${name}. Recebemos uma solicitação para redefinir a senha da sua conta.
                Clique no botão abaixo para criar uma nova senha:
              </p>
              <a href="${resetUrl}" style="display:inline-block;background:#00D084;color:#0F1117;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;margin-bottom:24px;">
                Redefinir senha
              </a>
              <p style="margin:0;color:#4B4F6A;font-size:13px;">
                Este link expira em 1 hora. Se você não solicitou a redefinição, ignore este email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #2A2D3A;">
              <p style="margin:0;color:#4B4F6A;font-size:12px;text-align:center;">
                Lucro Oculto · <a href="${APP_URL}" style="color:#00D084;">lucrooculto.com.br</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  })
}
