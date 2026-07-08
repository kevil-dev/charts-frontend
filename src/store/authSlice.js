import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authApi } from "@/services/authApi";

const initialState = {
  user: null,
  isLoading: true,
};

// Fetches the current user from the httpOnly mp_token cookie via /auth/me.
// authApi.me() returns the payload directly (api.js unwraps response.data.data);
// the backend may return either { user } or the user object directly.
export const fetchUser = createAsyncThunk("auth/fetchUser", async () => {
  const data = await authApi.me();
  return data.user ?? data;
});

export const login = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { dispatch, rejectWithValue }) => {
    try {
      await authApi.login({ email, password });
      await dispatch(fetchUser()).unwrap();
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status,
        code: err.code,
      });
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (credential, { dispatch, rejectWithValue }) => {
    try {
      await authApi.google(credential);
      await dispatch(fetchUser()).unwrap();
    } catch (err) {
      return rejectWithValue({
        message: err.message,
        status: err.status,
        code: err.code,
      });
    }
  }
);

// Logout swallows server errors — client state is cleared regardless.
export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await authApi.logout();
  } catch {
    // server call failed — still clear client state
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchUser.rejected, (state) => {
        state.user = null;
        state.isLoading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export const { setUser } = authSlice.actions;

export const selectUser = (state) => state.auth.user;
export const selectAuthLoading = (state) => state.auth.isLoading;

export default authSlice.reducer;
