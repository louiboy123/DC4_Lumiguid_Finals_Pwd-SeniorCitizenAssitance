import { useEffect, useState } from 'react';
import { api } from '../api/axios';

export default function Programs() {
    const [programs, setPrograms] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/programs', { params: { is_open: true } }).then((r) => {
            setPrograms(r.data.data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Available Programs</h1>
            {loading ? (
                <p className="text-gray-500">Loading programs...</p>
            ) : programs.length === 0 ? (
                <p className="text-gray-600">No programs available at the moment.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.map((p) => (
                        <div key={p.id} className="bg-white p-5 rounded shadow border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-800">{p.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                            <p className="text-sm text-gray-500 mt-3"><strong>Eligibility:</strong> {p.eligibility}</p>
                            <span className="inline-block mt-3 px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded">
                                Open
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
