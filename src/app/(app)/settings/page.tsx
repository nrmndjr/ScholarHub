import { Settings } from 'lucide-react';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function SettingsPage() {
  return (
    <ComingSoon
      icon={Settings}
      title="Configurações"
      description="Preferências de conta, armazenamento e integrações chegam em breve."
    />
  );
}
