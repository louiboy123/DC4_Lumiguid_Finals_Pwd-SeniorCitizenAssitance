import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function Applications() {
    const { user } = useAuth();
    const [apps, setApps] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', search: '' });

    const fetchApps = () => {
        setLoading(true);
        api
            .get('/applications', { params: filters })
            .then((r) => {
                setApps(r.data.data);
                setMeta(r.data.meta);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchApps();
    }, [filters.status, filters.search]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">My Applications</h1>
            <Link to="/applications/new" className="mb-4 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                Submit New Application
            </Link>
            <div className="flex gap-2 mb-4">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                    <option value="">All statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="needs_correction">Needs Correction</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <input
                    type="text"
                    placeholder="Search application number..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
                />
            </div>
            {loading ? (
                <p className="text-gray-500">Loading applications...</p>
            ) : apps.length === 0 ? (
                <p className="text-gray-600">No applications found.</p>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-4 py-2">Application #</th>
                                <th className="px-4 py-2">Program</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Submitted</th>
                                <th className="px-4 py-2 text-right">Remarks</th>
                                <th className="px-4 py-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((a) => (
                                <tr key={a.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-mono text-sm">{a.application_number}</td>
                                    <td className="px-4 py-3 text-sm">{a.program?.name}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            a.status === 'approved'
                                                ? 'bg-green-100 text-green-700'
                                                : a.status === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : a.status === 'needs_correction'
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {a.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-500">{a.remarks || '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <Link to={`/applications/${a.id}`} className="text-blue-600 hover:underline text-sm">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                        Showing {meta.from} to {meta.to} of {meta.total}
                    </div>
                    <div className="flex gap-1">
                        <button
                            disabled={meta.current_page === 1}
                            onClick={() => setFilters({ ...filters, page: meta.current_page - 1 })}
                            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                        >
                            Prev
                        </button>
                        <span className="px-2">Page {meta.current_page} of {meta.last_page}</span>
                        <button
                            disabled={meta.current_page === meta.last_page}
                            onClick={() => setFilters({ ...filters, page: meta.current_page + 1 })}
                            className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}
