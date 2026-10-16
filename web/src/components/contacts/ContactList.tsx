import React, { useState } from 'react';
import {
  EditOutlined as EditIcon,
  DeleteOutlined as DeleteIcon,
  PersonOutlined as PersonIcon,
  PhoneOutlined as PhoneIcon,
  EmailOutlined as EmailIcon,
} from '@mui/icons-material';
import type { Contact } from '../../types/contact';
import type { Connection } from '../../types/connection';
import { ConfirmModal } from '../common/ConfirmModal';

interface ContactListProps {
  contacts: Contact[];
  connections: Connection[];
  loading: boolean;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => Promise<void>;
}

export const ContactList: React.FC<ContactListProps> = ({
  contacts,
  connections,
  loading,
  onEdit,
  onDelete,
}) => {
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);

  const getConnectionName = (connId: string) => {
    const conn = connections.find((c) => c.id === connId);
    return conn ? conn.name : 'Conexão Geral';
  };

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-unni-accent border-t-transparent" />
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-unni-border bg-unni-card/50 p-12 text-center">
        <div className="mb-3 rounded-full bg-unni-input p-4 text-unni-accent">
          <PersonIcon fontSize="large" />
        </div>
        <h3 className="text-base font-semibold text-slate-100">Nenhum contato encontrado</h3>
        <p className="mt-1 text-sm text-unni-muted max-w-sm">
          Cadastre novos contatos vinculados a uma de suas conexões para realizar disparos.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-unni-border bg-unni-card shadow-sm">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="border-b border-[#223354] bg-[#0E1524] text-xs uppercase text-unni-muted">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Nome</th>
              <th scope="col" className="px-6 py-4 font-semibold">Telefone</th>
              <th scope="col" className="px-6 py-4 font-semibold">Conexão</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#223354]">
            {contacts.map((contact) => (
              <tr key={contact.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-slate-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-100">{contact.name}</span>
                    {contact.email && (
                      <span className="flex items-center gap-1 text-xs text-unni-muted">
                        <EmailIcon sx={{ fontSize: 13 }} />
                        {contact.email}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <PhoneIcon sx={{ fontSize: 15, color: '#54D1D6' }} />
                    <span className="font-mono text-xs">{contact.phone}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center rounded-lg bg-[#0E1524] px-2.5 py-1 text-xs font-medium text-slate-300 border border-[#25385C]">
                    {getConnectionName(contact.connectionId)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(contact)}
                      title="Editar Contato"
                      className="rounded-lg p-1.5 text-unni-muted transition hover:bg-white/[0.05] hover:text-unni-accent"
                    >
                      <EditIcon sx={{ fontSize: 18 }} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDeleteId(contact.id)}
                      title="Excluir Contato"
                      className="rounded-lg p-1.5 text-unni-muted transition hover:bg-rose-500/10 hover:text-rose-400"
                    >
                      <DeleteIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={Boolean(selectedDeleteId)}
        title="Excluir Contato"
        description="Tem certeza de que deseja excluir este contato? Ele não estará mais disponível para os próximos disparos."
        confirmText="Excluir"
        onConfirm={async () => {
          if (selectedDeleteId) {
            await onDelete(selectedDeleteId);
            setSelectedDeleteId(null);
          }
        }}
        onClose={() => setSelectedDeleteId(null)}
      />
    </>
  );
};
