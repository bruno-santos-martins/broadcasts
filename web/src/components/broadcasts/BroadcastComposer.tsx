import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import {
  Schedule as ScheduleIcon,
  CheckCircle as CheckAllIcon,
} from '@mui/icons-material';
import type { Connection } from '../../types/connection';
import type { Contact } from '../../types/contact';
import type { CreateBroadcastDTO } from '../../types/broadcast';

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

    if (!selectedConnectionId) {
      setFeedback({ type: 'error', message: 'Selecione uma conexão para o disparo.' });
      return;
    }

    if (!message.trim()) {
      setFeedback({ type: 'error', message: 'Digite a mensagem a ser disparada no campo Input.' });
      return;
    }

    if (selectedContactIds.length === 0) {
      setFeedback({ type: 'error', message: 'Selecione pelo menos um contato de destino.' });
      return;
    }

    if (isScheduled && !scheduledFor) {
      setFeedback({ type: 'error', message: 'Defina a data e hora do agendamento.' });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        connectionId: selectedConnectionId,
        message: message.trim(),
        contactIds: selectedContactIds,
        scheduledFor: isScheduled ? new Date(scheduledFor).toISOString() : null,
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
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Input
          </label>
          <TextField
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
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Contatos
          </label>
          <TextField
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

        {/* Seletor de Contatos Picker */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">
              Seletor de contato ({selectedContactIds.length}/{filteredContacts.length})
            </label>
            {filteredContacts.length > 0 && (
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="flex items-center gap-1 text-[11px] font-medium text-unni-accent hover:underline"
              >
                <CheckAllIcon sx={{ fontSize: 14 }} />
                {selectedContactIds.length === filteredContacts.length
                  ? 'Desmarcar todos'
                  : 'Selecionar todos'}
              </button>
            )}
          </div>

          <div className="max-h-40 overflow-y-auto rounded-xl border border-unni-border bg-unni-input p-2.5">
            {filteredContacts.length === 0 ? (
              <p className="p-3 text-center text-xs text-unni-muted">
                Nenhum contato cadastrado para esta conexão.
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-white/[0.04]">
                {filteredContacts.map((contact) => {
                  const isChecked = selectedContactIds.includes(contact.id);
                  return (
                    <label
                      key={contact.id}
                      className="flex cursor-pointer items-center justify-between py-2 px-2 text-xs transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Checkbox
                          size="small"
                          checked={isChecked}
                          onChange={() => handleToggleContact(contact.id)}
                          sx={{
                            p: 0,
                            color: '#475569',
                            '&.Mui-checked': { color: '#54D1D6' },
                          }}
                        />
                        <span className="font-medium text-slate-200">{contact.name}</span>
                      </div>
                      <span className="font-mono text-unni-muted text-[11px]">
                        {contact.phone}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Agendamento Opcional */}
        <div className="rounded-xl border border-unni-border/70 bg-unni-input/60 p-3">
          <FormControlLabel
            control={
              <Checkbox
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                size="small"
                sx={{
                  color: '#475569',
                  '&.Mui-checked': { color: '#54D1D6' },
                }}
              />
            }
            label={
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ScheduleIcon sx={{ fontSize: 16, color: '#54D1D6' }} />
                Agendar para data/hora futura
              </span>
            }
            sx={{ m: 0 }}
          />

          {isScheduled && (
            <div className="mt-2.5">
              <TextField
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

        {/* Botão idêntico ao da imagem com turquesa #54D1D6 e texto escuro */}
        <button
          type="submit"
          disabled={isSubmitting || filteredContacts.length === 0}
          className="mt-3 flex w-full items-center justify-center rounded-xl bg-unni-accent py-3.5 px-4 text-sm font-semibold text-unni-accentText transition-all hover:bg-unni-accentHover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
        >
          {isSubmitting ? 'Processando...' : 'Agenda Mensagens (Broadcast)'}
        </button>
      </form>
    </div>
  );
};
