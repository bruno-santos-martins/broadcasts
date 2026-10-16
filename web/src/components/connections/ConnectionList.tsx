import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneOutlined as PhoneIcon,
  PeopleOutlined as PeopleIcon,
  DeleteOutlined as DeleteIcon,
  CheckCircleOutlined as ConnectedIcon,
  RadioButtonUnchecked as DisconnectedIcon,
} from '@mui/icons-material';
import type { Connection } from '../../types/connection';
import { ConfirmModal } from '../common/ConfirmModal';

interface ConnectionListProps {
  connections: Connection[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export const ConnectionList: React.FC<ConnectionListProps> = ({
  connections,
  loading,
  onDelete,
}) => {
  const navigate = useNavigate();
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-unni-accent border-t-transparent" />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-unni-border bg-unni-card/50 p-12 text-center">
        <div className="mb-3 rounded-full bg-unni-input p-4 text-unni-accent">
          <PhoneIcon fontSize="large" />
        </div>
        <h3 className="text-base font-semibold text-slate-100">Nenhuma conexão cadastrada</h3>
        <p className="mt-1 text-sm text-unni-muted max-w-sm">
          Clique no botão "Nova Conexão" para adicionar seu primeiro número de WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {connections.map((conn) => {
          const isConnected = conn.status === 'CONNECTED';

          return (
            <div
              key={conn.id}
              className="flex flex-col justify-between rounded-2xl border border-unni-border bg-unni-card p-6 shadow-sm transition hover:border-[#38538A]"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-semibold text-slate-100 line-clamp-1">
                    {conn.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-medium border ${
                      isConnected
                        ? 'bg-[#163628] text-[#34D399] border-[#1E4D38]'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {isConnected ? (
                      <ConnectedIcon sx={{ fontSize: 13 }} />
                    ) : (
                      <DisconnectedIcon sx={{ fontSize: 13 }} />
                    )}
                    {isConnected ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="mt-3.5 flex items-center gap-2 text-sm text-slate-300">
                  <PhoneIcon sx={{ fontSize: 17, color: '#8E9EB5' }} />
                  <span className="font-mono text-xs">{conn.phone}</span>
                </div>

                <div className="mt-1 text-xs text-unni-muted">
                  Criado em: {new Date(conn.createdAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#223354] pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/contacts?connectionId=${conn.id}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-unni-accent transition hover:underline"
                >
                  <PeopleIcon sx={{ fontSize: 16 }} />
                  Gerenciar Contatos
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedDeleteId(conn.id)}
                  title="Excluir Conexão"
                  className="rounded-lg p-1.5 text-unni-muted transition hover:bg-rose-500/10 hover:text-rose-400"
                >
                  <DeleteIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmModal
        open={Boolean(selectedDeleteId)}
        title="Excluir Conexão"
        description="Tem certeza de que deseja remover esta conexão? Ela deixará de estar disponível para novos envios."
        confirmText="Excluir"
        onConfirm={async () => {
          if (selectedDeleteId) {
            await onDelete(selectedDeleteId);
            setSelectedDeleteId(null);
          }
        }}
        onClose={() => setSelectedDeleteId(null)}
      />
    </>
  );
};
