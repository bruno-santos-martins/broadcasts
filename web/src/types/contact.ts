export interface Contact {
  id: string;
  userId: string;
  connectionId: string;
  name: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export type CreateContactDTO = Omit<Contact, 'id' | 'userId' | 'createdAt'>;

export type UpdateContactDTO = Partial<Omit<Contact, 'id' | 'userId' | 'createdAt'>>;
