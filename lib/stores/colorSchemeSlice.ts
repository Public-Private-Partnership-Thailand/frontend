import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

export interface ColorSchemes {
  name: "default" | "theme-1" | "theme-2" | "theme-3" | "theme-4";
}

interface ColorSchemeState {
  value: ColorSchemes;
}

const getLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const initialState: ColorSchemeState = {
  value: {
    name: (getLocalStorage("colorScheme") as ColorSchemes["name"]) ?? "default",
  },
};

export const colorSchemeSlice = createSlice({
  name: "colorScheme",
  initialState,
  reducers: {
    setColorScheme: (state, action) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("colorScheme", action.payload.name);
      }
      state.value = action.payload;
    },
  },
});

export const { setColorScheme } = colorSchemeSlice.actions;

export const selectColorScheme = (state: RootState) => {
  if (typeof window !== "undefined" && localStorage.getItem("colorScheme") !== null) {
    return {
      name: localStorage.getItem("colorScheme") as ColorSchemes["name"],
    };
  }
  return state.colorScheme.value;
};

export default colorSchemeSlice.reducer;

