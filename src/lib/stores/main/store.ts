import { createStore } from "zustand/vanilla";

type NewCardIds = Record<string, boolean>;
type NewDashboardIds = Record<string, boolean>;

type NewCardIdsSlice = {
  newCardIds: NewCardIds;
  addNewCardId: ({ id }: { id: string }) => void;
  removeNewCardId: ({ id, delay }: { id: string; delay?: number }) => void;
};

type NewDashboardIdsSlice = {
  newDashboardIds: NewDashboardIds;
  addNewDashboardId: ({ id }: { id: string }) => void;
  removeNewDashboardId: ({ id, delay }: { id: string; delay?: number }) => void;
};

export type MainStore = NewCardIdsSlice & NewDashboardIdsSlice;
export type MainStoreInitState = Pick<
  MainStore,
  "newCardIds" | "newDashboardIds"
>;

const createNewCardIdsSlice = (
  set: (fn: (state: MainStore) => Partial<MainStore>) => void
): NewCardIdsSlice => ({
  newCardIds: {},
  addNewCardId: ({ id }) =>
    set((state) => ({
      newCardIds: { ...state.newCardIds, [id]: true },
    })),
  removeNewCardId: ({ id, delay = 0 }) => {
    const setValue = () =>
      set((state) => {
        const { [id]: _, ...rest } = state.newCardIds;
        return { newCardIds: rest };
      });
    if (delay > 0) {
      setTimeout(() => {
        setValue();
      }, delay);
      return;
    }
    setValue();
  },
});

const createNewDashboardIdsSlice = (
  set: (fn: (state: MainStore) => Partial<MainStore>) => void
): NewDashboardIdsSlice => ({
  newDashboardIds: {},
  addNewDashboardId: ({ id }) =>
    set((state) => ({
      newDashboardIds: { ...state.newDashboardIds, [id]: true },
    })),
  removeNewDashboardId: ({ id, delay = 0 }) => {
    const setValue = () =>
      set((state) => {
        const { [id]: _, ...rest } = state.newDashboardIds;
        return { newDashboardIds: rest };
      });
    if (delay > 0) {
      setTimeout(() => {
        setValue();
      }, delay);
      return;
    }
    setValue();
  },
});

export const defaultInitState: MainStoreInitState = {
  newCardIds: {},
  newDashboardIds: {},
};

export const createMainStore = (
  initState: MainStoreInitState = defaultInitState
) => {
  return createStore<MainStore>()((set) => ({
    ...createNewCardIdsSlice(set),
    ...createNewDashboardIdsSlice(set),
    ...initState,
  }));
};
