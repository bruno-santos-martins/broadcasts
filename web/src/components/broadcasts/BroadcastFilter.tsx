import React from 'react';
import type { BroadcastFilterType } from '../../types/broadcast';

interface BroadcastFilterProps {
  currentFilter: BroadcastFilterType;
  onFilterChange: (filter: BroadcastFilterType) => void;
  counts: {
    all: number;
    sent: number;
    scheduled: number;
  };
}

export const BroadcastFilter: React.FC<BroadcastFilterProps> = ({
  currentFilter,
  onFilterChange,
  counts,
}) => {
  const tabs: { key: BroadcastFilterType; label: string; count: number }[] = [
    { key: 'ALL', label: 'Todas', count: counts.all },
    { key: 'SCHEDULED', label: 'Agendadas', count: counts.scheduled },
    { key: 'SENT', label: 'Enviadas', count: counts.sent },
  ];

  return (
    <div className="flex items-center gap-1 rounded-xl bg-[#0C121E] p-1 border border-[#1E2B44]">
      {tabs.map((tab) => {
        const isActive = currentFilter === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onFilterChange(tab.key)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              isActive
                ? 'bg-[#182338] text-unni-accent border border-[#2B3E60] shadow-sm'
                : 'bg-transparent text-[#7F8FA4] border border-transparent hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                isActive
                  ? 'bg-unni-accent/20 text-unni-accent'
                  : 'bg-white/[0.06] text-[#6E7E94]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
