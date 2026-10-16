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
            backgroundColor: '#172134',
            border: '1px solid #222E46',
            color: '#F1F5F9',
            borderRadius: '1rem',
            padding: '0.5rem',
            maxWidth: '420px',
            width: '100%',
          },
        },
      }}
    >
      <DialogTitle sx={{ color: '#F8FAFC', fontWeight: 600, fontSize: '1.125rem' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ color: '#8291A5', fontSize: '0.925rem' }}>
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ padding: '1rem', gap: '0.5rem' }}>
        <Button
          onClick={onClose}
          sx={{
            color: '#8291A5',
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#F8FAFC',
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
