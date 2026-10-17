import React, { useState } from 'react';
import {
  DeleteOutlined as DeleteIcon,
  ScheduleSend as BroadcastEmptyIcon,
  VisibilityOutlined as ViewIcon,
  EditOutlined as EditIcon,
} from '@mui/icons-material';
import type { Broadcast } from '../../types/broadcast';
import type { Contact } from '../../types/contact';
import { ConfirmModal } from '../common/ConfirmModal';
import { BroadcastDetailModal } from './BroadcastDetailModal';

interface BroadcastListProps {
  broadcasts: Broadcast[];
  contacts?: Contact[];
  loading: boolean;
  onUpdateMessage?: (id: string, message: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const BroadcastList: React.FC<BroadcastListProps> = ({
  broadcasts,
  contacts = [],
  loading,
  onUpdateMessage,
  onDelete,
}) => {
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [selectedViewBroadcast, setSelectedViewBroadcast] = useState<Broadcast | null>(null);
  const [isInitialEditMode, setIsInitialEditMode] = useState(false);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '25/09/2022 18:10';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-unni-accent border-t-transparent" />
      </div>
    );
  }

  if (broadcasts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-unni-border/60 bg-unni-input/40 p-10 text-center">
        <div className="mb-3 rounded-full bg-unni-card p-3.5 text-unni-accent">
          <BroadcastEmptyIcon fontSize="medium" />
        </div>
        <p className="text-sm font-semibold text-slate-200">Nenhum disparo encontrado</p>
        <p className="mt-1 text-xs text-unni-muted max-w-xs">
          Crie um novo disparo ao lado para agendar ou enviar mensagens.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul
        role="list"
        aria-label="Lista de disparos de mensagens"
        className="flex flex-col divide-y divide-[#223354] p-0 m-0 list-none"
      >
        {broadcasts.map((item) => {
          const isScheduled = item.status === 'SCHEDULED';
          const displayDate = isScheduled ? formatDate(item.scheduledFor) : formatDate(item.sentAt || item.createdAt);

          return (
            <li
              key={item.id}
              className="group flex items-center justify-between py-2 px-1 rounded-xl transition-all duration-150 hover:bg-[#1E2E4E]/30"
            >
              {/* Botão semântico acessível por teclado para abrir o modal de detalhes */}
              <button
                type="button"
                onClick={() => setSelectedViewBroadcast(item)}
                aria-label={`Ver detalhes do disparo de ${displayDate}: ${item.message.slice(0, 40)}...`}
                className="flex flex-1 items-center justify-between min-w-0 text-left py-2 px-2.5 rounded-lg transition-colors hover:bg-[#1E2E4E]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 mr-2"
              >
                <div className="flex flex-col gap-1 pr-3 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-200 font-medium group-hover:text-white">
                      {displayDate}
                    </span>
                    <span className="text-unni-accent text-[11px] flex items-center gap-0.5">
                      <ViewIcon sx={{ fontSize: 13 }} aria-hidden="true" />
                      Ver mensagem
                    </span>
                  </div>
                  <span className="text-xs text-unni-muted line-clamp-1 group-hover:text-slate-300">
                    {item.message}
                  </span>
                </div>

                <div className="shrink-0 mr-1">
                  {isScheduled ? (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#163242] px-3.5 py-1 text-xs font-medium text-unni-accent border border-[#20485C]">
                      Agendado
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center rounded-full bg-[#163628] px-3.5 py-1 text-xs font-medium text-[#34D399] border border-[#1E4D38]">
                      Enviado
                    </span>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1 shrink-0">
                {onUpdateMessage && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedViewBroadcast(item);
                      setIsInitialEditMode(true);
                    }}
                    title={`Editar mensagem do disparo de ${displayDate}`}
                    aria-label={`Editar mensagem do disparo de ${displayDate}`}
                    className="rounded-lg p-2 text-unni-muted transition hover:bg-white/[0.05] hover:text-unni-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    <EditIcon sx={{ fontSize: 18 }} aria-hidden="true" />
                  </button>
                )}

                {/* Botão semântico independente para exclusão */}
                <button
                  type="button"
                  onClick={() => setSelectedDeleteId(item.id)}
                  title={`Excluir disparo de ${displayDate}`}
                  aria-label={`Excluir disparo de ${displayDate}`}
                  className="rounded-lg p-2 text-unni-muted transition hover:bg-rose-500/10 hover:text-rose-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  <DeleteIcon sx={{ fontSize: 18 }} aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Modal de Exibição Integral da Mensagem com Lista de Destinatários e Edição */}
      <BroadcastDetailModal
        broadcast={selectedViewBroadcast}
        contacts={contacts}
        initialEditMode={isInitialEditMode}
        onUpdateMessage={onUpdateMessage}
        onClose={() => {
          setSelectedViewBroadcast(null);
          setIsInitialEditMode(false);
        }}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        open={Boolean(selectedDeleteId)}
        title="Excluir Registro de Disparo"
        description="Deseja remover este disparo do histórico? Se for um agendamento futuro, ele não será mais enviado."
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
