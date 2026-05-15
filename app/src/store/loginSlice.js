import { createSlice } from "@reduxjs/toolkit";

const loginSlice = createSlice({
    name: 'login',
    initialState: {
        isRegistration: false,
        isLoginFormOpen: false,
        isLogined: false,
        userId: null,
        username: '',
        role: ''
    },
    reducers: {
        setIsRegistration: (state, actions) => {
            state.isRegistration = actions.payload;
        },

        openLoginForm: (state) => {
            state.isLoginFormOpen = true
        },

        closeLoginForm: (state) => {
            state.isLoginFormOpen = false
        },

        setIsLogined: (state, actions) => {
            state.isLogined = actions.payload;
        },

        setUserDate: (state, actions) => {
            state.userId = actions.payload.userId;
            state.username = actions.payload.username;
            state.role = actions.payload.role;
        }
    }
});

export const {setIsRegistration, openLoginForm, closeLoginForm, setIsLogined, setUserDate} = loginSlice.actions;

export default loginSlice.reducer;