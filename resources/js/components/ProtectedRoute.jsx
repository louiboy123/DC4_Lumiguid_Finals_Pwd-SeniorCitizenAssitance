import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (role && user.role !== role) {
        return (
            <div className="p-6 text-center">
                <h2 className="text-xl font-semibold text-red-700">403 Forbidden</h2>
                <p className="text-gray-600">You do not have permission to access this page.</p>
            </div>
        );
    }

    return children;
}
