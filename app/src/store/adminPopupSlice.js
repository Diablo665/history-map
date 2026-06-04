import { createSlice } from '@reduxjs/toolkit';

const adminPopupSlice = createSlice({
    name: 'admin',
    initialState: {
        isOpen: false,
        commentId: null,
        loading: false,
        error: null
    },
    reducers: {
        openAdminPanel: (state, action) => {
            state.isOpen = true;
            state.commentId = action.payload;
            state.loading = true;
            state.error = null;
        },
        closeAdminPanel: (state) => {
            state.isOpen = false;
            state.commentId = null;
            state.data = null;
            state.loading = false;
            state.error = null;
        },

        setAdminPanelError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },

        setCommentId: (state, action) => {
            state.commentId = action.payload;
        }
    }
});

export const { openAdminPanel, closeAdminPanel, setAdminPanelError, setCommentId } = adminPopupSlice.actions;
export default adminPopupSlice.reducer;