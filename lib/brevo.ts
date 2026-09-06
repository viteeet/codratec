/**
 * Cliente mínimo da Brevo API (transactional email).
 * Docs: https://developers.brevo.com/docs/send-a-transactional-email
 * Endpoint: POST https://api.brevo.com/v3/smtp/email
 */

const BREVO_API = 'https://api.brevo.com/v3';

export type BrevoSendResult =
  | { ok: true; messageId?: string }
  | { ok: false; error: string };

function getConfig() {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const senderName = process.env.BREVO_SENDER_NAME?.trim() || 'Codratec';

  if (!apiKey) {
    return { error: 'BREVO_API_KEY não configurada no ambiente.' as const };
  }
  if (!senderEmail) {
    return { error: 'BREVO_SENDER_EMAIL não configurada no ambiente.' as const };
  }

  return { apiKey, senderEmail, senderName };
}

export async function sendTransactionalEmail(params: {
  toEmail: string;
  toName?: string | null;
  subject: string;
  htmlContent: string;
  replyTo?: string | null;
}): Promise<BrevoSendResult> {
  const config = getConfig();
  if ('error' in config) return { ok: false, error: config.error };

  const toEmail = params.toEmail.trim();
  if (!toEmail || !toEmail.includes('@')) {
    return { ok: false, error: 'E-mail do destinatário inválido.' };
  }

  const subject = params.subject.trim();
  if (!subject) return { ok: false, error: 'Assunto é obrigatório.' };

  const htmlContent = params.htmlContent.trim();
  if (!htmlContent) return { ok: false, error: 'Corpo do e-mail é obrigatório.' };

  const body: Record<string, unknown> = {
    sender: { email: config.senderEmail, name: config.senderName },
    to: [{ email: toEmail, ...(params.toName ? { name: params.toName } : {}) }],
    subject,
    htmlContent,
  };

  if (params.replyTo?.trim()) {
    body.replyTo = { email: params.replyTo.trim() };
  }

  try {
    const res = await fetch(`${BREVO_API}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': config.apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = (await res.json().catch(() => ({}))) as {
      messageId?: string;
      message?: string;
      code?: string;
    };

    if (!res.ok) {
      return {
        ok: false,
        error: data.message || `Brevo retornou ${res.status}.`,
      };
    }

    return { ok: true, messageId: data.messageId };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Falha de rede ao chamar Brevo.',
    };
  }
}

export function isBrevoConfigured() {
  return Boolean(process.env.BREVO_API_KEY?.trim() && process.env.BREVO_SENDER_EMAIL?.trim());
}
