import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import type { Broadcast } from '../../types/broadcast';

interface BroadcastDetailModalProps {
  broadcast: Broadcast | null;
  onClose: () => void;
}

export const BroadcastDetailModal: React.FC<BroadcastDetailModalProps> = ({
  broadcast,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!broadcast) return null;

  const isScheduled = broadcast.status === 'SCHEDULED';

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Não definida';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(broadcast.message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar:', err);
    }
  };

  return (
    <Dialog
      open={Boolean(broadcast)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#1B2946',
            borderRadius: '1rem',
            border: '1px solid #2A3E66',
            color: '#F8FAFC',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          },
        },
      }}
    >
      <div className="flex items-center justify-between border-b border-[#25385C] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E1524] text-unni-accent border border-[#25385C]">
            {isScheduled ? <TimeIcon fontSize="small" /> : <SendIcon fontSize="small" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Visualizar Disparo</h3>
            <p className="text-xs text-unni-muted">Conteúdo completo da mensagem transmitida</p>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: '#8E9EB5',
            '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.06)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>

      <DialogContent sx={{ p: 3 }}>
        {/* Metadados: Status, Data e Destinatários */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#25385C] bg-[#0E1524] p-3">
            <span className="text-[11px] font-medium text-unni-muted">Status</span>
            <div className="mt-1">
              {isScheduled ? (
                <span className="inline-flex items-center rounded-full bg-[#163242] px-2.5 py-0.5 text-xs font-medium text-unni-accent border border-[#20485C]">
                  Agendado
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-[#163628] px-2.5 py-0.5 text-xs font-medium text-[#34D399] border border-[#1E4D38]">
                  Enviado
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[#25385C] bg-[#0E1524] p-3">
            <span className="text-[11px] font-medium text-unni-muted">
              {isScheduled ? 'Agendado para' : 'Enviado em'}
            </span>
            <p className="mt-1 text-xs font-medium text-slate-200">
              {isScheduled ? formatDate(broadcast.scheduledFor) : formatDate(broadcast.sentAt || broadcast.createdAt)}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-xl border border-[#25385C] bg-[#0E1524] p-3">
            <span className="text-[11px] font-medium text-unni-muted">Destinatários</span>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <GroupIcon sx={{ fontSize: 14 }} className="text-unni-accent" />
              {broadcast.contactIds?.length || 0} contato(s)
            </p>
          </div>
        </div>

        {/* Caixa de Mensagem Completa */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Mensagem Completa ({broadcast.message.length} caracteres)
            </label>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs font-medium text-unni-accent transition hover:text-white"
            >
              {copied ? (
                <>
                  <CheckIcon sx={{ fontSize: 13 }} />
                  Copiado!
                </>
              ) : (
                <>
                  <CopyIcon sx={{ fontSize: 13 }} />
                  Copiar texto
                </>
              )}
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto rounded-xl border border-[#25385C] bg-[#0E1524] p-4 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-unni-accent/20">
            {broadcast.message}
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#1E2E4E] px-5 py-2 text-xs font-medium text-slate-200 border border-[#2E4674] transition hover:bg-[#253A62] hover:text-white"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
