import { getCurrentUserOrThrow } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { getOrCreateSettings } from '@/modules/engagement/use-cases/manage-settings';
import { EngagementSettingsForm } from './_components/EngagementSettingsForm';

export default async function SettingsPage() {
  const user = await getCurrentUserOrThrow();
  const settings = await getOrCreateSettings(user.id, { prisma });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Configurações</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Preferências de gamificação, lembretes e metas padrão.
        </p>
      </div>

      <EngagementSettingsForm settings={settings} />

      <p className="text-xs text-neutral-400">
        Preferências de conta, armazenamento e integrações chegam em breve.
      </p>
    </div>
  );
}
