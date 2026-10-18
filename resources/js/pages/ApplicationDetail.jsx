import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';

export default function ApplicationDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // New document upload
    const [docType, setDocType] = useState('');
    const [file, setFile] = useState(null);
    const [docLoading, setDocLoading] = useState(false);

    // Admin status update
    const [newStatus, setNewStatus] = useState('');
    const [staffRemarks, setStaffRemarks] = useState('');
    const [statusLoading, setStatusLoading] = useState(false);

    useEffect(() => {
        api
            .get(`/applications/${id}`)
            .then((r) => setApp(r.data))
            .catch(() => setError('Failed to load application'))
            .finally(() => setLoading(false));
    }, [id]);

    const uploadDoc = async (e) => {
        e.preventDefault();
        if (!file) return;
        setDocLoading(true);
        const form = new FormData();
        form.append('document_type', docType);
        form.append('file', file);
        try {
            await api.post(`/applications/${id}/documents`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setDocType('');
            setFile(null);
            api.get(`/applications/${id}`).then((r) => setApp(r.data));
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed');
        } finally {
            setDocLoading(false);
        }
    };

    const updateStatus = async (e) => {
        e.preventDefault();
        if (!newStatus) return;
        setStatusLoading(true);
        try {
            await api.put(`/applications/${id}`, { status: newStatus, remarks: staffRemarks });
            api.get(`/applications/${id}`).then((r) => setApp(r.data));
            setNewStatus('');
            setStaffRemarks('');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        } finally {
            setStatusLoading(false);
        }
    };

    const statusLabel = (s) =>
        s === 'approved' ? 'Approved' : s === 'rejected' ? 'Rejected' : s === 'needs_correction' ? 'Needs Correction' : s === 'under_review' ? 'Under Review' : 'Submitted';

    if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
    if (!app) return <p className="p-6 text-red-600">{error}</p>;

    const isAdmin = user?.role === 'admin';
    const isOwner = app.user_id === user?.id;

    return (
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Application {app.application_number}</h1>
                    <p className="text-gray-600">
                        <span className="font-semibold">Program:</span> {app.program?.name}{' '}
                        <span className="font-semibold">Applicant:</span> {app.user?.name}{' '}
                        <span className="font-semibold">Submitted:</span> {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString() : '-'}
                    </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    app.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : app.status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : app.status === 'needs_correction'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                }`}>
                    {statusLabel(app.status)}
                </span>
            </div>
            <Link to="/applications" className="mb-4 inline-block text-sm text-blue-600 hover:underline">
                &larr; Back to applications
            </Link>

            {isOwner && app.status === 'needs_correction' && app.remarks && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded text-sm text-orange-700">
                    <strong>Staff remarks:</strong> {app.remarks}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded shadow mb-6">
                        <h2 className="text-lg font-semibold mb-3">Supporting Documents</h2>
                        {app.documents?.length ? (
                            <ul className="space-y-2">
                                {app.documents.map((d) => (
                                    <li key={d.id} className="flex items-center justify-between border-b pb-2">
                                        <span className="text-sm">{d.document_type}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                            d.verification_status === 'verified'
                                                ? 'bg-green-100 text-green-700'
                                                : d.verification_status === 'rejected'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-600'
                                        }`}>
                                            {d.verification_status.replace(/_/g, ' ')}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-gray-500">No documents uploaded yet.</p>
                        )}
                        <form onSubmit={uploadDoc} className="mt-6 space-y-2">
                            <h3 className="text-sm font-semibold text-gray-700">Upload a document</h3>
                            <select
                                value={docType}
                                onChange={(e) => setDocType(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="">Document type</option>
                                <option value="Valid ID">Valid ID</option>
                                <option value="Medical Certificate">Medical Certificate</option>
                                <option value="Proof of Residency">Proof of Residency</option>
                                <option value="Barangay Clearance">Barangay Clearance</option>
                                <option value="Birth Certificate">Birth Certificate</option>
                                <option value="Other">Other</option>
                            </select>
                            <input
                                type="file"
                                required
                                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm"
                            />
                            <button
                                type="submit"
                                disabled={docLoading}
                                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
                            >
                                {docLoading ? 'Uploading...' : 'Upload'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded shadow mb-6">
                        <h2 className="text-lg font-semibold mb-3">Status History</h2>
                        <ul className="space-y-3">
                            {app.status_history?.map((h) => (
                                <li key={h.id} className="border-b pb-3 last:border-0">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{statusLabel(h.status)}</span>
                                        <span className="text-gray-500 text-xs">{new Date(h.created_at).toLocaleString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{h.remarks || '-'}</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        By: {h.changer?.name || 'System'}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    {isAdmin && (
                        <div className="bg-white p-6 rounded shadow sticky top-6">
                            <h2 className="text-lg font-semibold mb-3">Update Status</h2>
                            <form onSubmit={updateStatus} className="space-y-3">
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="">New status</option>
                                    <option value="under_review">Under Review</option>
                                    <option value="needs_correction">Needs Correction</option>
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                </select>
                                <textarea
                                    rows={2}
                                    value={staffRemarks}
                                    onChange={(e) => setStaffRemarks(e.target.value)}
                                    placeholder="Remarks"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                />
                                <button
                                    type="submit"
                                    disabled={statusLoading}
                                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50"
                                >
                                    {statusLoading ? 'Saving...' : 'Update Status'}
                                </button>
                            </form>
                        </div>
                    )}
                    {isOwner && (
                        <div className="bg-white p-6 rounded shadow">
                            <h2 className="text-lg font-semibold mb-3">Details</h2>
                            <p className="text-sm text-gray-600">
                                Application #: <span className="font-mono">{app.application_number}</span>
                            </p>
                            <p className="text-sm text-gray-600">Status: <strong>{statusLabel(app.status)}</strong></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
