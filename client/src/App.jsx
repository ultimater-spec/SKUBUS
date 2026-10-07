import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from './store/slices/authSlice';
import AppRoutes from './routes/AppRoutes';

import ErrorBoundary from './components/layout/ErrorBoundary';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <Router>
      <Toaster position="top-right" />
      <AppRoutes />
    </Router>
    </ErrorBoundary>
  );
}

export default App;
