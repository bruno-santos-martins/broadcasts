import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useContacts } from '../hooks/useContacts';
import { useConnections } from '../hooks/useConnections';
import { ContactList } from '../components/contacts/ContactList';
import { ContactFormModal } from '../components/contacts/ContactFormModal';
import type { Contact, CreateContactDTO, UpdateContactDTO } from '../types/contact';

export const ContactsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialConnId = searchParams.get('connectionId') || '';

  const [selectedConnectionFilter, setSelectedConnectionFilter] = useState<string>(initialConnId);
  const { connections } = useConnections();
  const {
    contacts,
    loading,
    error,
    refresh,
    addContact,
    updateContact,
    removeContact,
  } = useContacts(selectedConnectionFilter || undefined);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const newContactButtonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const conn = searchParams.get('connectionId') || '';
    setSelectedConnectionFilter(conn);
  }, [searchParams]);

  const handleFilterChange = (connId: string) => {
    setSelectedConnectionFilter(connId);
    if (connId) {
      setSearchParams({ connectionId: connId });
    } else {
      setSearchParams({});
    }
  };

  const handleOpenCreateModal = () => {
    setEditingContact(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Retorna o foco ao botão "Novo Contato" (ou elemento de origem)
    setTimeout(() => {
      newContactButtonRef.current?.focus();
    }, 50);
  };

  const handleModalSubmit = async (dto: CreateContactDTO | UpdateContactDTO) => {
    if (editingContact) {
      await updateContact(editingContact.id, dto);
    } else {
      await addContact(dto as CreateContactDTO);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-unni-main">
      {/* Top Header */}
      <div className="border-b border-unni-divider px-8 py-8 md:px-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Base de Contatos
            </h1>
            <p className="mt-1 text-sm text-unni-muted">
              Gerencie a lista de clientes e destinatários para suas campanhas de transmissão.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refresh()}
              title="Recarregar Lista"
              aria-label="Recarregar lista de contatos"
              className="rounded-xl border border-unni-border bg-unni-card p-2.5 text-unni-muted transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <RefreshIcon sx={{ fontSize: 18 }} aria-hidden="true" />
            </button>

            <button
              ref={newContactButtonRef}
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 rounded-xl bg-unni-accent px-4 py-2.5 text-sm font-semibold text-unni-accentText transition hover:bg-unni-accentHover active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <AddIcon sx={{ fontSize: 18 }} aria-hidden="true" />
              Novo Contato
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12">
        <div className="max-w-7xl">
          {error && (
            <div role="alert" className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Filter bar */}
          <div
            role="region"
            aria-label="Filtro de contatos por conexão"
            className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-unni-border bg-unni-card p-4"
          >
            <div className="flex items-center gap-2">
              <FilterIcon sx={{ fontSize: 18, color: '#54D1D6' }} aria-hidden="true" />
              <span className="text-xs font-semibold text-slate-300">Filtrar por Conexão:</span>
            </div>

            <div className="flex flex-wrap gap-2" role="group" aria-label="Opções de conexão">
              <button
                type="button"
                aria-pressed={selectedConnectionFilter === ''}
                onClick={() => handleFilterChange('')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                  selectedConnectionFilter === ''
                    ? 'bg-unni-accent/15 text-unni-accent border border-unni-accent/35 font-semibold'
                    : 'bg-[#0E1524] text-[#8E9EB5] hover:text-white hover:bg-[#1E2E4E] border border-[#25385C]'
                }`}
              >
                Todas as Conexões
              </button>

              {connections.map((conn) => (
                <button
                  key={conn.id}
                  type="button"
                  aria-pressed={selectedConnectionFilter === conn.id}
                  onClick={() => handleFilterChange(conn.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 ${
                    selectedConnectionFilter === conn.id
                      ? 'bg-unni-accent/15 text-unni-accent border border-unni-accent/35 font-semibold'
                      : 'bg-[#0E1524] text-[#8E9EB5] hover:text-white hover:bg-[#1E2E4E] border border-[#25385C]'
                  }`}
                >
                  {conn.name}
                </button>
              ))}
            </div>
          </div>

          {/* Contacts table */}
          <ContactList
            contacts={contacts}
            connections={connections}
            loading={loading}
            onEdit={handleOpenEditModal}
            onDelete={removeContact}
          />

          {/* Modal */}
          <ContactFormModal
            open={isModalOpen}
            contact={editingContact}
            connections={connections}
            defaultConnectionId={selectedConnectionFilter || connections[0]?.id}
            onClose={handleCloseModal}
            onSubmit={handleModalSubmit}
          />
        </div>
      </div>
    </div>
  );
};
