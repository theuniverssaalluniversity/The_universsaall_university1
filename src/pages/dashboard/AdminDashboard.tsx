
const AdminDashboard = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-serif text-white">Company Headquarters</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Revenue Operations</h3>
                    <div className="h-64 flex items-center justify-center text-zinc-600 border border-dashed border-zinc-800 rounded-lg">
                        Chart (Revenue vs Time)
                    </div>
                </div>

                <div className="bg-zinc-900 border border-white/5 rounded-xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">System Health</h3>
                    <div className="space-y-4">
                        {[
                            { label: 'Database Status', status: 'Healthy', color: 'text-green-500' },
                            { label: 'Storage Usage', status: '12% Used', color: 'text-blue-500' },
                            { label: 'Active Sessions', status: '45 Users', color: 'text-primary' },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
                                <span className="text-zinc-400">{item.label}</span>
                                <span className={`font-medium ${item.color}`}>{item.status}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
