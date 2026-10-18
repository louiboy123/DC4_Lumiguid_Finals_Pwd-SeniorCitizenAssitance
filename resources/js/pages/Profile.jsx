import { useEffect, useState } from 'react';
import { api } from '../api/axios';
import { useAuth } from '../contexts/AuthContext';

const profileFormFromUser = (userData) => ({
    name: userData?.name || '',
    email: userData?.email || '',
    beneficiary_type: userData?.profile?.beneficiary_type || '',
    id_number: userData?.profile?.id_number || '',
    birth_date: userData?.profile?.birth_date || '',
    address: userData?.profile?.address || '',
    contact_number: userData?.profile?.contact_number || '',
    disability_type: userData?.profile?.disability_type || '',
});

export default function Profile() {
    const { user, me } = useAuth();
    const [profile, setProfile] = useState(user?.profile || null);
    const [form, setForm] = useState(() => profileFormFromUser(user));
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        me().then((userData) => {
            setProfile(userData.profile || null);
            setForm(profileFormFromUser(userData));
        });
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await api.put('/profile', form);
            setSuccess('Profile updated successfully.');
            setForm(profileFormFromUser(res.data));
            setProfile(res.data.profile);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.errors ? Object.values(data.errors).flat().join(' ') : data?.message || 'Update failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>
            {error && (
                <div className="mb-4 p-3 rounded text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>
            )}
            {success && (
                <div className="mb-4 p-3 rounded text-sm text-green-700 bg-green-50 border border-green-100">{success}</div>
            )}
            <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded shadow space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Beneficiary Type</label>
                    <select
                        value={form.beneficiary_type}
                        onChange={(e) => setForm({ ...form, beneficiary_type: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="pwd">Person with Disability</option>
                        <option value="senior_citizen">Senior Citizen</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ID Number</label>
                    <input
                        value={form.id_number}
                        onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                    <input
                        type="date"
                        value={form.birth_date}
                        onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input
                        value={form.contact_number}
                        onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Disability Type (if PWD)</label>
                    <input
                        value={form.disability_type}
                        onChange={(e) => setForm({ ...form, disability_type: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
                <div className="sm:col-span-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
}
