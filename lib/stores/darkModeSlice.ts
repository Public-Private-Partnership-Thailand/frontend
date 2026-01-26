import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface DarkModeState {
  value: boolean;
}

const getLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

const initialState: DarkModeState = {
  value: getLocalStorage("darkMode") === "true",
};

export const darkModeSlice = createSlice({
  name: "darkMode",
  initialState,
  reducers: {
    setDarkMode: (state, action) => {
      if (typeof window !== "undefined") {
        localStorage.setItem("darkMode", action.payload.toString());
      }
      state.value = action.payload;
    },
  },
});

export const { setDarkMode } = darkModeSlice.actions;

export const selectDarkMode = (state: RootState) => {
  if (typeof window !== "undefined" && localStorage.getItem("darkMode") !== null) {
    return localStorage.getItem("darkMode") === "true";
  }
  return state.darkMode.value;
};

export default darkModeSlice.reducer;

