import React, { useState } from 'react';
import { Add as AddIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useConnections } from '../hooks/useConnections';
import { ConnectionList } from '../components/connections/ConnectionList';
import { ConnectionFormModal } from '../components/connections/ConnectionFormModal';
import type { Connection, CreateConnectionDTO, UpdateConnectionDTO } from '../types/connection';

export const ConnectionsPage: React.FC = () => {
  const { connections, loading, error, refresh, addConnection, updateConnection, removeConnection } = useConnections();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null);
  const openModalButtonRef = React.useRef<HTMLButtonElement>(null);

  const handleOpenCreateModal = () => {
    setEditingConnection(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (conn: Connection) => {
    setEditingConnection(conn);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingConnection(null);
    // Retorna o foco para o botão que abriu o modal (WCAG 2.1)
    setTimeout(() => {
      openModalButtonRef.current?.focus();
    }, 50);
  };

  const handleModalSubmit = async (dto: CreateConnectionDTO | UpdateConnectionDTO) => {
    if (editingConnection) {
      await updateConnection(editingConnection.id, dto as UpdateConnectionDTO);
    } else {
      await addConnection(dto as CreateConnectionDTO);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-unni-main">
      {/* Top Header */}
      <div className="border-b border-unni-divider px-4 py-6 sm:px-8 md:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Conexões de WhatsApp
            </h1>
            <p className="mt-1 text-sm text-unni-muted">
              Gerencie seus números e instâncias ativas do WhatsApp para envio e atendimento.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refresh()}
              title="Recarregar Conexões"
              aria-label="Recarregar lista de conexões"
              className="rounded-xl border border-unni-border bg-unni-card p-2.5 text-unni-muted transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <RefreshIcon sx={{ fontSize: 18 }} aria-hidden="true" />
            </button>

            <button
              ref={openModalButtonRef}
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-unni-accent px-4 py-2.5 text-sm font-semibold text-unni-accentText transition hover:bg-unni-accentHover active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <AddIcon sx={{ fontSize: 18 }} aria-hidden="true" />
              Nova Conexão
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8 md:p-12">
        <div className="max-w-7xl">
          {error && (
            <div role="alert" className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* List of connections */}
          <ConnectionList
            connections={connections}
            loading={loading}
            onEdit={handleOpenEditModal}
            onDelete={removeConnection}
          />

          {/* Modal to add/edit connection */}
          <ConnectionFormModal
            open={isModalOpen}
            connection={editingConnection}
            onClose={handleCloseModal}
            onSubmit={handleModalSubmit}
          />
        </div>
      </div>
    </div>
  );
};
