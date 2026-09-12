import { create } from 'zustand';

export const flowerShapes = ['Daisy', 'Tulip', 'Rose', 'Sunflower', 'Lily'] as const;
export const flowerColors = ['#f59e0b', '#ef4444', '#f472b6', '#22c55e', '#38bdf8', '#a78bfa', '#f97316', '#eab308'];

export type FlowerShape = (typeof flowerShapes)[number];

export type HistoryFlower = {
  id: string;
  dayLabel: string;
  dateLabel: string;
  mood: 'positive' | 'negative' | 'neutral';
  entry: string;
  trimmed: boolean;
  shape: FlowerShape;
  color: string;
};

export type FriendFlower = {
  id: string;
  shape: FlowerShape;
  color: string;
};

export type FriendPot = {
  id: string;
  name: string;
  flowers: FriendFlower[];
  potPixels: number[][];
};

type BloomState = {
  history: HistoryFlower[];
  friends: FriendPot[];
  selectedShape: FlowerShape;
  selectedColor: string;
  journalEntry: string;
  potGrid: number[][];
  trimWeeds: (flowerId: string) => void;
  setSelectedShape: (shape: FlowerShape) => void;
  setSelectedColor: (color: string) => void;
  setJournalEntry: (entry: string) => void;
  paintPotPixel: (x: number, y: number, colorIndex: number) => void;
  erasePotPixel: (x: number, y: number) => void;
  clearPotGrid: () => void;
};

const emptyGrid = (size = 20) =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => 0));

const patternedPot = (seed: number) => {
  const grid = emptyGrid();
  for (let y = 0; y < 20; y += 1) {
    for (let x = 0; x < 20; x += 1) {
      if ((x + y + seed) % 4 === 0) {
        grid[y][x] = ((seed + x + y) % (flowerColors.length - 1)) + 1;
      }
    }
  }
  return grid;
};

const mockHistory: HistoryFlower[] = [
  {
    id: 'd1',
    dayLabel: 'Mon',
    dateLabel: 'Sep 1',
    mood: 'positive',
    entry: 'Took a sunny walk with cocoa in hand.',
    trimmed: true,
    shape: 'Daisy',
    color: '#f59e0b',
  },
  {
    id: 'd2',
    dayLabel: 'Tue',
    dateLabel: 'Sep 2',
    mood: 'negative',
    entry: 'Felt overwhelmed by classes and forgot lunch.',
    trimmed: false,
    shape: 'Rose',
    color: '#ef4444',
  },
  {
    id: 'd3',
    dayLabel: 'Wed',
    dateLabel: 'Sep 3',
    mood: 'neutral',
    entry: 'A quiet study day with lo-fi music.',
    trimmed: true,
    shape: 'Tulip',
    color: '#f472b6',
  },
  {
    id: 'd4',
    dayLabel: 'Thu',
    dateLabel: 'Sep 4',
    mood: 'positive',
    entry: 'Had a lovely call with family tonight.',
    trimmed: true,
    shape: 'Sunflower',
    color: '#eab308',
  },
  {
    id: 'd5',
    dayLabel: 'Fri',
    dateLabel: 'Sep 5',
    mood: 'negative',
    entry: 'Rainy mood, I canceled plans and stayed in.',
    trimmed: false,
    shape: 'Lily',
    color: '#a78bfa',
  },
  {
    id: 'd6',
    dayLabel: 'Sat',
    dateLabel: 'Sep 6',
    mood: 'positive',
    entry: 'Built pixel art scenes for fun.',
    trimmed: true,
    shape: 'Tulip',
    color: '#38bdf8',
  },
  {
    id: 'd7',
    dayLabel: 'Sun',
    dateLabel: 'Sep 7',
    mood: 'neutral',
    entry: 'Reset day with chores and tea.',
    trimmed: true,
    shape: 'Daisy',
    color: '#22c55e',
  },
  {
    id: 'd8',
    dayLabel: 'Mon',
    dateLabel: 'Sep 8',
    mood: 'positive',
    entry: 'A teammate complimented my design sketch!',
    trimmed: true,
    shape: 'Sunflower',
    color: '#f59e0b',
  },
  {
    id: 'd9',
    dayLabel: 'Tue',
    dateLabel: 'Sep 9',
    mood: 'negative',
    entry: 'Had self-doubt after a long debugging session.',
    trimmed: false,
    shape: 'Rose',
    color: '#f97316',
  },
  {
    id: 'd10',
    dayLabel: 'Wed',
    dateLabel: 'Sep 10',
    mood: 'positive',
    entry: 'Nailed a coding interview practice problem.',
    trimmed: true,
    shape: 'Tulip',
    color: '#f472b6',
  },
  {
    id: 'd11',
    dayLabel: 'Thu',
    dateLabel: 'Sep 11',
    mood: 'neutral',
    entry: 'Steady progress, no major highs or lows.',
    trimmed: true,
    shape: 'Lily',
    color: '#38bdf8',
  },
  {
    id: 'd12',
    dayLabel: 'Fri',
    dateLabel: 'Sep 12',
    mood: 'positive',
    entry: 'A cozy movie night with friends.',
    trimmed: true,
    shape: 'Daisy',
    color: '#22c55e',
  },
  {
    id: 'd13',
    dayLabel: 'Sat',
    dateLabel: 'Sep 13',
    mood: 'negative',
    entry: 'Missed a deadline and felt discouraged.',
    trimmed: false,
    shape: 'Rose',
    color: '#ef4444',
  },
  {
    id: 'd14',
    dayLabel: 'Sun',
    dateLabel: 'Sep 14',
    mood: 'positive',
    entry: 'Finished my week by journaling under fairy lights.',
    trimmed: true,
    shape: 'Sunflower',
    color: '#eab308',
  },
];

const mockFriends: FriendPot[] = [
  {
    id: 'f1',
    name: 'Mina',
    flowers: [
      { id: 'm1', shape: 'Daisy', color: '#f59e0b' },
      { id: 'm2', shape: 'Tulip', color: '#f472b6' },
      { id: 'm3', shape: 'Lily', color: '#38bdf8' },
    ],
    potPixels: patternedPot(1),
  },
  {
    id: 'f2',
    name: 'Leo',
    flowers: [
      { id: 'l1', shape: 'Rose', color: '#ef4444' },
      { id: 'l2', shape: 'Sunflower', color: '#eab308' },
      { id: 'l3', shape: 'Daisy', color: '#22c55e' },
    ],
    potPixels: patternedPot(2),
  },
  {
    id: 'f3',
    name: 'Noa',
    flowers: [
      { id: 'n1', shape: 'Tulip', color: '#a78bfa' },
      { id: 'n2', shape: 'Rose', color: '#f97316' },
      { id: 'n3', shape: 'Lily', color: '#38bdf8' },
    ],
    potPixels: patternedPot(3),
  },
];

export const useBloomStore = create<BloomState>((set) => ({
  history: mockHistory,
  friends: mockFriends,
  selectedShape: flowerShapes[0],
  selectedColor: flowerColors[0],
  journalEntry: '',
  potGrid: patternedPot(4),
  trimWeeds: (flowerId) =>
    set((state) => ({
      history: state.history.map((flower) =>
        flower.id === flowerId ? { ...flower, trimmed: true, mood: flower.mood === 'negative' ? 'neutral' : flower.mood } : flower,
      ),
    })),
  setSelectedShape: (shape) => set({ selectedShape: shape }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setJournalEntry: (entry) => set({ journalEntry: entry }),
  paintPotPixel: (x, y, colorIndex) =>
    set((state) => ({
      potGrid: state.potGrid.map((row, rowIndex) =>
        rowIndex === y ? row.map((pixel, columnIndex) => (columnIndex === x ? colorIndex : pixel)) : row,
      ),
    })),
  erasePotPixel: (x, y) =>
    set((state) => ({
      potGrid: state.potGrid.map((row, rowIndex) =>
        rowIndex === y ? row.map((pixel, columnIndex) => (columnIndex === x ? 0 : pixel)) : row,
      ),
    })),
  clearPotGrid: () => set({ potGrid: emptyGrid() }),
}));
