// src/App.jsx
import "./assets/css/App.css";

// Pages & Components
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import PageTransition from "./components/PageTransition";
import LoadingSpinner from "./components/LoadingSpinner";

// React
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from 'react';

function App() {
  return (
    <Router>
      <div className="app">

        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/login" element={
              <PageTransition>
                <Login />
              </PageTransition>
            } />

            <Route path="/signup" element={
              <PageTransition>
                <Signup />
              </PageTransition>
            } />

            <Route path="/verify" element={
              <PageTransition>
                <VerifyEmail />
              </PageTransition>
            } />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Dashboard />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </div>
    </Router>
  );
}

export default App;