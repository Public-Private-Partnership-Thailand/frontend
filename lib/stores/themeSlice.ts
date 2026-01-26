import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface Themes {
  name: "enigma" | "icewall" | "rubick" | "tinker";
}

interface ThemeState {
  value: Themes;
}

const getLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const initialState: ThemeState = {
  value: {
    name: (getLocalStorage("theme") as Themes["name"]) ?? "enigma",
  },
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("theme", action.payload.name);
      }
      state.value = action.payload;
    },
  },
});

export const { setTheme } = themeSlice.actions;

export const selectTheme = (state: RootState) => {
  if (typeof window !== "undefined" && localStorage.getItem("theme") !== null) {
    return {
      name: localStorage.getItem("theme") as Themes["name"],
    };
  }
  return state.theme.value;
};

export default themeSlice.reducer;

