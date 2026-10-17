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

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = index;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    onFilterChange(tabs[nextIndex].key);
    const nextTabElement = document.getElementById(`tab-${tabs[nextIndex].key.toLowerCase()}`);
    nextTabElement?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Filtro de status de disparos"
      className="flex items-center gap-1 rounded-xl bg-[#0E1524] p-1 border border-[#25385C]"
    >
      {tabs.map((tab, index) => {
        const isActive = currentFilter === tab.key;
        return (
          <button
            key={tab.key}
            id={`tab-${tab.key.toLowerCase()}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onFilterChange(tab.key)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
              isActive
                ? 'bg-[#1E2E4E] text-unni-accent border border-[#2E4674] shadow-sm'
                : 'bg-transparent text-[#8E9EB5] border border-transparent hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                isActive
                  ? 'bg-unni-accent/20 text-unni-accent'
                  : 'bg-white/[0.06] text-[#7A8A9E]'
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
