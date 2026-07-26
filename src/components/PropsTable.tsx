export interface PropRow {
  prop: string;
  type: string;
  default: string;
  description: string;
}

export interface PropsTableProps {
  rows: PropRow[];
  className?: string;
}

/** Ledger table: PROP / TYPE / DEFAULT / DESCRIPTION, mono-data, row hover invert. */
export default function PropsTable({ rows, className }: PropsTableProps) {
  return (
    <div className={`overflow-x-auto border border-hexl-fg font-mono text-mono-data${className ? ` ${className}` : ''}`}>
      <div className="grid min-w-[560px] grid-cols-[1fr_1.2fr_1fr_2fr] border-b border-hexl-fg">
        {['PROP', 'TYPE', 'DEFAULT', 'DESCRIPTION'].map((h) => (
          <div key={h} className="px-3 py-2 text-mono-micro uppercase [&:not(:first-child)]:border-l [&:not(:first-child)]:border-hexl-fg">
            {h}
          </div>
        ))}
      </div>
      {rows.map((r) => (
        <div
          key={r.prop}
          className="grid min-w-[560px] grid-cols-[1fr_1.2fr_1fr_2fr] border-b border-hexl-fg last:border-b-0 hover:bg-hexl-fg hover:text-hexl-bg"
        >
          <div className="px-3 py-2 font-bold">{r.prop}</div>
          <div className="border-l border-hexl-fg px-3 py-2">{r.type}</div>
          <div className="border-l border-hexl-fg px-3 py-2">{r.default}</div>
          <div className="border-l border-hexl-fg px-3 py-2">{r.description}</div>
        </div>
      ))}
    </div>
  );
}
