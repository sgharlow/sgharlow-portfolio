import type { ReactElement } from 'react';
import type { Category } from '@/lib/enrichment-types';

const RAIL: Record<Category, { bg: string; text: string; label: string }> = {
  agents: { bg: '#534AB7', text: '#EEEDFE', label: 'AGENTS' },
  mcp: { bg: '#1D9E75', text: '#E1F5EE', label: 'MCP' },
  product: { bg: '#D85A30', text: '#FAECE7', label: 'PRODUCT' },
  research: { bg: '#D4537E', text: '#FBEAF0', label: 'RESEARCH' },
  tooling: { bg: '#378ADD', text: '#E6F1FB', label: 'TOOLING' },
};

export function Rail({ category }: { category: Category }): ReactElement {
  const { bg, text, label } = RAIL[category];
  return (
    <div
      className="flex items-center justify-center py-2"
      style={{ background: bg, width: 36 }}
    >
      <span
        className="font-mono text-[10px] font-medium"
        style={{
          color: text,
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          letterSpacing: '0.12em',
        }}
      >
        {label}
      </span>
    </div>
  );
}

export const TAG_PALETTE: Record<Category, { bg: string; fg: string }> = {
  agents: { bg: '#EEEDFE', fg: '#26215C' },
  mcp: { bg: '#E1F5EE', fg: '#04342C' },
  product: { bg: '#FAECE7', fg: '#4A1B0C' },
  research: { bg: '#FBEAF0', fg: '#4B1528' },
  tooling: { bg: '#E6F1FB', fg: '#042C53' },
};
