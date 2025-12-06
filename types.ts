export interface Participant {
  id: string; // generated uuid or phone
  name: string;
  phone: string;
  department: string;
}

export interface Prize {
  id: string;
  name: string; // e.g., "First Prize"
  item: string; // e.g., "iPhone 15"
  totalCount: number; // Total prizes available
  drawCount: number; // How many to draw at once
  image?: string;
}

export interface Winner {
  prizeId: string;
  participant: Participant;
  timestamp: number;
}

export type AppView = 'settings' | 'lottery' | 'result';

export interface LotteryState {
  participants: Participant[];
  prizes: Prize[];
  winners: Winner[];
  currentPrizeId: string | null;
}
