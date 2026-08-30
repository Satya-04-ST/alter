import { create } from 'zustand';

export type TimerMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

interface PomodoroState {
  mode: TimerMode;
  timeLeft: number; // in seconds
  isRunning: boolean;
  completedCycles: number;
  focusedMinutesToday: number;
  setMode: (mode: TimerMode) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
}

const MODE_DURATIONS: Record<TimerMode, number> = {
  FOCUS: 25 * 60,
  SHORT_BREAK: 5 * 60,
  LONG_BREAK: 15 * 60,
};

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  mode: 'FOCUS',
  timeLeft: MODE_DURATIONS.FOCUS,
  isRunning: false,
  completedCycles: 0,
  focusedMinutesToday: 45,

  setMode: (mode) => {
    set({
      mode,
      timeLeft: MODE_DURATIONS[mode],
      isRunning: false,
    });
  },

  startTimer: () => set({ isRunning: true }),
  pauseTimer: () => set({ isRunning: false }),

  resetTimer: () => {
    const currentMode = get().mode;
    set({
      timeLeft: MODE_DURATIONS[currentMode],
      isRunning: false,
    });
  },

  tick: () => {
    const { timeLeft, isRunning, mode, completedCycles, focusedMinutesToday } = get();
    if (!isRunning) return;

    if (timeLeft > 0) {
      set({ timeLeft: timeLeft - 1 });
    } else {
      // Completed cycle
      if (mode === 'FOCUS') {
        const nextCycles = completedCycles + 1;
        const nextMode = nextCycles % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK';
        set({
          mode: nextMode,
          timeLeft: MODE_DURATIONS[nextMode],
          completedCycles: nextCycles,
          focusedMinutesToday: focusedMinutesToday + 25,
          isRunning: false,
        });
      } else {
        set({
          mode: 'FOCUS',
          timeLeft: MODE_DURATIONS.FOCUS,
          isRunning: false,
        });
      }
    }
  },
}));
