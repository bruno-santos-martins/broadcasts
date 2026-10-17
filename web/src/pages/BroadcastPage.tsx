import React, { useState } from 'react';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useConnections } from '../hooks/useConnections';
import { useContacts } from '../hooks/useContacts';
import { useBroadcasts } from '../hooks/useBroadcasts';
import { BroadcastComposer } from '../components/broadcasts/BroadcastComposer';
import { BroadcastFilter } from '../components/broadcasts/BroadcastFilter';
import { BroadcastList } from '../components/broadcasts/BroadcastList';

export const BroadcastPage: React.FC = () => {
  const { connections } = useConnections();
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');

  React.useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  const { contacts } = useContacts();
  const {
    broadcasts,
    counts,
    filter,
    setFilter,
    loading,
    error,
    refresh,
    addBroadcast,
    removeBroadcast,
  } = useBroadcasts('ALL', selectedConnectionId || undefined);

  return (
    <div className="flex-1 overflow-y-auto bg-unni-main">
      {/* Top Header with border bottom matching reference screenshot */}
      <div className="border-b border-unni-divider px-8 py-8 md:px-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Disparos de Mensagens (Broadcast)
            </h1>
            <p className="mt-1 text-sm text-unni-muted">
              Disparos de mensagens (Broadcast)
            </p>
          </div>

          <button
            type="button"
            onClick={() => refresh()}
            title="Recarregar Disparos"
            className="self-start rounded-xl border border-unni-border bg-unni-card p-2.5 text-unni-muted transition hover:text-white sm:self-auto"
          >
            <RefreshIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      <div className="p-8 md:p-12">
        {error && (
          <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* 2-Column Responsive Layout matching UnniBlack reference layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 max-w-7xl">
          {/* Left Column: Agendamento */}
          <div className="lg:col-span-5">
            <BroadcastComposer
              connections={connections}
              contacts={contacts}
              selectedConnectionId={selectedConnectionId}
              onConnectionChange={setSelectedConnectionId}
              onSubmit={async (dto) => {
                await addBroadcast(dto);
              }}
            />
          </div>

          {/* Right Column: Disparos Agendados e Enviados */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-unni-border bg-unni-card p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold tracking-tight text-white">
                  Disparos Agendados e Enviados
                </h2>

                <BroadcastFilter
                  currentFilter={filter}
                  onFilterChange={setFilter}
                  counts={counts}
                />
              </div>

              <div className="mb-3 grid grid-cols-12 text-sm font-normal text-unni-muted px-1 border-b border-unni-divider/60 pb-2">
                <span className="col-span-8">Texto</span>
                <span className="col-span-4 text-right">Ações</span>
              </div>

              <BroadcastList
                broadcasts={broadcasts}
                contacts={contacts}
                loading={loading}
                onDelete={removeBroadcast}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
