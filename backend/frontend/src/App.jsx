import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';

const ProtectedRoute = ({ children }) => {
const token = localStorage.getItem('token');
return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
const token = localStorage.getItem('token');
return token ? <Navigate to="/dashboard" replace /> : children;
};

function App() {
return ( <Router> <Routes>

```
    <Route
      path="/login"
      element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      }
    />

    <Route
      path="/register"
      element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      }
    />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    <Route
      path="/appointments"
      element={
        <ProtectedRoute>
          <Appointments />
        </ProtectedRoute>
      }
    />

    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />

  </Routes>

  <ToastContainer />
</Router>


);
}

export default App;
