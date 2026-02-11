import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { Search, Download, Printer } from 'lucide-react';
import { Capacitor } from '@capacitor/core';

const AdminStudentDetails = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        // "Admin Panel: Can see full student details (email included)"
        // We fetch from 'users' or 'profiles' where role is student (or all).
        // Assuming 'users' table has logic usually.
        // But 'users' table in Supabase Auth is protected. We usually use a public profile table.
        // Based on previous files, we use 'users' public table.

        const { data } = await supabase
            .from('users')
            .select('*')
            // "Admin, Teacher, Support staff ko chorke baki" -> Exclude Staff
            .neq('role', 'admin')
            .neq('role', 'instructor')
            .neq('role', 'support')
            .order('created_at', { ascending: false });

        if (data) setStudents(data);
        setLoading(false);
    };

    const handleExportCSV = async () => {
        const headers = ["Unique ID", "Full Name", "Email", "Phone", "Address", "Joined Date"];
        const csvContent = [
            headers.join(','),
            ...students.map(s => [
                s.unique_id || 'N/A',
                `\"${s.full_name || ''}\"`,
                s.email,
                s.phone_number || '',
                `\"${s.address_line1 || ''}\"`,
                new Date(s.created_at).toLocaleDateString()
            ].join(','))
        ].join('\n');

        try {
            if (Capacitor.isNativePlatform()) {
                const fileName = `student_details_${new Date().toISOString().split('T')[0]}.csv`;
                const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
                const { Share } = await import('@capacitor/share');

                // Write file to Cache directory
                const result = await Filesystem.writeFile({
                    path: fileName,
                    data: csvContent,
                    directory: Directory.Cache,
                    encoding: Encoding.UTF8
                });

                // Share the file
                await Share.share({
                    title: 'Export Student Details',
                    text: 'Here is the student details CSV export.',
                    url: result.uri,
                    dialogTitle: 'Share CSV'
                });

            } else {
                // Web Fallback
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `student_details_${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
            }
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed due to platform restrictions.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const filteredStudents = students.filter(s =>
        (s.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (s.unique_id?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h1 className="text-2xl font-serif text-white">Student Details</h1>
                <div className="flex gap-2">
                    <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors">
                        <Download size={18} /> Export CSV
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary/90 transition-colors">
                        <Printer size={18} /> Print / PDF
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 text-zinc-500" size={20} />
                <input
                    type="text"
                    placeholder="Search by name, email, or ID..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary/50"
                />
            </div>

            {/* Table */}
            <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-zinc-400 min-w-[1000px]">
                        <thead className="bg-zinc-800/50 text-white uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Unique ID</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Phone</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">Loading...</td></tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-8 text-center">No students found.</td></tr>
                            ) : (
                                filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-mono text-primary font-medium">{student.unique_id || '-'}</td>
                                        <td className="px-6 py-4 text-white font-medium">{student.full_name || 'Anonymous'}</td>
                                        <td className="px-6 py-4">{student.email}</td>
                                        <td className="px-6 py-4">{student.phone_number || '-'}</td>
                                        <td className="px-6 py-4 truncate max-w-xs">{student.address_line1 || '-'}</td>
                                        <td className="px-6 py-4">{new Date(student.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminStudentDetails;
