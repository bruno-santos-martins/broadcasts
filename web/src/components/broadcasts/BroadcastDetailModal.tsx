import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
  AccessTime as TimeIcon,
  Send as SendIcon,
  Group as GroupIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  EditOutlined as EditIcon,
} from '@mui/icons-material';
import type { Broadcast } from '../../types/broadcast';
import type { Contact } from '../../types/contact';
import { fetchContactById } from '../../services/contactService';

interface BroadcastDetailModalProps {
  broadcast: Broadcast | null;
  contacts?: Contact[];
  initialEditMode?: boolean;
  onUpdateMessage?: (id: string, newMessage: string) => Promise<void>;
  onClose: () => void;
}

export const BroadcastDetailModal: React.FC<BroadcastDetailModalProps> = ({
  broadcast,
  contacts = [],
  initialEditMode = false,
  onUpdateMessage,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedMessage, setEditedMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [fetchedContactsMap, setFetchedContactsMap] = useState<Record<string, Contact>>({});
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  useEffect(() => {
    if (broadcast) {
      setEditedMessage(broadcast.message);
      setIsEditing(initialEditMode);
      setSaveError('');
    }
  }, [broadcast, initialEditMode]);

  // Busca os contatos faltantes diretamente no Firestore caso não estejam no cache da página
  useEffect(() => {
    if (!broadcast || !broadcast.contactIds || broadcast.contactIds.length === 0) {
      return;
    }

    const missingIds = broadcast.contactIds.filter(
      (id) => !contacts.some((c) => c.id === id) && !fetchedContactsMap[id]
    );

    if (missingIds.length === 0) return;

    let isMounted = true;
    setIsLoadingContacts(true);

    Promise.all(
      missingIds.map(async (id) => {
        try {
          const contact = await fetchContactById(broadcast.userId, id);
          return { id, contact };
        } catch (err) {
          console.error(`[BroadcastDetailModal] Erro ao buscar contato ${id}:`, err);
          return { id, contact: null };
        }
      })
    ).then((results) => {
      if (!isMounted) return;
      setFetchedContactsMap((prev) => {
        const next = { ...prev };
        results.forEach(({ id, contact }) => {
          if (contact) {
            next[id] = contact;
          }
        });
        return next;
      });
      setIsLoadingContacts(false);
    });

    return () => {
      isMounted = false;
    };
  }, [broadcast, contacts, fetchedContactsMap]);

  // Resolve os contatos: prioriza contatos recebidos por prop, depois os buscados no Firestore
  const resolvedContacts = useMemo(() => {
    if (!broadcast || !broadcast.contactIds) return [];

    return broadcast.contactIds.map((id) => {
      const foundInProps = contacts.find((c) => c.id === id);
      if (foundInProps) {
        return foundInProps;
      }

      const foundInFetched = fetchedContactsMap[id];
      if (foundInFetched) {
        return foundInFetched;
      }

      return {
        id,
        userId: broadcast.userId,
        connectionId: broadcast.connectionId,
        name: `Contato (${id.slice(0, 6)}...)`,
        phone: 'Carregando telefone...',
        createdAt: '',
      } as Contact;
    });
  }, [broadcast, contacts, fetchedContactsMap]);

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

  const handleSaveMessage = async () => {
    if (!onUpdateMessage || !editedMessage.trim()) return;
    setIsSaving(true);
    setSaveError('');
    try {
      await onUpdateMessage(broadcast.id, editedMessage.trim());
      broadcast.message = editedMessage.trim();
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao atualizar mensagem.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={Boolean(broadcast)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="broadcast-detail-title"
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
      {/* Cabeçalho do Modal */}
      <div className="flex items-center justify-between border-b border-[#25385C] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E1524] text-unni-accent border border-[#25385C]">
            {isScheduled ? <TimeIcon fontSize="small" aria-hidden="true" /> : <SendIcon fontSize="small" aria-hidden="true" />}
          </div>
          <div>
            <h3 id="broadcast-detail-title" className="text-base font-semibold text-white">Visualizar Disparo</h3>
            <p className="text-xs text-unni-muted">Detalhes da transmissão e lista de destinatários</p>
          </div>
        </div>

        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Fechar detalhes do disparo"
          sx={{
            color: '#8E9EB5',
            '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.06)' },
            '&:focus-visible': { outline: '2px solid #54D1D6', outlineOffset: '2px' },
          }}
        >
          <CloseIcon fontSize="small" aria-hidden="true" />
        </IconButton>
      </div>

      <DialogContent sx={{ p: 3 }}>
        {saveError && (
          <div role="alert" className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
            {saveError}
          </div>
        )}

        {/* Metadados: Status e Data */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#25385C] bg-[#0E1524] p-3">
            <span className="text-[11px] font-medium text-unni-muted">Status do Disparo</span>
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
        </div>

        {/* Seção de Destinatários Listados */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <GroupIcon sx={{ fontSize: 14 }} className="text-unni-accent" aria-hidden="true" />
              Destinatários ({resolvedContacts.length})
              {isLoadingContacts && (
                <CircularProgress size={12} sx={{ color: '#54D1D6', ml: 0.5 }} />
              )}
            </label>
            <span className="text-[11px] text-unni-muted">
              {resolvedContacts.length === 1 ? '1 contato selecionado' : `${resolvedContacts.length} contatos selecionados`}
            </span>
          </div>

          <div
            tabIndex={0}
            role="region"
            aria-label="Lista de destinatários do disparo"
            className="max-h-48 overflow-y-auto rounded-xl border border-[#25385C] bg-[#0E1524] p-2 divide-y divide-[#1D2B44] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
          >
            {resolvedContacts.length === 0 ? (
              <div className="p-3 text-center text-xs text-unni-muted">
                Nenhum destinatário registrado para este disparo.
              </div>
            ) : (
              resolvedContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between py-2 px-2.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1E2E4E] border border-[#2E4674] text-xs font-semibold text-unni-accent" aria-hidden="true">
                      {contact.name.charAt(0).toUpperCase() || <PersonIcon sx={{ fontSize: 14 }} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-200 truncate">
                        {contact.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-medium text-slate-300 bg-[#162238] px-2.5 py-1 rounded-lg border border-[#25385C] shrink-0 ml-2">
                    <PhoneIcon sx={{ fontSize: 11 }} className="text-unni-accent" aria-hidden="true" />
                    <span>{contact.phone}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Caixa de Mensagem com Modo de Edição */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Mensagem ({isEditing ? editedMessage.length : broadcast.message.length} caracteres)
            </span>
            <div className="flex items-center gap-2">
              {onUpdateMessage && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-unni-accent transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
                >
                  <EditIcon sx={{ fontSize: 13 }} aria-hidden="true" />
                  <span>Editar</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-unni-accent transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900"
              >
                {copied ? (
                  <>
                    <CheckIcon sx={{ fontSize: 13 }} aria-hidden="true" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon sx={{ fontSize: 13 }} aria-hidden="true" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="edit-broadcast-message" className="sr-only">
                Editar texto da mensagem
              </label>
              <textarea
                id="edit-broadcast-message"
                autoFocus
                rows={4}
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="w-full rounded-xl border border-unni-border bg-[#0E1524] p-3 text-sm text-slate-200 outline-none focus:border-unni-accent focus:ring-1 focus:ring-unni-accent"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedMessage(broadcast.message);
                  }}
                  disabled={isSaving}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveMessage}
                  disabled={isSaving || !editedMessage.trim()}
                  className="rounded-lg bg-unni-accent px-4 py-1.5 text-xs font-semibold text-unni-accentText transition hover:bg-unni-accentHover disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Mensagem'}
                </button>
              </div>
            </div>
          ) : (
            <div
              tabIndex={0}
              role="region"
              aria-label="Conteúdo integral da mensagem do disparo"
              className="max-h-48 overflow-y-auto rounded-xl border border-[#25385C] bg-[#0E1524] p-3.5 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-unni-accent/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              {broadcast.message}
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            autoFocus={!isEditing}
            onClick={onClose}
            className="rounded-xl bg-[#1E2E4E] px-5 py-2 text-xs font-medium text-slate-200 border border-[#2E4674] transition hover:bg-[#253A62] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Fechar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
