import { createSlice } from "@reduxjs/toolkit";

const eventsSlice = createSlice({
    name: 'events',
    initialState: {
        lastEvents: [],
        loading: true,
        error: false,
    },
    reducers: {
        setLastEvents: (state, actions) => {
            state.lastEvents = actions.payload;
        },

        setLoading: (state, actions) => {
            state.loading = actions.payload
        },

        setError: (state, actions) => {
            state.error = actions.payload
        }
    }
});

export const {setLastEvents, setLoading, setError} = eventsSlice.actions;

export default eventsSlice.reducer;