import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from '@mui/material';
import type { Contact, CreateContactDTO, UpdateContactDTO } from '../../types/contact';
import type { Connection } from '../../types/connection';
import { contactSchema } from '../../schemas/contact.schema';

interface ContactFormModalProps {
  open: boolean;
  contact?: Contact | null;
  connections: Connection[];
  defaultConnectionId?: string;
  onClose: () => void;
  onSubmit: (dto: CreateContactDTO | UpdateContactDTO) => Promise<void>;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({
  open,
  contact,
  connections,
  defaultConnectionId,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [connectionId, setConnectionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'phone' | 'email' | 'connectionId', string>>>({});

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone);
      setEmail(contact.email || '');
      setConnectionId(contact.connectionId);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setConnectionId(defaultConnectionId || (connections[0]?.id ?? ''));
    }
    setFieldErrors({});
    setErrorMessage('');
  }, [contact, defaultConnectionId, connections, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = contactSchema.safeParse({
      name,
      phone,
      email: email || undefined,
      connectionId,
    });

    if (!result.success) {
      const errors: Partial<Record<'name' | 'phone' | 'email' | 'connectionId', string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof errors;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      setErrorMessage('Por favor, corrija os campos destacados abaixo.');
      return;
    }

    setFieldErrors({});
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: result.data.name,
        phone: result.data.phone,
        email: result.data.email || undefined,
        connectionId: result.data.connectionId,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao salvar contato.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="contact-modal-title"
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#1B2946',
            border: '1px solid #2A3E66',
            borderRadius: '1rem',
            color: '#F1F5F9',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle
          id="contact-modal-title"
          sx={{ color: '#FFFFFF', fontWeight: 600, borderBottom: '1px solid #223354', px: 3, py: 2.5 }}
        >
          {contact ? 'Editar Contato' : 'Novo Contato'}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3, px: 3 }}>
          {errorMessage && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400"
            >
              {errorMessage}
            </div>
          )}

          <div>
            <label htmlFor="contact-conn" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Conexão WhatsApp *
            </label>
            <TextField
              id="contact-conn"
              select
              fullWidth
              size="small"
              value={connectionId}
              onChange={(e) => {
                setConnectionId(e.target.value);
                if (fieldErrors.connectionId) {
                  setFieldErrors((prev) => ({ ...prev, connectionId: undefined }));
                }
              }}
              error={Boolean(fieldErrors.connectionId)}
              helperText={fieldErrors.connectionId}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: fieldErrors.connectionId ? '#F87171' : '#25385C' },
                  '&:hover fieldset': { borderColor: fieldErrors.connectionId ? '#F87171' : '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: fieldErrors.connectionId ? '#F87171' : '#54D1D6' },
                },
                '& .MuiSelect-icon': { color: '#8E9EB5' },
                '& .MuiFormHelperText-root': { color: '#F87171', fontSize: '0.75rem', mt: 0.5 },
              }}
            >
              {connections.map((conn) => (
                <MenuItem key={conn.id} value={conn.id}>
                  {conn.name} ({conn.phone})
                </MenuItem>
              ))}
            </TextField>
          </div>

          <div>
            <label htmlFor="contact-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Nome Completo *
            </label>
            <TextField
              id="contact-name"
              autoFocus
              fullWidth
              size="small"
              placeholder="Ex: Carlos Oliveira"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: fieldErrors.name ? '#F87171' : '#25385C' },
                  '&:hover fieldset': { borderColor: fieldErrors.name ? '#F87171' : '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: fieldErrors.name ? '#F87171' : '#54D1D6' },
                },
                '& .MuiFormHelperText-root': { color: '#F87171', fontSize: '0.75rem', mt: 0.5 },
              }}
            />
          </div>

          <div>
            <label htmlFor="contact-phone" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Telefone (WhatsApp) *
            </label>
            <TextField
              id="contact-phone"
              type="tel"
              fullWidth
              size="small"
              placeholder="5521988158124"
              value={phone}
              slotProps={{
                htmlInput: {
                  inputMode: 'numeric',
                  pattern: '[0-9]*',
                  maxLength: 15,
                },
              }}
              onKeyDown={(e) => {
                if (
                  ['Backspace', 'Tab', 'Enter', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(e.key) ||
                  e.ctrlKey ||
                  e.metaKey
                ) {
                  return;
                }
                if (!/^[0-9]$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, '');
                setPhone(numericOnly);
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              error={Boolean(fieldErrors.phone)}
              helperText={fieldErrors.phone || 'Apenas números, com DDI e DDD (ex: 5521988158124)'}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: fieldErrors.phone ? '#F87171' : '#25385C' },
                  '&:hover fieldset': { borderColor: fieldErrors.phone ? '#F87171' : '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: fieldErrors.phone ? '#F87171' : '#54D1D6' },
                },
                '& .MuiFormHelperText-root': {
                  color: fieldErrors.phone ? '#F87171' : '#8E9EB5',
                  fontSize: '0.75rem',
                  mt: 0.5,
                },
              }}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-1.5 block text-xs font-semibold text-slate-300">
              E-mail (Opcional)
            </label>
            <TextField
              id="contact-email"
              fullWidth
              size="small"
              type="email"
              placeholder="contato@cliente.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              error={Boolean(fieldErrors.email)}
              helperText={fieldErrors.email || 'Informe um e-mail válido com @ (opcional)'}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: fieldErrors.email ? '#F87171' : '#25385C' },
                  '&:hover fieldset': { borderColor: fieldErrors.email ? '#F87171' : '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: fieldErrors.email ? '#F87171' : '#54D1D6' },
                },
                '& .MuiFormHelperText-root': {
                  color: fieldErrors.email ? '#F87171' : '#8E9EB5',
                  fontSize: '0.75rem',
                  mt: 0.5,
                },
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #223354', gap: 1 }}>
          <Button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#8E9EB5',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF' },
              '&:focus-visible': { outline: '2px solid #54D1D6', outlineOffset: '2px' },
            }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant="contained"
            sx={{
              backgroundColor: '#54D1D6',
              color: '#0C181F',
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              borderRadius: '0.625rem',
              px: 2.5,
              py: 1,
              '&:hover': { backgroundColor: '#45C4C9', boxShadow: 'none' },
              '&:focus-visible': { outline: '2px solid #54D1D6', outlineOffset: '2px' },
            }}
          >
            {isSubmitting ? 'Salvando...' : contact ? 'Atualizar Contato' : 'Adicionar Contato'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
