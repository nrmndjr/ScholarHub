export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="text-xl font-semibold tracking-tight">ScholarHub</span>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Seu gerenciador de conhecimento acadêmico
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
