"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/apiClient";
import DashboardLayout from "../_components/DashboardLayout";

const seatMatrixSchema = z.object({
  programId: z.string().min(1, "Program Selection is required"),
  totalIntake: z.coerce.number().min(1, "Total Intake must be at least 1"),
  quotas: z.object({
    KCET: z.coerce.number().min(0).default(0),
    COMEDK: z.coerce.number().min(0).default(0),
    Management: z.coerce.number().min(0).default(0),
  }),
}).refine(data => {
  const sum = (data.quotas.KCET || 0) + (data.quotas.COMEDK || 0) + (data.quotas.Management || 0);
  return sum === data.totalIntake;
}, {
  message: "Sum of quotas must equal the Total Intake",
  path: ["totalIntake"]
});

type SeatMatrixValues = z.infer<typeof seatMatrixSchema>;

export default function SeatMatrixPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SeatMatrixValues>({
    resolver: zodResolver(seatMatrixSchema) as any,
    defaultValues: {
      quotas: { KCET: 0, COMEDK: 0, Management: 0 }
    }
  });

  const watchIntake = watch("totalIntake");
  const watchQuotas = watch("quotas");
  const totalQuota = (Number(watchQuotas?.KCET) || 0) + (Number(watchQuotas?.COMEDK) || 0) + (Number(watchQuotas?.Management) || 0);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const res = await api.get("/programs");
      setPrograms(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmit: SubmitHandler<SeatMatrixValues> = async (data) => {
    console.log("Submitting Seat Matrix Data:", data);

    setLoading(true);
    try {
      await api.put(`/program/${data.programId}`, {
        totalIntake: data.totalIntake,
        quotas: data.quotas,
      });
      alert("✅ Seat Matrix Updated Successfully!");
      reset({ programId: "", totalIntake: 0, quotas: { KCET: 0, COMEDK: 0, Management: 0 } });
      fetchPrograms();
    } catch (error: any) {
      console.error("❌ Seat Matrix Update Error:", error);
      alert(error.response?.data?.error || "Failed to update Seat Matrix. Please check permissions or quota sum.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto text-black">
        <h1 className="text-2xl font-black mb-10 text-gray-800">Seat Matrix & Quotas</h1>

        <div className="bg-white p-8 rounded-2xl border shadow-sm mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-6">Allocate Intake Caps</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-3">Select Program</label>
                <select {...register("programId")} className="w-full border border-gray-300 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-bold">
                  <option value="">Choose program...</option>
                  {programs.map(p => (
                    <option key={p._id} value={p._id}>{p.programName} ({p.admissionMode}) - {p.academicYear}</option>
                  ))}
                </select>
                {errors.programId && <p className="text-red-500 text-xs mt-1">{errors.programId.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-3">Total Intake</label>
                <input type="number" {...register("totalIntake")} className={`w-full border rounded px-4 py-3 font-bold text-xl ${errors.totalIntake ? "border-red-500" : "border-gray-300"}`} placeholder="0" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-6 rounded-2xl border border-dashed text-black">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">KCET Quota</label>
                <input type="number" {...register("quotas.KCET")} className="w-full border border-gray-300 rounded px-3 py-2 font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">COMEDK Quota</label>
                <input type="number" {...register("quotas.COMEDK")} className="w-full border border-gray-300 rounded px-3 py-2 font-bold" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Management Quota</label>
                <input type="number" {...register("quotas.Management")} className="w-full border border-gray-300 rounded px-3 py-2 font-bold" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm bg-emerald-50 p-4 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-bold uppercase tracking-tight text-xs">Total Quota Sum:</span>
                <span className={`text-lg font-black ${totalQuota === Number(watchIntake) ? "text-emerald-600" : "text-rose-600"}`}>
                  {totalQuota}
                </span>
              </div>
              <div className="flex items-center gap-2 border-l border-emerald-200 pl-4">
                <span className="text-gray-500 font-bold uppercase tracking-tight text-xs">Target Intake:</span>
                <span className="text-lg font-black text-blue-700">{watchIntake || 0}</span>
              </div>
              {errors.totalIntake && (
                <div className="ml-auto flex items-center gap-2 bg-rose-100 px-3 py-1 rounded-full border border-rose-200">
                  <span className="text-rose-600 font-bold text-xs uppercase tracking-tighter tracking-widest">⚠️ {errors.totalIntake.message}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button disabled={loading} type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-12 py-4 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-50">
                {loading ? "Allocating..." : "Finalize Seat Matrix"}
              </button>
            </div>
          </form>
        </div>

        {/* Status List */}
        <div className="space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Current Seat Matrix Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {programs.map(p => (
              <div key={p._id} className="bg-white border p-6 rounded-2xl flex justify-between items-center items-start shadow-sm group">
                <div>
                  <div className="font-bold text-gray-800">{p.programName}</div>
                  <div className="text-[10px] uppercase font-black text-gray-400 tracking-tighter mt-1">{p.admissionMode} / {p.courseType}</div>
                  <div className="flex gap-4 mt-4">
                    <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">K: {p.quotas?.KCET || 0}</div>
                    <div className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">C: {p.quotas?.COMEDK || 0}</div>
                    <div className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">M: {p.quotas?.Management || 0}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-400 mb-1 uppercase tracking-widest">Intake</div>
                  <div className="text-3xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">{p.totalIntake || 0}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
