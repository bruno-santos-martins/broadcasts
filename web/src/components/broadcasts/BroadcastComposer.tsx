import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckAllIcon,
} from '@mui/icons-material';
import type { Connection } from '../../types/connection';
import type { Contact } from '../../types/contact';
import type { CreateBroadcastDTO } from '../../types/broadcast';
import { broadcastComposerSchema } from '../../schemas';

interface BroadcastComposerProps {
  connections: Connection[];
  contacts: Contact[];
  selectedConnectionId: string;
  onConnectionChange: (id: string) => void;
  onSubmit: (dto: CreateBroadcastDTO) => Promise<void>;
}

export const BroadcastComposer: React.FC<BroadcastComposerProps> = ({
  connections,
  contacts,
  selectedConnectionId,
  onConnectionChange,
  onSubmit,
}) => {
  const [message, setMessage] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Filtra contatos da conexão selecionada
  const filteredContacts = contacts.filter((c) => c.connectionId === selectedConnectionId);

  // Seleciona todos os contatos da conexão por padrão quando a conexão muda
  useEffect(() => {
    setSelectedContactIds(filteredContacts.map((c) => c.id));
  }, [selectedConnectionId, contacts.length]);

  const handleToggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    }
  };

  const handleToggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const validation = broadcastComposerSchema.safeParse({
      connectionId: selectedConnectionId,
      message,
      contactIds: selectedContactIds,
      isScheduled,
      scheduledFor: isScheduled ? scheduledFor : null,
    });

    if (!validation.success) {
      setFeedback({
        type: 'error',
        message: validation.error.issues[0]?.message || 'Verifique os dados do disparo.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        connectionId: validation.data.connectionId,
        message: validation.data.message,
        contactIds: validation.data.contactIds,
        scheduledFor: isScheduled && scheduledFor ? new Date(scheduledFor).toISOString() : null,
      });

      setFeedback({
        type: 'success',
        message: isScheduled ? 'Disparo agendado com sucesso!' : 'Mensagens enviadas com sucesso!',
      });
      setMessage('');
      if (!isScheduled) {
        setScheduledFor('');
      }
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao processar disparo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-unni-border bg-unni-card p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-white">Agendamento</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`rounded-xl p-3 text-xs border ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Campo Input */}
        <div>
          <label htmlFor="broadcast-message-input" className="mb-1.5 block text-sm font-medium text-slate-300">
            Input (Mensagem)
          </label>
          <TextField
            id="broadcast-message-input"
            multiline
            rows={3}
            fullWidth
            placeholder="Digite o texto da mensagem..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#0E1524',
                color: '#F1F5F9',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                '& fieldset': { borderColor: '#25385C' },
                '&:hover fieldset': { borderColor: '#54D1D6' },
                '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
              },
            }}
          />
        </div>

        {/* Conexão Selector (Contatos) */}
        <div>
          <label htmlFor="broadcast-connection-select" className="mb-1.5 block text-sm font-medium text-slate-300">
            Conexão WhatsApp
          </label>
          <TextField
            id="broadcast-connection-select"
            select
            fullWidth
            size="small"
            value={selectedConnectionId}
            onChange={(e) => onConnectionChange(e.target.value)}
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#0E1524',
                color: '#F1F5F9',
                borderRadius: '0.75rem',
                '& fieldset': { borderColor: '#25385C' },
                '&:hover fieldset': { borderColor: '#54D1D6' },
                '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
              },
              '& .MuiSelect-icon': { color: '#8E9EB5' },
            }}
          >
            {connections.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </MenuItem>
            ))}
          </TextField>
        </div>

        {/* Seletor de Contatos Picker com Checkbox Nativo Semântico */}
        <fieldset className="border-0 p-0 m-0">
          <div className="mb-1.5 flex items-center justify-between">
            <legend className="text-sm font-medium text-slate-300 p-0">
              Seletor de contatos ({selectedContactIds.length}/{filteredContacts.length})
            </legend>
            {filteredContacts.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-unni-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                aria-label={
                  selectedContactIds.length === filteredContacts.length
                    ? 'Desmarcar todos os contatos'
                    : 'Selecionar todos os contatos'
                }
              >
                <CheckAllIcon sx={{ fontSize: 14 }} aria-hidden="true" />
                {selectedContactIds.length === filteredContacts.length
                  ? 'Desmarcar todos'
                  : 'Selecionar todos'}
              </button>
            )}
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Lista rolável de contatos para envio"
            className="max-h-40 overflow-y-auto rounded-xl border border-unni-border bg-unni-input p-2.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            {filteredContacts.length === 0 ? (
              <p className="p-3 text-center text-xs text-unni-muted">
                Nenhum contato cadastrado para esta conexão.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.04]">
                {filteredContacts.map((contact) => {
                  const isChecked = selectedContactIds.includes(contact.id);
                  const checkboxId = `contact-checkbox-${contact.id}`;

                  return (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between py-2 px-2 text-xs transition-colors hover:bg-white/[0.03] rounded-lg"
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          id={checkboxId}
                          checked={isChecked}
                          onChange={() => handleToggleContact(contact.id)}
                          className="h-4 w-4 rounded border-[#2A3E66] bg-[#0E1524] text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 cursor-pointer accent-[#54D1D6]"
                        />
                        <label
                          htmlFor={checkboxId}
                          className="cursor-pointer font-medium text-slate-200 truncate flex-1 select-none"
                        >
                          {contact.name}
                        </label>
                      </div>
                      <span className="font-mono text-unni-muted text-[11px] shrink-0 ml-2">
                        {contact.phone}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </fieldset>

        {/* Agendamento Opcional */}
        <div className="rounded-xl border border-unni-border/70 bg-unni-input/60 p-3">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              id="broadcast-is-scheduled"
              checked={isScheduled}
              onChange={(e) => setIsScheduled(e.target.checked)}
              className="h-4 w-4 rounded border-[#2A3E66] bg-[#0E1524] text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900 cursor-pointer accent-[#54D1D6]"
            />
            <label
              htmlFor="broadcast-is-scheduled"
              className="cursor-pointer text-xs font-semibold text-slate-300 flex items-center gap-1.5 select-none"
            >
              <ScheduleIcon sx={{ fontSize: 16, color: '#54D1D6' }} aria-hidden="true" />
              Agendar para data/hora futura
            </label>
          </div>

          {isScheduled && (
            <div className="mt-2.5">
              <label htmlFor="broadcast-scheduled-datetime" className="sr-only">
                Data e hora do agendamento
              </label>
              <TextField
                id="broadcast-scheduled-datetime"
                type="datetime-local"
                size="small"
                fullWidth
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#0E1524',
                    color: '#F1F5F9',
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    '& fieldset': { borderColor: '#25385C' },
                    '&:hover fieldset': { borderColor: '#54D1D6' },
                    '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Botão de Envio com foco visível */}
        <button
          type="submit"
          disabled={isSubmitting || filteredContacts.length === 0}
          className="mt-3 flex w-full items-center justify-center rounded-xl bg-unni-accent py-3.5 px-4 text-sm font-semibold text-unni-accentText transition-all hover:bg-unni-accentHover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
        >
          {isSubmitting ? 'Processando...' : 'Agenda Mensagens (Broadcast)'}
        </button>
      </form>
    </div>
  );
};
