/**
 * HEXLOADERS — CssVarsTable (loader-detail local)
 * Ledger table variant of PropsTable: VARIABLE / DEFAULT / EFFECT,
 * mono-data, row hover invert.
 */

export interface CssVarRow {
  variable: string;
  defaultValue: string;
  effect: string;
}

export interface CssVarsTableProps {
  rows: CssVarRow[];
  className?: string;
}

export default function CssVarsTable({ rows, className }: CssVarsTableProps) {
  return (
    <div className={`border border-hexl-fg font-mono text-mono-data${className ? ` ${className}` : ''}`}>
      <div className="grid grid-cols-[1.2fr_1fr_2fr] border-b border-hexl-fg">
        {['VARIABLE', 'DEFAULT', 'EFFECT'].map((h) => (
          <div
            key={h}
            className="px-3 py-2 text-mono-micro uppercase [&:not(:first-child)]:border-l [&:not(:first-child)]:border-hexl-fg"
          >
            {h}
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <div
          key={r.variable}
          className="grid grid-cols-[1.2fr_1fr_2fr] border-b border-hexl-fg last:border-b-0 hover:bg-hexl-fg hover:text-hexl-bg"
        >
          <div className="px-3 py-2 font-bold">{r.variable}</div>
          <div className="border-l border-hexl-fg px-3 py-2">{r.defaultValue}</div>
          <div className="border-l border-hexl-fg px-3 py-2">{r.effect}</div>
        </div>
      ))}
    </div>
  );
}
