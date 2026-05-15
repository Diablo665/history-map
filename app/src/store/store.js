import { configureStore } from "@reduxjs/toolkit";
import mapSlice from "./mapSlice";
import eventsSlice from "./eventsSlice";
import gallarySlice from "./gallarySlice";
import popupSlice from "./popupSlice";
import loginSlice from "./loginSlice";

const store = configureStore({
    reducer: {
        map: mapSlice,
        events: eventsSlice,
        gallary: gallarySlice,
        popup: popupSlice,
        login: loginSlice
    }
});

export default store;