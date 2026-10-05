import { getMonthlySalesPerformance } from '@/actions/sales-goals';
import { VendedoresView } from '@/components/os/VendedoresView';

export default async function VendedoresPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const performance = await getMonthlySalesPerformance(currentYear, currentMonth);

  return (
    <VendedoresView
      initialPerformance={performance}
      initialYear={currentYear}
      initialMonth={currentMonth}
    />
  );
}
