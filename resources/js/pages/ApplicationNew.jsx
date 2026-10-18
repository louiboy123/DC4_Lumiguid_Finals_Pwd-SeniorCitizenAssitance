import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function ApplicationNew() {
    const [programs, setPrograms] = useState([]);
    const [programId, setProgramId] = useState('');
    const [remarks, setRemarks] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        api.get('/programs', { params: { is_open: true } }).then((r) => setPrograms(r.data.data));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await api.post('/applications', { assistance_program_id: programId, remarks });
            setSuccess('Application submitted successfully!');
            setProgramId('');
            setRemarks('');
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors ? Object.values(data.errors).flat().join(' ') : data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Submit Assistance Application</h1>
                <p className="text-gray-600 mb-6">
                    Choose a program and submit your request. Supporting documents can be uploaded after submission.
                </p>
                {error && (
                    <div className="mb-4 p-3 rounded text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>
                )}
                {success && (
                    <div className="mb-4 p-3 rounded text-sm text-green-700 bg-green-50 border border-green-100">
                        {success}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Assistance Program</label>
                        <select
                            required
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select a program</option>
                            {programs.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            {programs.find((p) => p.id === programId)?.eligibility || ''}
                        </p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Remarks (optional)</label>
                        <textarea
                            rows={3}
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <p className="text-xs text-gray-500">
                        Applicant: {user?.name} ({user?.email})
                    </p>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700"
                    >
                        {loading ? 'Submitting...' : 'Submit Application'}
                    </button>
                </form>
                <p className="mt-4 text-sm text-gray-600">
                    <Link to="/applications" className="text-blue-600 hover:underline">Back to my applications</Link>
                </p>
            </div>
        </div>
    );
}
