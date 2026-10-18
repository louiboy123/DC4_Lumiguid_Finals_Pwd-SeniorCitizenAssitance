import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

export default function AdminApplications() {
    const [apps, setApps] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '', program: '', search: '', beneficiary_type: '', date_from: '', date_to: '' });
    const { user } = useAuth();

    const load = () => {
        setLoading(true);
        api.get('/applications', { params: { ...filters } }).then((r) => {
            setApps(r.data.data);
            setMeta(r.data.meta);
            setLoading(false);
        });
    };

    useEffect(() => {
        load();
    }, [filters.status, filters.program, filters.search, filters.beneficiary_type, filters.date_from, filters.date_to]);

    const statusLabel = (s) => s.replace(/_/g, ' ');

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">All Applications</h1>
            <div className="flex flex-wrap gap-3 mb-6">
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="px-3 py-2 border rounded text-sm">
                    <option value="">All statuses</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="needs_correction">Needs Correction</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <input type="text" placeholder="Search application number / name / email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="px-3 py-2 border rounded text-sm w-80" />
            </div>
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : apps.length === 0 ? (
                <p className="text-gray-600">No applications found.</p>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Application #</th>
                                <th className="px-4 py-3 text-left">Applicant</th>
                                <th className="px-4 py-3 text-left">Type</th>
                                <th className="px-4 py-3 text-left">Program</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-left">Submitted</th>
                                <th className="px-4 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {apps.map((a) => (
                                <tr key={a.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-mono text-sm">{a.application_number}</td>
                                    <td className="px-4 py-3 text-sm">{a.user?.name}</td>
                                    <td className="px-4 py-3 text-sm capitalize">{a.user?.profile?.beneficiary_type || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{a.program?.name}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-700' : a.status === 'needs_correction' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {statusLabel(a.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        <a href={`/applications/${a.id}`} className="text-blue-600 hover:underline text-sm">View</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex gap-2 text-sm">
                    <button disabled={meta.current_page === 1} onClick={() => { api.get('/applications', { params: { ...filters, page: meta.current_page - 1 } }).then((r) => { setApps(r.data.data); setMeta(r.data.meta); }); }} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Prev</button>
                    <span>Page {meta.current_page} of {meta.last_page}</span>
                    <button disabled={meta.current_page === meta.last_page} onClick={() => { api.get('/applications', { params: { ...filters, page: meta.current_page + 1 } }).then((r) => { setApps(r.data.data); setMeta(r.data.meta); }); }} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50">Next</button>
                </div>
                </>
            )}
        </div>
    );
}
