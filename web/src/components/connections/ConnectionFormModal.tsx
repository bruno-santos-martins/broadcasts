import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import type { Connection, CreateConnectionDTO, UpdateConnectionDTO } from '../../types/connection';
import { connectionSchema } from '../../schemas/connection.schema';

interface ConnectionFormModalProps {
  open: boolean;
  connection?: Connection | null;
  onClose: () => void;
  onSubmit: (dto: CreateConnectionDTO | UpdateConnectionDTO) => Promise<void>;
}

export const ConnectionFormModal: React.FC<ConnectionFormModalProps> = ({
  open,
  connection,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'name' | 'phone', string>>>({});

  React.useEffect(() => {
    if (connection) {
      setName(connection.name);
      setPhone(connection.phone);
    } else {
      setName('');
      setPhone('');
    }
    setFieldErrors({});
    setErrorMessage('');
  }, [connection, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = connectionSchema.safeParse({
      name,
      phone,
    });

    if (!result.success) {
      const errors: Partial<Record<'name' | 'phone', string>> = {};
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
        status: connection?.status || 'CONNECTED',
      });
      setName('');
      setPhone('');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao salvar conexão.');
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
      aria-labelledby="connection-dialog-title"
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
          id="connection-dialog-title"
          sx={{ color: '#FFFFFF', fontWeight: 600, borderBottom: '1px solid #223354', px: 3, py: 2.5 }}
        >
          {connection ? 'Editar Conexão WhatsApp' : 'Nova Conexão WhatsApp'}
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
            <label htmlFor="conn-name" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Nome de Identificação *
            </label>
            <TextField
              id="conn-name"
              autoFocus
              fullWidth
              size="small"
              placeholder="Ex: Comercial 01, Suporte Matriz"
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
            <label htmlFor="conn-phone" className="mb-1.5 block text-xs font-semibold text-slate-300">
              Telefone WhatsApp (apenas números, com DDI e DDD) *
            </label>
            <TextField
              id="conn-phone"
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
            {isSubmitting ? 'Salvando...' : connection ? 'Atualizar Conexão' : 'Salvar Conexão'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
