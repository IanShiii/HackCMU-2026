import { create } from 'zustand';

export const flowerShapes = ['Daisy', 'Tulip', 'Rose', 'Sunflower', 'Lily'] as const;
export const flowerColors = ['#f59e0b', '#ef4444', '#f472b6', '#22c55e', '#38bdf8', '#a78bfa', '#f97316', '#eab308'];

type FlowerShape = (typeof flowerShapes)[number];

type HistoryFlower = {
  id: string;
  dayLabel: string;
  mood: 'positive' | 'negative' | 'neutral';
  entry: string;
  trimmed: boolean;
};

type FriendFlower = {
  id: string;
  shape: FlowerShape;
  color: string;
};

type FriendPot = {
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
  { id: 'd1', dayLabel: 'Mon', mood: 'positive', entry: 'Took a sunny walk with cocoa in hand.', trimmed: true },
  { id: 'd2', dayLabel: 'Tue', mood: 'negative', entry: 'Felt overwhelmed by classes and forgot lunch.', trimmed: false },
  { id: 'd3', dayLabel: 'Wed', mood: 'neutral', entry: 'A quiet study day with lo-fi music.', trimmed: true },
  { id: 'd4', dayLabel: 'Thu', mood: 'positive', entry: 'Had a lovely call with family tonight.', trimmed: true },
  { id: 'd5', dayLabel: 'Fri', mood: 'negative', entry: 'Rainy mood, I canceled plans and stayed in.', trimmed: false },
  { id: 'd6', dayLabel: 'Sat', mood: 'positive', entry: 'Built pixel art scenes for fun.', trimmed: true },
  { id: 'd7', dayLabel: 'Sun', mood: 'neutral', entry: 'Reset day with chores and tea.', trimmed: true },
  { id: 'd8', dayLabel: 'Mon', mood: 'positive', entry: 'A teammate complimented my design sketch!', trimmed: true },
  { id: 'd9', dayLabel: 'Tue', mood: 'negative', entry: 'Had self-doubt after a long debugging session.', trimmed: false },
  { id: 'd10', dayLabel: 'Wed', mood: 'positive', entry: 'Nailed a coding interview practice problem.', trimmed: true },
  { id: 'd11', dayLabel: 'Thu', mood: 'neutral', entry: 'Steady progress, no major highs or lows.', trimmed: true },
  { id: 'd12', dayLabel: 'Fri', mood: 'positive', entry: 'A cozy movie night with friends.', trimmed: true },
  { id: 'd13', dayLabel: 'Sat', mood: 'negative', entry: 'Missed a deadline and felt discouraged.', trimmed: false },
  { id: 'd14', dayLabel: 'Sun', mood: 'positive', entry: 'Finished my week by journaling under fairy lights.', trimmed: true },
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
}));
