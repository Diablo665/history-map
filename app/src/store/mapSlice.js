import { createSlice } from "@reduxjs/toolkit";

const mapSlice = createSlice({
    name: 'map',
    initialState: {
        points: [],
        loading: true,
        error: false,
    },
    reducers: {
        setPoints: (state, actions) => {
            state.points = actions.payload;
        },

        setLoading: (state, actions) => {
            state.loading = actions.payload
        },

        setError: (state, actions) => {
            state.error = actions.payload
        }
    }
});

export const {setPoints, setLoading, setError} = mapSlice.actions;

export default mapSlice.reducer;