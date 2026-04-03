import { createSlice } from '@reduxjs/toolkit';

const popupSlice = createSlice({
    name: 'popup',
    initialState: {
        isOpen: false,
        pointId: null,
        data: null,
        loading: false,
        error: null
    },
    reducers: {
        openPopup: (state, action) => {
            state.isOpen = true;
            state.pointId = action.payload;
            state.loading = true;
            state.error = null;
        },
        closePopup: (state) => {
            state.isOpen = false;
            state.pointId = null;
            state.data = null;
            state.loading = false;
            state.error = null;
        },
        setPopupData: (state, action) => {
            state.data = action.payload;
            state.loading = false;
        },
        setPopupError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { openPopup, closePopup, setPopupData, setPopupError } = popupSlice.actions;
export default popupSlice.reducer;