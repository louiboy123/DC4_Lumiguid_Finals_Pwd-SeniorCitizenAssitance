import { useEffect, useState } from 'react';
import { api } from '../api/axios';

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', message: '', publish_date: '', is_active: true });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const load = () => {
        setLoading(true);
        api.get('/announcements', { params: { all: true } }).then((r) => {
            setAnnouncements(r.data.data);
            setMeta(r.data.meta);
            setLoading(false);
        });
    };

    useEffect(() => {
        load();
    }, []);

    const save = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/announcements/${editing.id}`, form);
            } else {
                await api.post('/announcements', form);
            }
            setOpen(false);
            setEditing(null);
            setForm({ title: '', message: '', publish_date: '', is_active: true });
            load();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors ? Object.values(data.errors).flat().join(' ') : data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        await api.delete(`/announcements/${deletingId}`);
        setDeletingId(null);
        load();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Announcements</h1>
                <button
                    onClick={() => { setEditing(null); setForm({ title: '', message: '', publish_date: '', is_active: true }); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + Add Announcement
                </button>
            </div>
            {error && <div className="mb-4 p-3 rounded text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>}
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full bg-white rounded shadow border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Title</th>
                                <th className="px-4 py-3 text-left">Message</th>
                                <th className="px-4 py-3 text-left">Publish date</th>
                                <th className="px-4 py-3 text-left">Active</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.map((a) => (
                                <tr key={a.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-medium">{a.title}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[200px]">{a.message}</td>
                                    <td className="px-4 py-3 text-sm">{a.publish_date ? new Date(a.publish_date).toLocaleDateString() : '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            a.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {a.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => {
                                                setEditing(a);
                                                setForm({ title: a.title, message: a.message, publish_date: a.publish_date ? new Date(a.publish_date).toISOString().slice(0, 16) : '', is_active: a.is_active });
                                                setOpen(true);
                                            }}
                                            className="text-blue-600 hover:underline text-sm mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button onClick={() => setDeletingId(a.id)} className="text-red-600 hover:underline text-sm">
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className={`fixed inset-0 z-50 ${open ? 'flex' : 'hidden'} items-center justify-center`}>
                <div className="fixed inset-0 bg-black opacity-50" onClick={() => setOpen(false)} />
                <div className="bg-white p-6 rounded w-full max-w-md relative">
                    <h2 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'New'} Announcement</h2>
                    <form onSubmit={save} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">Title</label>
                            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Message</label>
                            <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Publish date</label>
                            <input type="datetime-local" value={form.publish_date} onChange={(e) => setForm({ ...form, publish_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                            <label className="text-sm">Active</label>
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
                        <h2 className="text-lg font-bold mb-2">Delete announcement?</h2>
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
