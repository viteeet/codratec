import type {
  Client,
  Expense,
  Lead,
  LeadHandoff,
  Profile,
  Project,
  Quote,
  QuoteItem,
  Revenue,
  Task,
} from '@/types/database';

// Linhas como as server actions devolvem: com id garantido e os joins do select.

type WithId<T> = T & { id: string };
type PersonRef = { full_name?: string | null; email?: string | null } | null;

export type LeadRow = WithId<Lead> & { assigned: PersonRef };

export type ClientRow = WithId<Client> & {
  quotes?: Partial<WithId<Quote>>[];
  projects?: Partial<WithId<Project>>[];
  revenues?: Partial<WithId<Revenue>>[];
};

export type QuoteRow = WithId<Quote> & {
  client: Partial<Client> | null;
  items?: QuoteItem[];
  project: { id: string; name?: string | null } | null;
};

export type ProjectRow = WithId<Project> & {
  client: Pick<Client, 'name' | 'company'> | null;
  members?: { user_id: string }[];
};

export type TaskRow = WithId<Task> & {
  project: { id: string; name: string } | null;
  assigned: PersonRef;
};

export type RevenueRow = WithId<Revenue> & { client?: Pick<Client, 'name' | 'company'> | null };

export type ExpenseRow = WithId<Expense>;

export type LeadHandoffRow = WithId<LeadHandoff> & {
  lead: Partial<WithId<Lead>> | null;
  requester: PersonRef;
};

export type TeamMember = Profile;
