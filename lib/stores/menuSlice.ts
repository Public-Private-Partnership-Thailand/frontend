import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface Menu {
  menu: Array<any>;
}

const initialState: Menu = {
  menu: [],
};

export const menuSlice = createSlice({
  name: "menu",
  initialState,
  reducers: {
    setMenu: (state, action) => {
      state.menu = action.payload;
    },
  },
});

export const { setMenu } = menuSlice.actions;

export const selectMenu = (state: RootState) => state.menu.menu;

export default menuSlice.reducer;

