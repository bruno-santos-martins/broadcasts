export type ConnectionStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING';

export interface Connection {
  id: string;
  userId: string;
  name: string;
  phone: string;
  status: ConnectionStatus;
  createdAt: string;
}

export type CreateConnectionDTO = Omit<Connection, 'id' | 'userId' | 'createdAt' | 'status'> & {
  status?: ConnectionStatus;
};

export type UpdateConnectionDTO = Partial<Omit<Connection, 'id' | 'userId' | 'createdAt'>>;
