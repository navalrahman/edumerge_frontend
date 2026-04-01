"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/apiClient';
import { motion } from 'framer-motion';
import { BarChart, Users, FileText, CheckCircle } from 'lucide-react';

export default function Home() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/stats');
            setStats(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    if (!stats) return <div className="animate-pulse space-y-4 pt-10 px-4 text-xl font-bold text-gray-500">Syncing Dashboard Data...</div>;

    console.log(stats);

    return (
        <div className="space-y-8 animate-fade-in pb-10 pt-4">
            <header>
                <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">System Dashboard</h1>
                <p className="text-gray-500 font-medium mt-2">Overview of admissions, quotas, and pending actions.</p>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="text-blue-600" size={24} />} title="Admitted / Intake" value={`${stats.totalAdmitted} / ${stats.totalIntake}`} />
                <StatCard icon={<BarChart className="text-indigo-600" size={24} />} title="Remaining Seats" value={stats.totalIntake - stats.totalAdmitted} />
                <StatCard icon={<FileText className="text-yellow-600" size={24} />} title="Pending Documents" value={stats.pendingDocsCount || 0} />
                <StatCard icon={<CheckCircle className="text-emerald-600" size={24} />} title="Pending Fees" value={stats.pendingFeeCount || 0} />
            </div>

            {/* Seat Matrix */}
            <div>
                <h2 className="text-xl font-black mb-4 text-gray-800 tracking-tight">Program Seat Matrix</h2>
                <div className="grid grid-cols-1 gap-6">
                    {stats.seatMatrix?.map((prog: any, idx: number) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-white border p-6 rounded-xl shadow-sm overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
                                <div>
                                    <h3 className="text-xl font-black text-gray-800 tracking-tight">{prog.programName}</h3>
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mt-1">Total Intake: {prog.totalIntake}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Quota Progress */}
                                {['KCET', 'COMEDK', 'Management'].map(q => {
                                    const filled = prog.filledSeats?.[q] || 0;
                                    const total = prog.quotas?.[q] || 0;
                                    const percent = total > 0 ? (filled / total) * 100 : 0;
                                    return (
                                        <div key={q} className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 transition-all">
                                                <span className="text-gray-500">{q}</span>
                                                <span className={percent >= 100 ? "text-rose-500" : "text-blue-600"}>{filled} / {total}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 shadow-inner overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${percent >= 100 ? "bg-rose-500" : "bg-blue-600"}`}
                                                    style={{ width: `${percent}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    ))}
                    {(!stats.seatMatrix || stats.seatMatrix.length === 0) && (
                        <div className="bg-gray-50 p-12 text-center rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No programs configured. Go to Masters to create one.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string | number }) {
    return (
        <motion.div whileHover={{ y: -5 }} className="bg-white p-6 border rounded-xl shadow-sm flex items-center gap-4 transition-all hover:border-blue-200">
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
                <p className="text-2xl font-black mt-1 text-gray-900 tracking-tighter">{value}</p>
            </div>
        </motion.div>
    );
}
