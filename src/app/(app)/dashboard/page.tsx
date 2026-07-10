import { LayoutDashboard } from 'lucide-react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function DashboardPage() {
  return (
    <ComingSoon
      icon={LayoutDashboard}
      title="Dashboard"
      description="Indicadores de leitura, gráficos e metas mensais chegam na próxima fase do ScholarHub."
    />
  );
}
