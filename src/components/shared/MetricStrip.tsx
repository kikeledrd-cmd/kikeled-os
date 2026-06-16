export function MetricStrip({ items }: { items: Array<{ label: string; value: string }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-soft">{item.label}</p>
          <p className="mt-2 text-xl font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
