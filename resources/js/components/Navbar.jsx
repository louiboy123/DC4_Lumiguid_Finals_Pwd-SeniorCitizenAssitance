import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="bg-blue-700 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xl">PWD &amp; Senior Citizen Portal</span>
                    </div>
                    <div className="hidden md:flex items-center gap-4">
                        <a href="/dashboard" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                            Dashboard
                        </a>
                        {user?.role === 'beneficiary' && (
                            <>
                                <a href="/programs" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                                    Programs
                                </a>
                                <a href="/applications" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                                    My Applications
                                </a>
                                <a href="/profile" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                                    Profile
                                </a>
                            </>
                        )}
                        {user?.role === 'admin' && (
                            <>
                                <a href="/admin/applications" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                                    Applications
                                </a>
                                <a href="/admin/programs" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                                    Programs
                                </a>
                                <a href="/admin/announcements" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                                    Announcements
                                </a>
                                <a href="/admin/appointments" className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded">
                                    Appointments
                                </a>
                            </>
                        )}
                        <button
                            onClick={logout}
                            className="px-3 py-2 text-sm font-medium hover:bg-blue-600 rounded"
                        >
                            Sign out ({user?.name})
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
