'use server';

import { revalidatePath } from 'next/cache';
import { assertIsAdmin, getDbClient } from '@/lib/server/actions-helpers';

export async function getMonthlySalesPerformance(targetYear?: number, targetMonth?: number) {
  const supabase = getDbClient();
  const now = new Date();
  const year = targetYear || now.getFullYear();
  const month = targetMonth || (now.getMonth() + 1);

  // 1. Busca todos os consultores/vendedores e administradores
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .or('role.eq.vendedor,role.eq.admin');

  // 2. Busca as metas configuradas para o ano/mês
  const { data: goals } = await supabase
    .from('sales_goals')
    .select('*')
    .eq('year', year)
    .eq('month', month);

  // 3. Busca todos os leads GANHOS (vendas concluídas)
  const { data: wonLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('status', 'GANHO');

  // 4. Busca todos os orçamentos/projetos para cálculo do faturamento por vendedor
  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, client:clients(lead_id)')
    .eq('status', 'APROVADO');

  const performanceList = (members || []).map((vendedor: any) => {
    const userGoal = (goals || []).find((g: any) => g.user_id === vendedor.id);
    const targetSalesCount = userGoal?.target_sales_count || 8; // Default 8 vendas/mês
    const commissionRatePercent = Number(userGoal?.commission_rate_percent || 10.0); // Default 10% comissão

    // Vendas realizadas pelo vendedor no mês selecionado
    const sellerWonLeads = (wonLeads || []).filter((l: any) => {
      if (l.assigned_to !== vendedor.id) return false;
      const updatedDate = new Date(l.updated_at || l.created_at);
      return updatedDate.getFullYear() === year && (updatedDate.getMonth() + 1) === month;
    });

    const realSalesCount = sellerWonLeads.length;
    const progressPercent = Math.min(Math.round((realSalesCount / targetSalesCount) * 1000) / 10, 100);

    // Faturamento gerado no mês
    const totalRevenueGenerated = sellerWonLeads.reduce((acc: number, lead: any) => {
      const leadQuotes = (quotes || []).filter((q: any) => q.client?.lead_id === lead.id);
      const leadValue = leadQuotes.reduce((qAcc: number, q: any) => qAcc + Number(q.total_amount || 0), 0);
      return acc + leadValue;
    }, 0);

    const calculatedCommission = (totalRevenueGenerated * commissionRatePercent) / 100;

    return {
      vendedorId: vendedor.id,
      name: vendedor.full_name || vendedor.email,
      email: vendedor.email,
      avatarUrl: vendedor.avatar_url,
      role: vendedor.role,
      year,
      month,
      targetSalesCount,
      realSalesCount,
      progressPercent,
      totalRevenueGenerated,
      commissionRatePercent,
      calculatedCommission,
    };
  });

  // Ordenar ranking pelas vendas realizadas (decrescente)
  performanceList.sort((a: any, b: any) => b.realSalesCount - a.realSalesCount);

  return performanceList;
}

export async function setVendedorMonthlyGoal(formData: FormData) {
  const supabase = getDbClient();

  const userId = formData.get('userId') as string;
  const year = parseInt(formData.get('year') as string, 10);
  const month = parseInt(formData.get('month') as string, 10);
  const targetSalesCount = parseInt(formData.get('targetSalesCount') as string, 10);
  const commissionRatePercent = parseFloat((formData.get('commissionRatePercent') as string) || '10.0');

  if (!userId || !year || !month || !targetSalesCount) {
    return { error: 'Preencha o vendedor, período e meta de vendas.' };
  }

  const { error } = await supabase.from('sales_goals').upsert({
    user_id: userId,
    year,
    month,
    target_sales_count: targetSalesCount,
    commission_rate_percent: commissionRatePercent,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,year,month' });

  if (error) {
    console.error('Erro ao salvar meta do vendedor:', error);
    return { error: 'Falha ao salvar meta no banco de dados.' };
  }

  revalidatePath('/vendedores');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteSalesGoal(userId: string, year: number, month: number) {
  const deny = await assertIsAdmin();
  if (deny) return { error: deny };
  const supabase = getDbClient();
  const { error } = await supabase
    .from('sales_goals')
    .delete()
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month);
  if (error) return { error: error.message || 'Falha ao excluir meta.' };
  revalidatePath('/vendedores');
  return { success: true };
}
