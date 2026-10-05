import { Suspense } from 'react';
import { canSendBrevoEmail, getEmailTemplates, getBrevoDailyQuota } from '@/actions/email';
import { getLeads } from '@/actions/leads';
import { getTeamMembers } from '@/actions/team';
import { LeadsView } from '@/components/os/LeadsView';

export default async function LeadsPage() {
  const [leads, members, canSendEmail, emailTemplates, emailQuota] = await Promise.all([
    getLeads(),
    getTeamMembers(),
    canSendBrevoEmail(),
    getEmailTemplates(),
    getBrevoDailyQuota(),
  ]);

  return (
    <Suspense fallback={<p className="text-sm text-slate-400 p-4">Carregando leads...</p>}>
      <LeadsView
        initialLeads={leads}
        members={members}
        canSendEmail={canSendEmail}
        emailTemplates={emailTemplates}
        emailQuota={emailQuota}
      />
    </Suspense>
  );
}
