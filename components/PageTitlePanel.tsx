interface PageTitlePanelProps {
  title: string;
}

export function PageTitlePanel({ title }: PageTitlePanelProps) {
  return (
    <section className="relative flex min-h-40 items-center justify-center overflow-hidden border-b border-gray-200 bg-white px-6 py-10 text-center dark:border-white/10 dark:bg-zinc-950">
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(59,130,246,0.07), transparent 42%, rgba(16,185,129,0.055))",
        }}
      />

      <div className="relative">
        <h1 className="font-mono text-3xl font-semibold leading-none tracking-[0.08em] text-gray-800 dark:text-gray-100 sm:text-4xl">
          {title}
        </h1>
      </div>
    </section>
  );
}
