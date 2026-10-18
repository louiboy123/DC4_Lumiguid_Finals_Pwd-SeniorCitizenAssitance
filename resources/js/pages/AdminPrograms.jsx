import { useEffect, useState } from 'react';
import { api } from '../api/axios';

export default function AdminPrograms() {
    const [programs, setPrograms] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', description: '', eligibility: '', is_open: true });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const load = async (page = 1) => {
        setLoading(true);
        setError('');
        try {
            const r = await api.get('/programs', { params: { search, page } });
            setPrograms(r.data.data);
            setMeta(r.data.meta);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to load programs. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [search]);

    const save = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/programs/${editing.id}`, form);
            } else {
                await api.post('/programs', form);
            }
            setOpen(false);
            setEditing(null);
            setForm({ name: '', description: '', eligibility: '', is_open: true });
            load();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors ? Object.values(data.errors).flat().join(' ') : data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        setError('');
        try {
            await api.delete(`/programs/${deletingId}`);
            setDeletingId(null);
            await load(meta.current_page || 1);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to delete program. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Assistance Programs</h1>
                <button
                    onClick={() => { setEditing(null); setForm({ name: '', description: '', eligibility: '', is_open: true }); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + Add Program
                </button>
            </div>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="Search programs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md w-80"
                />
            </div>
            {error && <div className="mb-4 p-3 rounded text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>}
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <>
                <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Name</th>
                                <th className="px-4 py-3 text-left">Eligibility</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.map((p) => (
                                <tr key={p.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-medium">{p.name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{p.eligibility}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            p.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {p.is_open ? 'Open' : 'Closed'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => {
                                                setEditing(p);
                                                setForm({ name: p.name, description: p.description, eligibility: p.eligibility, is_open: p.is_open });
                                                setOpen(true);
                                            }}
                                            className="text-blue-600 hover:underline text-sm mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingId(p.id)}
                                            className="text-red-600 hover:underline text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-3 flex gap-2 text-sm">
                    <button
                        disabled={meta.current_page === 1}
                        onClick={() => load(meta.current_page - 1)}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                        Prev
                    </button>
                    <span>Page {meta.current_page} of {meta.last_page}</span>
                    <button
                        disabled={meta.current_page === meta.last_page}
                        onClick={() => load(meta.current_page + 1)}
                        className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                </>
            )}

            <div className={`fixed inset-0 z-50 ${open ? 'flex' : 'hidden'} items-center justify-center`}>
                <div className="fixed inset-0 bg-black opacity-50" onClick={() => setOpen(false)} />
                <div className="bg-white p-6 rounded w-full max-w-md relative">
                    <h2 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'New'} Program</h2>
                    <form onSubmit={save} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Description</label>
                            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Eligibility</label>
                            <textarea required value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={form.is_open} onChange={(e) => setForm({ ...form, is_open: e.target.checked })} />
                            <label className="text-sm">Is open for applications</label>
                        </div>
                        {error && <div className="text-xs text-red-600">{error}</div>}
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1 border border-gray-300 rounded">Cancel</button>
                            <button type="submit" disabled={saving} className="px-4 py-1 bg-blue-600 text-white rounded disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </form>
                </div>
            </div>

            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setDeletingId(null)} />
                    <div className="bg-white p-6 rounded max-w-md">
                        <h2 className="text-lg font-bold mb-2">Delete program?</h2>
                        <p className="mb-4 text-gray-600">This cannot be undone.</p>
                        <div className="flex gap-2">
                            <button onClick={() => setDeletingId(null)} className="px-4 py-2 border border-gray-300 rounded">Cancel</button>
                            <button onClick={remove} className="px-4 py-2 bg-red-600 text-white rounded">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
