import { LotteryState } from '../types';

const STORAGE_KEY = 'GALA_LOTTERY_DATA_V1';

const DEFAULT_STATE: LotteryState = {
  participants: [],
  prizes: [
    { id: 'p1', name: 'Grand Prize', item: 'MacBook Pro', totalCount: 1, drawCount: 1 },
    { id: 'p2', name: 'Second Prize', item: 'iPad Air', totalCount: 3, drawCount: 1 },
    { id: 'p3', name: 'Third Prize', item: 'Shopping Card', totalCount: 10, drawCount: 5 },
  ],
  winners: [],
  currentPrizeId: 'p3',
};

export const saveState = (state: LotteryState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state', e);
  }
};

export const loadState = (): LotteryState => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : DEFAULT_STATE;
  } catch (e) {
    console.error('Failed to load state', e);
    return DEFAULT_STATE;
  }
};
