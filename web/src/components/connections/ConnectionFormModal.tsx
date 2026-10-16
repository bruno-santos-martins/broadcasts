import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import type { CreateConnectionDTO } from '../../types/connection';

interface ConnectionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dto: CreateConnectionDTO) => Promise<void>;
}

export const ConnectionFormModal: React.FC<ConnectionFormModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        status: 'CONNECTED',
      });
      setName('');
      setPhone('');
      onClose();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao criar conexão.');
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
            backgroundColor: '#172134',
            border: '1px solid #222E46',
            borderRadius: '1rem',
            color: '#F1F5F9',
          },
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 600, borderBottom: '1px solid #1C263B' }}>
          Nova Conexão WhatsApp
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 3 }}>
          {errorMessage && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Nome de Identificação
            </label>
            <TextField
              fullWidth
              size="small"
              placeholder="Ex: Comercial 01, Suporte Matriz"
              value={name}
              onChange={(e) => setName(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0F1624',
                  color: '#F8FAFC',
                  borderRadius: '0.5rem',
                  '& fieldset': { borderColor: '#222E46' },
                  '&:hover fieldset': { borderColor: '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                },
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Telefone WhatsApp (com DDI e DDD)
            </label>
            <TextField
              fullWidth
              size="small"
              placeholder="+55 11 98765-4321"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0F1624',
                  color: '#F8FAFC',
                  borderRadius: '0.5rem',
                  '& fieldset': { borderColor: '#222E46' },
                  '&:hover fieldset': { borderColor: '#54D1D6' },
                  '&.Mui-focused fieldset': { borderColor: '#54D1D6' },
                },
              }}
            />
          </div>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid #1C263B' }}>
          <Button
            onClick={onClose}
            disabled={isSubmitting}
            sx={{
              color: '#8291A5',
              textTransform: 'none',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.05)', color: '#F8FAFC' },
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
              '&:hover': { backgroundColor: '#45C4C9', boxShadow: 'none' },
            }}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar Conexão'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
