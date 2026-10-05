'use server';

import { revalidatePath } from 'next/cache';
import { getDbClient, loadAuthProfile, parseIsoDate } from '@/lib/server/actions-helpers';

async function syncProjectMembers(supabase: any, projectId: string, formData: FormData) {
  const memberIds = formData.getAll('memberIds').map(String).filter(Boolean);
  await supabase.from('project_members').delete().eq('project_id', projectId);
  if (memberIds.length === 0) return;
  await supabase.from('project_members').insert(
    memberIds.map((user_id) => ({ project_id: projectId, user_id })),
  );
}

function revalidateProjectPaths(projectId?: string | null, clientId?: string | null) {
  revalidatePath('/projetos');
  revalidatePath('/demandas');
  revalidatePath('/dashboard');
  revalidatePath('/clientes');
  if (projectId) revalidatePath(`/projetos/${projectId}`);
  if (clientId) revalidatePath(`/clientes/${clientId}`);
}

export async function getProjects() {
  const supabase = getDbClient();
  const withMembers = await supabase
    .from('projects')
    .select('*, client:clients(name, company), members:project_members(user_id)')
    .order('created_at', { ascending: false });
  if (!withMembers.error) {
    return (withMembers.data || []) as any[];
  }
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(name, company)')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar projetos:', error);
  return (data || []) as any[];
}

export async function getProject(id: string) {
  if (!id) return null;
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, client:clients(id, name, company, email, phone, document), members:project_members(user_id)')
    .eq('id', id)
    .maybeSingle();

  if (error) console.error('Erro ao buscar projeto:', error);
  if (!data) return null;

  const tasksQuery = await supabase
    .from('tasks')
    .select('*, assigned:profiles!tasks_assigned_to_fkey(full_name, email)')
    .eq('project_id', id)
    .order('created_at', { ascending: false });

  const tasks = tasksQuery.error
    ? (
        await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', id)
          .order('created_at', { ascending: false })
      ).data
    : tasksQuery.data;

  const { data: revenues } = await supabase
    .from('revenues')
    .select('*')
    .eq('project_id', id)
    .order('due_date', { ascending: true });

  return {
    ...data,
    tasks: tasks || [],
    revenues: revenues || [],
  } as any;
}

export async function createProject(formData: FormData) {
  const supabase = getDbClient();

  const clientId = String(formData.get('clientId') || '').trim();
  const name = String(formData.get('name') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const value = parseFloat(String(formData.get('value') || '0')) || 0;
  const status = String(formData.get('status') || 'PLANEJAMENTO');

  if (!name || !clientId) return { error: 'Preencha o nome do projeto e selecione um cliente.' };

  const { data, error } = await supabase
    .from('projects')
    .insert({
      client_id: clientId,
      name,
      description: description || null,
      value,
      start_date: parseIsoDate(formData.get('startDate')),
      estimated_completion_date: parseIsoDate(formData.get('estimatedCompletionDate')),
      status,
    })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message || 'Falha ao salvar projeto.' };
  await syncProjectMembers(supabase, data.id, formData);

  revalidateProjectPaths(data.id, clientId);
  return { success: true, id: data.id as string };
}

export async function updateProjectStatus(projectId: string, status: string) {
  if (!projectId) return { error: 'Projeto inválido.' };
  const allowed = [
    'PLANEJAMENTO',
    'EM_ANDAMENTO',
    'PAUSADO',
    'AGUARDANDO_CLIENTE',
    'CONCLUIDO',
    'CANCELADO',
  ];
  if (!allowed.includes(status)) return { error: 'Status inválido.' };

  const supabase = getDbClient();
  const payload: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === 'CONCLUIDO') payload.completion_date = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .select('id, client_id')
    .single();

  if (error || !data) return { error: error?.message || 'Falha ao atualizar o status do projeto.' };
  revalidateProjectPaths(data.id, data.client_id);
  return { success: true };
}

export async function getTasks() {
  const supabase = getDbClient();
  const { data, error } = await supabase
    .from('tasks')
    .select('*, project:projects(id, name), assigned:profiles!tasks_assigned_to_fkey(full_name, email)')
    .order('created_at', { ascending: false });

  if (error) console.error('Erro ao buscar demandas:', error);
  return (data || []) as any[];
}

export async function createTask(formData: FormData) {
  const supabase = getDbClient();
  const { data: { user } } = await supabase.auth.getUser();

  const projectId = formData.get('projectId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const priority = (formData.get('priority') as string) || 'NORMAL';
  const status = (formData.get('status') as string) || 'BACKLOG';
  const dueDate = formData.get('dueDate') as string;

  if (!title || !projectId) return { error: 'Selecione um projeto e o título da demanda.' };

  const { error } = await supabase.from('tasks').insert({
    project_id: projectId,
    title,
    description,
    priority,
    status,
    due_date: dueDate || null,
    assigned_to: (formData.get('assignedTo') as string) || null,
    created_by: user?.id || null,
  });

  if (error) return { error: 'Falha ao criar demanda.' };

  revalidateProjectPaths(projectId);
  return { success: true };
}

export async function updateTaskStatus(taskId: string, status: string) {
  const supabase = getDbClient();
  const payload: any = { status, updated_at: new Date().toISOString() };
  if (status === 'DONE') {
    payload.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .select('project_id')
    .single();

  if (error) return { error: 'Falha ao atualizar demanda.' };

  revalidateProjectPaths(data?.project_id);
  return { success: true };
}

export async function updateProject(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return { error: 'Projeto inválido.' };

  const name = String(formData.get('name') || '').trim();
  const clientId = String(formData.get('clientId') || '');
  if (!name || !clientId) return { error: 'Preencha o nome do projeto e o cliente.' };

  const supabase = getDbClient();
  const { error } = await supabase
    .from('projects')
    .update({
      client_id: clientId,
      name,
      description: formData.get('description') || null,
      value: parseFloat(String(formData.get('value') || '0')) || 0,
      start_date: parseIsoDate(formData.get('startDate')),
      estimated_completion_date: parseIsoDate(formData.get('estimatedCompletionDate')),
      status: (formData.get('status') as string) || 'PLANEJAMENTO',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message || 'Falha ao atualizar projeto.' };
  await syncProjectMembers(supabase, id, formData);
  revalidateProjectPaths(id, clientId);
  return { success: true };
}

export async function deleteProject(id: string) {
  if (!id) return { error: 'Projeto inválido.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) return { error: error.message || 'Falha ao excluir projeto.' };
  revalidateProjectPaths(id);
  return { success: true };
}

export async function updateTask(formData: FormData) {
  const id = String(formData.get('id') || '');
  if (!id) return { error: 'Demanda inválida.' };

  const title = String(formData.get('title') || '').trim();
  const projectId = String(formData.get('projectId') || '');
  if (!title || !projectId) return { error: 'Selecione um projeto e o título da demanda.' };

  const status = String(formData.get('status') || 'BACKLOG');
  const payload: Record<string, unknown> = {
    project_id: projectId,
    title,
    description: formData.get('description') || null,
    priority: (formData.get('priority') as string) || 'NORMAL',
    status,
    due_date: (formData.get('dueDate') as string) || null,
    assigned_to: (formData.get('assignedTo') as string) || null,
    updated_at: new Date().toISOString(),
  };
  if (status === 'DONE') payload.completed_at = new Date().toISOString();

  const supabase = getDbClient();
  const { error } = await supabase.from('tasks').update(payload).eq('id', id);
  if (error) return { error: error.message || 'Falha ao atualizar demanda.' };
  revalidateProjectPaths(projectId);
  return { success: true };
}

export async function deleteTask(id: string) {
  if (!id) return { error: 'Demanda inválida.' };
  const supabase = getDbClient();
  const { data: task } = await supabase.from('tasks').select('project_id').eq('id', id).maybeSingle();
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) return { error: error.message || 'Falha ao excluir demanda.' };
  revalidateProjectPaths(task?.project_id);
  return { success: true };
}

export async function getTaskComments(taskId: string) {
  const supabase = getDbClient();
  const { data } = await supabase
    .from('task_comments')
    .select('*, user:profiles(full_name, email)')
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });
  return (data || []) as any[];
}

export async function createTaskComment(taskId: string, comment: string) {
  const profile = await loadAuthProfile();
  if (!profile) return { error: 'Não autenticado.' };
  const text = comment.trim();
  if (!taskId || !text) return { error: 'Escreva o comentário.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('task_comments').insert({
    task_id: taskId,
    user_id: profile.id,
    comment: text,
  });
  if (error) return { error: error.message || 'Falha ao comentar.' };
  revalidatePath('/demandas');
  return { success: true };
}

export async function updateTaskComment(id: string, comment: string) {
  if (!id) return { error: 'Comentário inválido.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('task_comments').update({ comment: comment.trim() }).eq('id', id);
  if (error) return { error: error.message || 'Falha ao atualizar comentário.' };
  return { success: true };
}

export async function deleteTaskComment(id: string) {
  if (!id) return { error: 'Comentário inválido.' };
  const supabase = getDbClient();
  const { error } = await supabase.from('task_comments').delete().eq('id', id);
  if (error) return { error: error.message || 'Falha ao excluir comentário.' };
  return { success: true };
}
