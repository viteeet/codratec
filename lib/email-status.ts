export const EMAIL_TRACK_STATUSES = ['ENVIADO', 'ENTREGUE', 'LIDO', 'REJEITADO'] as const;
export type EmailTrackStatus = (typeof EMAIL_TRACK_STATUSES)[number];

export const EMAIL_STATUS_LABEL: Record<EmailTrackStatus, string> = {
  ENVIADO: 'Enviado',
  ENTREGUE: 'Entregue',
  LIDO: 'Lido',
  REJEITADO: 'Rejeitado',
};

export function statusFromBrevoEvent(event: string): EmailTrackStatus | null {
  const key = event.toLowerCase();
  if (key === 'opened' || key === 'clicks' || key === 'loadedbyproxy') return 'LIDO';
  if (key === 'delivered') return 'ENTREGUE';
  if (
    key === 'hardbounces' ||
    key === 'softbounces' ||
    key === 'bounces' ||
    key === 'invalid' ||
    key === 'blocked' ||
    key === 'error' ||
    key === 'spam'
  ) {
    return 'REJEITADO';
  }
  if (key === 'requests' || key === 'deferred') return 'ENVIADO';
  return null;
}
