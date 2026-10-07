import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, thunkAPI) => {
    try {
      const response = await authService.getCurrentUser();
      return response.data.user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Not authenticated');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ credentials, selectedRole }, thunkAPI) => {
    try {
      const response = await authService.login(credentials);
      const user = response.data.user;

      // Verify the returned role against the selected frontend UI role
      if (selectedRole === 'admin' && user.role !== 'admin') {
        await authService.logout(); // Clear the HTTP-only cookie immediately
        return thunkAPI.rejectWithValue('This account does not have administrator access.');
      }
      
      if (selectedRole === 'parent' && user.role !== 'parent') {
        await authService.logout();
        return thunkAPI.rejectWithValue('This account does not have parent access.');
      }

      if (selectedRole === 'staff' && user.role !== 'staff') {
        await authService.logout();
        return thunkAPI.rejectWithValue('This account does not have staff access.');
      }

      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const faceLogin = createAsyncThunk(
  'auth/faceLogin',
  async (imageData, thunkAPI) => {
    try {
      const response = await authService.faceLogin(imageData);
      const user = response.data.user;
      return user;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Face not recognized');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, thunkAPI) => {
    try {
      await authService.logout();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // Start loading to check session on mount
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Face Login
      .addCase(faceLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(faceLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(faceLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
