import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            backgroundColor: '#1B2946', // Azul do fundo, ligeiramente mais claro
            border: '1px solid #2A3E66',
            color: '#F1F5F9',
            borderRadius: '1rem',
            padding: '0.5rem',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
          },
        },
      }}
    >
      <DialogTitle sx={{ color: '#FFFFFF', fontWeight: 600, fontSize: '1.125rem', px: 3, pt: 2.5 }}>
        {title}
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        <DialogContentText sx={{ color: '#8E9EB5', fontSize: '0.925rem' }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: '1.25rem', gap: '0.5rem' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#8E9EB5',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#FFFFFF',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '0.625rem',
            px: 2.5,
            backgroundColor: isDestructive ? '#EF4444' : '#54D1D6',
            color: isDestructive ? '#FFFFFF' : '#0C181F',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: isDestructive ? '#DC2626' : '#45C4C9',
              boxShadow: 'none',
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
