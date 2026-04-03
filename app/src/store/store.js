import { configureStore } from "@reduxjs/toolkit";
import mapSlice from "./mapSlice";
import eventsSlice from "./eventsSlice";
import gallarySlice from "./gallarySlice";
import popupSlice from "./popupSlice"

const store = configureStore({
    reducer: {
        map: mapSlice,
        events: eventsSlice,
        gallary: gallarySlice,
        popup: popupSlice
    }
});

export default store;