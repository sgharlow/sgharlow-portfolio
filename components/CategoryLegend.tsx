import type { ReactElement } from 'react';

const ITEMS: Array<{ label: string; bg: string }> = [
  { label: 'agents', bg: '#534AB7' },
  { label: 'mcp', bg: '#1D9E75' },
  { label: 'product', bg: '#D85A30' },
  { label: 'research', bg: '#D4537E' },
  { label: 'tooling', bg: '#378ADD' },
];

export function CategoryLegend(): ReactElement {
  return (
    <div
      className="flex items-center flex-wrap gap-[14px] py-[10px] px-3 rounded-md mb-5"
      style={{ background: 'var(--color-background-secondary)' }}
    >
      {ITEMS.map((item) => (
        <span key={item.label} className="inline-flex items-center gap-[6px]">
          <span
            className="inline-block w-[10px] h-[10px] rounded-[2px]"
            style={{ background: item.bg }}
          />
          <span className="font-mono text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
            {item.label}
          </span>
        </span>
      ))}
    </div>
  );
}
