import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard/stats').then((r) => {
            setStats(r.data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
            <p className="text-gray-600 mb-6">
                Welcome back, <strong>{user?.name}</strong> ({user?.role}).
            </p>
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard title="Total Applications" value={stats.total_applications ?? 0} color="blue" />
                    <StatCard title="Pending Review" value={stats.pending_reviews ?? 0} color="yellow" />
                    <StatCard title="Approved" value={stats.approved_requests ?? 0} color="green" />
                    <StatCard title="Needs Correction" value={stats.needs_correction ?? 0} color="orange" />
                    {user.role === 'admin' && (
                        <StatCard title="Upcoming Appointments" value={stats.upcoming_appointments ?? 0} color="indigo" />
                    )}
                </div>
                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-lg font-semibold mb-4">Applications by Beneficiary Type</h2>
                    <ul className="space-y-2">
                        {Object.entries(stats.applications_by_beneficiary_type ?? {}).map(([type, count]) => (
                            <li key={type} className="flex justify-between border-b pb-2">
                                <span className="capitalize">{type.replace('_', ' ')}</span>
                                <span className="font-medium">{count}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                </>
            )}
        </div>
    );
}

function StatCard({ title, value, color }) {
    const colors = {
        blue: 'bg-blue-50 border-blue-200 text-blue-700',
        green: 'bg-green-50 border-green-200 text-green-700',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
        orange: 'bg-orange-50 border-orange-200 text-orange-700',
        indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    };
    return (
        <div className={`p-4 rounded border ${colors[color]}`}>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}
