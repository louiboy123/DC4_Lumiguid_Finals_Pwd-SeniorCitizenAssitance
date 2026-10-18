import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationNew from './pages/ApplicationNew';
import ApplicationDetail from './pages/ApplicationDetail';
import Profile from './pages/Profile';
import Programs from './pages/Programs';
import AdminPrograms from './pages/AdminPrograms';
import AdminAnnouncements from './pages/AdminAnnouncements';
import AdminApplications from './pages/AdminApplications';
import AdminAppointments from './pages/AdminAppointments';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar />
                <div className="min-h-screen bg-gray-100">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/programs"
                            element={
                                <ProtectedRoute>
                                    <Programs />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/applications"
                            element={
                                <ProtectedRoute>
                                    <Applications />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/applications/new"
                            element={
                                <ProtectedRoute>
                                    <ApplicationNew />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/applications/:id"
                            element={
                                <ProtectedRoute>
                                    <ApplicationDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin/*"
                            element={
                                <ProtectedRoute role="admin">
                                    <AdminRoutes />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

function AdminRoutes() {
    return (
        <Routes>
            <Route path="applications" element={<AdminApplications />} />
            <Route path="programs" element={<AdminPrograms />} />
            <Route path="announcements" element={<AdminAnnouncements />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route index element={<Navigate to="/admin/applications" replace />} />
        </Routes>
    );
}

createRoot(document.getElementById('root')).render(<App />);
