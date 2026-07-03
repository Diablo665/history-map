import { configureStore } from "@reduxjs/toolkit";
import mapSlice from "./mapSlice";
import eventsSlice from "./eventsSlice";
import gallarySlice from "./gallarySlice";
import loginSlice from "./loginSlice";
import adminPopupSlice from './adminPopupSlice'
import commentsSlice from "./commentsSlice";

const store = configureStore({
    reducer: {
        map: mapSlice,
        events: eventsSlice,
        gallary: gallarySlice,
        login: loginSlice,
        admin: adminPopupSlice,
        comments: commentsSlice
    }
});

export default store;