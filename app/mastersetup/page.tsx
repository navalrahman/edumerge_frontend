"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/apiClient";
import DashboardLayout from "../_components/DashboardLayout";
import toast from "react-hot-toast";

const masterSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  campus: z.string().min(1, "Campus is required"),
  department: z.string().min(1, "Department is required"),
  programName: z.string().min(1, "Program Name is required"),
  academicYear: z.string().min(1, "Academic Year is required"),
  courseType: z.enum(["UG", "PG"]),
  entryType: z.enum(["Regular", "Lateral"]),
  admissionMode: z.enum(["Government", "Management"]),
});

type MasterFormValues = z.infer<typeof masterSchema>;

export default function MastersPage() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MasterFormValues>({
    resolver: zodResolver(masterSchema) as any,
    defaultValues: {
      academicYear: "2026-2027",
      courseType: "UG",
      entryType: "Regular",
      admissionMode: "Government",
    },
  });

  useEffect(() => {
    fetchMasters();
  }, []);

  const fetchMasters = async () => {
    try {
      const res = await api.get("/programs");
      setList(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const onSubmit: SubmitHandler<MasterFormValues> = async (data) => {
    setLoading(true);
    try {
      await api.post("/program", data);
      toast.success("Master Setup Saved Successfully!");
      reset();
      fetchMasters();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save master setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto text-black">
        <h1 className="text-2xl font-black mb-8 text-gray-800">Master Setup</h1>

        <div className="bg-white p-8 rounded-2xl border shadow-sm mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-6">Create New Configuration</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Institution Name</label>
                <input {...register("institution")} className={`w-full border rounded px-3 py-2 ${errors.institution ? "border-red-500" : "border-gray-300"}`} placeholder="e.g., Global Tech Institure" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Campus</label>
                <input {...register("campus")} className={`w-full border rounded px-3 py-2 ${errors.campus ? "border-red-500" : "border-gray-300"}`} placeholder="Main Campus" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Department</label>
                <input {...register("department")} className={`w-full border rounded px-3 py-2 ${errors.department ? "border-red-500" : "border-gray-300"}`} placeholder="CS Dept" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Program / Branch</label>
                <input {...register("programName")} className={`w-full border rounded px-3 py-2 ${errors.programName ? "border-red-500" : "border-gray-300"}`} placeholder="Mechanical Engg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Academic Year</label>
                <input {...register("academicYear")} className="w-full border border-gray-300 rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Course Type</label>
                <select {...register("courseType")} className="w-full border border-gray-300 rounded px-3 py-2">
                  <option value="UG">UG</option>
                  <option value="PG">PG</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Entry Type</label>
                <select {...register("entryType")} className="w-full border border-gray-300 rounded px-3 py-2">
                  <option value="Regular">Regular</option>
                  <option value="Lateral">Lateral</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Admission Mode</label>
                <select {...register("admissionMode")} className="w-full border border-gray-300 rounded px-3 py-2">
                  <option value="Government">Government</option>
                  <option value="Management">Management</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button disabled={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-3 rounded-xl transition-all shadow-lg active:scale-95">
                {loading ? "Saving..." : "Save Master Config"}
              </button>
            </div>
          </form>
        </div>

        {/* Display List */}
        <div className="space-y-4">
             <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">All Master Programs</h3>
             {list.length === 0 ? <p className="text-gray-400 font-bold py-10 text-center">No programs set yet.</p> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {list.map((m: any) => (
                         <div key={m._id} className="bg-gray-50 border p-4 rounded-xl flex justify-between items-center group hover:bg-blue-50 transition-all">
                             <div>
                                 <div className="font-bold text-gray-800">{m.programName}</div>
                                 <div className="text-[10px] uppercase font-black text-gray-400 tracking-tighter">{m.institution} • {m.department} • {m.academicYear}</div>
                             </div>
                             <span className="text-[10px] font-black bg-white border px-2 py-1 rounded-md text-blue-600 group-hover:border-blue-200">{m.courseType}</span>
                         </div>
                     ))}
                 </div>
             )}
        </div>
      </div>
    </DashboardLayout>
  );
}
