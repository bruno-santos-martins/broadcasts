import React, { useState } from 'react';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useConnections } from '../hooks/useConnections';
import { ConnectionList } from '../components/connections/ConnectionList';
import { ConnectionFormModal } from '../components/connections/ConnectionFormModal';

export const ConnectionsPage: React.FC = () => {
  const { connections, loading, error, refresh, addConnection, removeConnection } = useConnections();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto bg-unni-main">
      {/* Top Header */}
      <div className="border-b border-unni-divider px-8 py-8 md:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Conexões de WhatsApp
            </h1>
            <p className="mt-1 text-sm text-unni-muted">
              Gerencie seus números e instâncias ativas do WhatsApp para envio e atendimento.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refresh()}
              title="Recarregar Conexões"
              className="rounded-xl border border-unni-border bg-unni-card p-2.5 text-unni-muted transition hover:text-white"
            >
              <RefreshIcon sx={{ fontSize: 18 }} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-unni-accent px-4 py-2.5 text-sm font-semibold text-unni-accentText transition hover:bg-unni-accentHover active:scale-[0.98] shadow-sm"
            >
              <AddIcon sx={{ fontSize: 18 }} />
              Nova Conexão
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="max-w-7xl">
          {error && (
            <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* List of connections */}
          <ConnectionList
            connections={connections}
            loading={loading}
            onDelete={removeConnection}
          />

          {/* Modal to add connection */}
          <ConnectionFormModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={async (dto) => {
              await addConnection(dto);
            }}
          />
        </div>
      </div>
    </div>
  );
};
