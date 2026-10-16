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
  }, [contact, defaultConnectionId, connections, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !connectionId) {
      setErrorMessage('Por favor, preencha o nome, telefone e selecione uma conexão.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        connectionId,
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
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#1B2946', // Azul do fundo, ligeiramente mais claro
            border: '1px solid #2A3E66',
            borderRadius: '1rem',
            color: '#F1F5F9',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 600, borderBottom: '1px solid #223354', px: 3, py: 2.5 }}>
          {contact ? 'Editar Contato' : 'Novo Contato'}
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3, px: 3 }}>
          {errorMessage && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Conexão WhatsApp
            </label>
            <TextField
              select
              fullWidth
              size="small"
              value={connectionId}
              onChange={(e) => setConnectionId(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: '#25385C' },
                  '&:hover fieldset': { borderColor: '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                },
                '& .MuiSelect-icon': { color: '#8E9EB5' },
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
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Nome Completo
            </label>
            <TextField
              fullWidth
              size="small"
              placeholder="Ex: Carlos Oliveira"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: '#25385C' },
                  '&:hover fieldset': { borderColor: '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                },
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Telefone (WhatsApp)
            </label>
            <TextField
              fullWidth
              size="small"
              placeholder="+55 11 99999-1111"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: '#25385C' },
                  '&:hover fieldset': { borderColor: '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                },
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              E-mail (Opcional)
            </label>
            <TextField
              fullWidth
              size="small"
              placeholder="contato@cliente.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0E1524',
                  color: '#F8FAFC',
                  borderRadius: '0.625rem',
                  '& fieldset': { borderColor: '#25385C' },
                  '&:hover fieldset': { borderColor: '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                },
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: '1px solid #223354', gap: 1 }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#8E9EB5',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#FFFFFF' },
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
            }}
          >
            {isSubmitting ? 'Salvando...' : contact ? 'Atualizar Contato' : 'Adicionar Contato'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
