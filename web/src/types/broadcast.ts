export type BroadcastStatus = 'SCHEDULED' | 'SENT' | 'FAILED';

export interface Broadcast {
  id: string;
  userId: string;
  connectionId: string;
  message: string;
  contactIds: string[];
  status: BroadcastStatus;
  scheduledFor: string | null;
  createdAt: string;
  sentAt?: string | null;
}

export type CreateBroadcastDTO = {
  connectionId: string;
  message: string;
  contactIds: string[];
  scheduledFor?: string | null;
};

export type BroadcastFilterType = 'ALL' | 'SENT' | 'SCHEDULED';
