import React, { useState } from 'react';
import {
  DeleteOutlined as DeleteIcon,
  ScheduleSend as BroadcastEmptyIcon,
} from '@mui/icons-material';
import type { Broadcast } from '../../types/broadcast';
import { ConfirmModal } from '../common/ConfirmModal';

interface BroadcastListProps {
  broadcasts: Broadcast[];
  loading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export const BroadcastList: React.FC<BroadcastListProps> = ({
  broadcasts,
  loading,
  onDelete,
}) => {
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

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
      <div className="flex flex-col divide-y divide-[#223354]">
        {broadcasts.map((item) => {
          const isScheduled = item.status === 'SCHEDULED';

          return (
            <div
              key={item.id}
              className="group flex items-center justify-between py-3.5 px-1 transition-colors hover:bg-white/[0.02]"
            >
              <div className="flex flex-col gap-1 pr-3">
                <span className="text-sm text-slate-200 font-normal">
                  {isScheduled ? formatDate(item.scheduledFor) : formatDate(item.sentAt || item.createdAt)}
                </span>
                <span className="text-xs text-unni-muted line-clamp-1">
                  {item.message}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {isScheduled ? (
                  <span className="inline-flex items-center justify-center rounded-full bg-[#163242] px-3.5 py-1 text-xs font-medium text-unni-accent border border-[#20485C]">
                    Agendado
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full bg-[#163628] px-3.5 py-1 text-xs font-medium text-[#34D399] border border-[#1E4D38]">
                    Enviado
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedDeleteId(item.id)}
                  title="Excluir Disparo"
                  className="rounded-md p-1 text-unni-muted opacity-40 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                >
                  <DeleteIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

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
