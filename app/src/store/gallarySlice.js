import { createSlice } from "@reduxjs/toolkit";
import { React } from "react";

const gallarySlice = createSlice({
    name: 'gallary',
    initialState: {
        photo: [],
        loading: true,
        page: 1,
        error: false
    },
    reducers: {
        setPhoto: (state, actions) => {
            state.photo = actions.payload;
        },

        setLoading: (state, actions) => {
            state.loading = actions.payload
        },

        setPage: (state, actions) => {
            state.page = actions.page
        },

        setError: (state, actions) => {
            state.error = actions.payload
        }
    }
});

export const {setPhoto, setLoading, setPage, setError} = gallarySlice.actions;

export default gallarySlice.reducer;