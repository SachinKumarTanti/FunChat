import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
let debounceTimer;

export const useSearchStore = create((set, get) => ({
  query: "",
  results: [],
  loading: false,
  open: false,

  searchUsers: (value) => {
    set({ query: value, open: true });

    clearTimeout(debounceTimer);

    if (!value || value.trim().length < 2) {
      set({ results: [], loading: false });
      return;
    }

    debounceTimer = setTimeout(async () => {
      set({ loading: true });

      try {
        const res = await axiosInstance.get(
          `/friend/search?q=${value}`,
          { withCredentials: true }
        );

        set({ results: res.data.users });
        console.log("Search results:", res.data.users);
      } catch (err) {
        console.error("Search failed:", err);
        set({ results: [] });
      } finally {
        set({ loading: false });
      }
    }, 300);
  },

  clearSearch: () =>
    set({ query: "", results: [], open: false }),
}));
