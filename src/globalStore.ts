import { create } from 'zustand';

interface GlobalState {
    dbThreshold: number,
    setDbThreshold: (value: number) => void;
}

export const useGlobalStore = create<GlobalState>((set) => ({
    dbThreshold: -50,
    setDbThreshold: (value: number) =>
        set({ dbThreshold: value })
}));
