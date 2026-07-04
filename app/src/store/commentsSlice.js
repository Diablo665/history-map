import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';


export const fetchComments = createAsyncThunk(
    'items/fetchComments',
    async (url) => {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Не удалось загрузить комментарии');
        }
        return await response.json();
    }
);

const commentsSlice = createSlice({
    name: 'comments',
    initialState: {
        comments: [],
        isLoading: false,
        error: null,
        filters: {
            onlyMyComments: false,
            date: null,
            lastXdays: null,
            rating: null
        }
    },
    reducers: {
        removeComment: (state, action) => {
            const commentId = action.payload;
            state.comments = state.comments.filter(comment => comment.id !== commentId);
        },

        addComment: (state, action) => {
            state.comments.unshift(action.payload)
        },

        updateComment: (state, action) => {
            state.comments = state.comments.map((comment) => {

            })
        },

        resetAllFilters: (state) => {
            
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchComments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchComments.fulfilled, (state, action) => {
                state.comments = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchComments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
    }
});

export const {removeComment, addComment, updateComment} = commentsSlice.actions;

export default commentsSlice.reducer;