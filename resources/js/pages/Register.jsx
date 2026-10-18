import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        beneficiary_type: '',
        id_number: '',
        birth_date: '',
        address: '',
        contact_number: '',
        disability_type: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            const data = err.response?.data;
            if (data?.errors) {
                const msgs = Object.values(data.errors).flat().join(' ');
                setError(msgs);
            } else {
                setError(data?.message || 'Registration failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-2xl w-full space-y-6 p-6 bg-white rounded-lg shadow">
                <h2 className="text-center text-2xl font-bold text-gray-800">Create Account</h2>
                <p className="text-center text-sm text-gray-600">
                    Register as a beneficiary (PWD or senior citizen)
                </p>
                {error && (
                    <div className="p-3 rounded text-sm text-red-700 bg-red-50 border border-red-100">{error}</div>
                )}
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Beneficiary Type</label>
                        <select
                            required
                            value={form.beneficiary_type}
                            onChange={(e) => setForm({ ...form, beneficiary_type: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Select type</option>
                            <option value="pwd">Person with Disability</option>
                            <option value="senior_citizen">Senior Citizen</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Number</label>
                        <input
                            required
                            value={form.id_number}
                            onChange={(e) => setForm({ ...form, id_number: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Birth Date</label>
                        <input
                            type="date"
                            required
                            max={new Date().toISOString().slice(0, 10)}
                            value={form.birth_date}
                            onChange={(e) => setForm({ ...form, birth_date: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                        <input
                            type="tel"
                            required
                            value={form.contact_number}
                            onChange={(e) => setForm({ ...form, contact_number: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Address</label>
                        <textarea
                            required
                            rows={2}
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                    {form.beneficiary_type === 'pwd' && (
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Disability Type (optional)</label>
                            <input
                                value={form.disability_type}
                                onChange={(e) => setForm({ ...form, disability_type: e.target.value })}
                                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="sm:col-span-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50 hover:bg-blue-700"
                    >
                        {loading ? 'Creating account...' : 'Register'}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
