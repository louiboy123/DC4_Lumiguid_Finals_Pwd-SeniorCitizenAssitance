import { useEffect, useState } from 'react';
import { api } from '../api/axios';

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [meta, setMeta] = useState({});
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ assistance_application_id: '', appointment_date: '', purpose: '', status: 'scheduled' });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    const load = () => {
        setLoading(true);
        api.get('/appointments').then((r) => {
            setAppointments(r.data.data);
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
                await api.put(`/appointments/${editing.id}`, form);
            } else {
                await api.post('/appointments', form);
            }
            setOpen(false);
            setEditing(null);
            setForm({ assistance_application_id: '', appointment_date: '', purpose: '', status: 'scheduled' });
            load();
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors ? Object.values(data.errors).flat().join(' ') : data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const remove = async () => {
        await api.delete(`/appointments/${deletingId}`);
        setDeletingId(null);
        load();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
                <button
                    onClick={() => { setEditing(null); setForm({ assistance_application_id: '', appointment_date: '', purpose: '', status: 'scheduled' }); setOpen(true); }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    + Schedule Appointment
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
                                <th className="px-4 py-3 text-left">Application</th>
                                <th className="px-4 py-3 text-left">Applicant</th>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Purpose</th>
                                <th className="px-4 py-3 text-left">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((ap) => (
                                <tr key={ap.id} className="border-b last:border-0">
                                    <td className="px-4 py-3 font-mono text-sm">{ap.application?.application_number}</td>
                                    <td className="px-4 py-3 text-sm">{ap.application?.user?.name}</td>
                                    <td className="px-4 py-3 text-sm">{ap.appointment_date ? new Date(ap.appointment_date).toLocaleString() : '-'}</td>
                                    <td className="px-4 py-3 text-sm">{ap.purpose}</td>
                                    <td className="px-4 py-3 text-sm capitalize">{ap.status}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => {
                                                setEditing(ap);
                                                setForm({
                                                    assistance_application_id: ap.assistance_application_id,
                                                    appointment_date: ap.appointment_date ? new Date(ap.appointment_date).toISOString().slice(0, 16) : '',
                                                    purpose: ap.purpose,
                                                    status: ap.status,
                                                });
                                                setOpen(true);
                                            }}
                                            className="text-blue-600 hover:underline text-sm mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button onClick={() => setDeletingId(ap.id)} className="text-red-600 hover:underline text-sm">
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
                    <h2 className="text-lg font-bold mb-4">{editing ? 'Edit' : 'New'} Appointment</h2>
                    <form onSubmit={save} className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium">Application Number</label>
                            <input required value={form.assistance_application_id} onChange={(e) => setForm({ ...form, assistance_application_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="e.g. APP-20261017-ABCD12" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Appointment date</label>
                            <input type="datetime-local" required value={form.appointment_date} onChange={(e) => setForm({ ...form, appointment_date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Purpose</label>
                            <input required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Status</label>
                            <select required value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded">
                                <option value="scheduled">Scheduled</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                        {error && <div className="text-xs text-red-600">{error}</div>}
                        <p className="text-xs text-gray-500">Enter the application number of an existing assistance application.</p>
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
                        <h2 className="text-lg font-bold mb-2">Delete appointment?</h2>
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
