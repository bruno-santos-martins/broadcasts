import type { Timestamp } from 'firebase-admin/firestore';

export type BroadcastStatus = 'SCHEDULED' | 'SENT';

export interface BroadcastDoc {
  id: string;
  userId: string;
  connectionId: string;
  contactIds: string[];
  message: string;
  status: BroadcastStatus;
  scheduledAt: Timestamp;
  sentAt?: Timestamp | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
