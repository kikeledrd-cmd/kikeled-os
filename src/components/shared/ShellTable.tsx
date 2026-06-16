import type { ReactNode } from 'react';

export function ShellTable({
  columns,
  children,
}: {
  columns: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10">
      <table className="min-w-full divide-y divide-white/10 text-left">
        <thead className="bg-white/5">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-soft">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 bg-transparent">{children}</tbody>
      </table>
    </div>
  );
}
