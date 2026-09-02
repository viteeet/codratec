export type UserRole = 'admin' | 'gerente' | 'vendedor' | 'dev';

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: UserRole;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type LeadStatus =
  | 'NOVO'
  | 'CONTATO'
  | 'QUALIFICADO'
  | 'CALL_AGENDADA'
  | 'PROPOSTA'
  | 'NEGOCIACAO'
  | 'GANHO'
  | 'NAO_INTERESSADO'
  | 'SEM_RESPOSTA'
  | 'FUTURO';

export interface Lead {
  id?: string;
  document?: string | null;
  person_type?: string | null;
  company?: string | null;
  trade_name?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  city?: string | null;
  state?: string | null;
  main_activity?: string | null;
  cnae_code?: string | null;
  category?: string | null;
  niche?: string | null;
  source?: string | null;
  assigned_to?: string | null;
  status?: LeadStatus;
  scheduled_call_at?: string | null;
  call_notes?: string | null;
  uninterest_reason?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Client {
  id?: string;
  lead_id?: string | null;
  name: string;
  company?: string | null;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SalesGoal {
  id?: string;
  user_id: string;
  year: number;
  month: number;
  target_sales_count: number;
  target_revenue_amount?: number;
  commission_rate_percent?: number;
  created_at?: string;
  updated_at?: string;
}

export interface QuoteItem {
  id?: string;
  quote_id: string;
  title: string;
  description?: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  position?: number;
}

export interface Quote {
  id?: string;
  quote_number?: number;
  client_id: string;
  created_by?: string;
  title: string;
  description?: string | null;
  scope_summary?: string | null;
  payment_terms?: string | null;
  setup_amount?: number | null;
  monthly_amount?: number | null;
  contract_duration_months?: number | null;
  valid_until?: string | null;
  delivery_deadline_days?: number | null;
  total_amount?: number;
  status?: 'RASCUNHO' | 'ENVIADO' | 'VISUALIZADO' | 'NEGOCIACAO' | 'APROVADO' | 'RECUSADO' | 'EXPIRADO';
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: QuoteItem[];
  client?: Client;
}

export interface Project {
  id?: string;
  client_id: string;
  quote_id?: string | null;
  name: string;
  description?: string | null;
  value?: number;
  setup_amount?: number | null;
  monthly_amount?: number | null;
  contract_start_date?: string | null;
  contract_duration_months?: number | null;
  next_billing_date?: string | null;
  contract_status?: 'ATIVO' | 'CANCELADO' | 'RENOVACAO_PENDENTE';
  start_date?: string | null;
  estimated_completion_date?: string | null;
  completion_date?: string | null;
  status?: 'PLANEJAMENTO' | 'EM_ANDAMENTO' | 'PAUSADO' | 'AGUARDANDO_CLIENTE' | 'CONCLUIDO' | 'CANCELADO';
  owner_id?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  client?: Client;
}

export interface Task {
  id?: string;
  project_id: string;
  title: string;
  description?: string | null;
  status?: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'BLOCKED' | 'REVIEW' | 'DONE';
  priority?: 'BAIXA' | 'NORMAL' | 'ALTA' | 'URGENTE';
  assigned_to?: string | null;
  created_by?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Revenue {
  id?: string;
  client_id?: string | null;
  project_id?: string | null;
  description: string;
  amount: number;
  due_date: string;
  paid_at?: string | null;
  status?: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  category?: 'SETUP' | 'MENSALIDADE' | 'PROJETO_ADICIONAL' | 'PROJETO' | 'OUTROS';
  created_at?: string;
  client?: Client;
}

export interface Expense {
  id?: string;
  description: string;
  category?: 'HOSPEDAGEM' | 'IA_API' | 'DOMINIO' | 'SERVICOS' | 'COMISSAO' | 'INFRAESTRUTURA' | 'SOFTWARE' | 'IA' | 'MARKETING' | 'EQUIPE' | 'OUTROS';
  amount: number;
  due_date: string;
  paid_at?: string | null;
  status?: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  recurring?: boolean | null;
  created_at?: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Profile;
        Update: Partial<Profile>;
        Relationships: [];
      };
      sales_goals: {
        Row: SalesGoal;
        Insert: SalesGoal;
        Update: Partial<SalesGoal>;
        Relationships: [];
      };
      leads: {
        Row: Lead;
        Insert: Lead;
        Update: Partial<Lead>;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: Client;
        Update: Partial<Client>;
        Relationships: [];
      };
      quotes: {
        Row: Quote;
        Insert: Quote;
        Update: Partial<Quote>;
        Relationships: [];
      };
      quote_items: {
        Row: QuoteItem;
        Insert: QuoteItem;
        Update: Partial<QuoteItem>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Project;
        Update: Partial<Project>;
        Relationships: [];
      };
      tasks: {
        Row: Task;
        Insert: Task;
        Update: Partial<Task>;
        Relationships: [];
      };
      revenues: {
        Row: Revenue;
        Insert: Revenue;
        Update: Partial<Revenue>;
        Relationships: [];
      };
      expenses: {
        Row: Expense;
        Insert: Expense;
        Update: Partial<Expense>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
  };
};
