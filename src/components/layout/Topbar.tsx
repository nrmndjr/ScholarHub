import { signOut } from '@/lib/auth';

function initials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email || '?';
  return source
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Topbar({ user }: { user: { name?: string | null; email?: string | null } }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-neutral-200 px-6 dark:border-neutral-800">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
          {initials(user.name, user.email)}
        </div>
        <div className="text-sm">
          <p className="font-medium leading-tight">{user.name || 'Pesquisador'}</p>
          <p className="text-xs leading-tight text-neutral-500 dark:text-neutral-400">{user.email}</p>
        </div>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <button
            type="submit"
            className="ml-2 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            Sair
          </button>
        </form>
      </div>
    </header>
  );
}
