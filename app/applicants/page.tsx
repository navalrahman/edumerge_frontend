"use client";

import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/lib/apiClient";
import DashboardLayout from "../_components/DashboardLayout";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const applicantSchema = z.object({
  fullName: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "10-digit phone required"),
  category: z.enum(["GM", "OBC", "SC", "ST", "Others"]),
  gender: z.enum(["Male", "Female", "Other"]),
  dob: z.string().min(1, "DOB is required"),
  address: z.string().min(5, "Address required"),
  programId: z.string().min(1, "Program Selection required"),
  admissionMode: z.enum(["Government", "Management"]),
  quotaType: z.enum(["KCET", "COMEDK", "Management"]),
  entryType: z.enum(["Regular", "Lateral"]),
  allotmentNumber: z.string().optional(),
  qualifyingMarks: z.coerce.number().min(0).max(100),
  documentStatus: z.enum(["Pending", "Submitted", "Verified"]),
  feeStatus: z.enum(["Pending", "Paid"]),
});

type ApplicantValues = z.infer<typeof applicantSchema>;

export default function ApplicantsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<ApplicantValues>({
    resolver: zodResolver(applicantSchema) as any,
    defaultValues: { documentStatus: "Pending", feeStatus: "Pending", admissionMode: "Government", quotaType: "KCET" }
  });

  const watchMode = watch("admissionMode");

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await api.get("/programs");
        setPrograms(res.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPrograms();
  }, []);

  const userRole = Cookies.get("userRole");

  const onSubmit: SubmitHandler<ApplicantValues> = async (data) => {
    console.log("Submitting Applicant Data:", data);
    setLoading(true);
    try {
      await api.post("/applicant", data);
      toast.success("Applicant Created Successfully! Proceed to Admissions for seat allocation.");
      reset();
    } catch (e: any) {
      console.error(e);
      toast.error(e.response?.data?.error || "Failed to create applicant. Seats might be full.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto text-black">
        <header className="mb-8">
          <h1 className="text-2xl font-black text-gray-800">New Application Master</h1>
          <p className="text-sm text-gray-500">Register new candidates in the ecosystem.</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl border shadow-sm space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 border-b border-gray-100 pb-2">
              <h3 className="text-sm font-bold uppercase tracking-widest text-blue-600">Personal Information (Candidate)</h3>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
              <input {...register("fullName")} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
              <input {...register("email")} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Phone</label>
              <input {...register("phone")} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">DOB</label>
              <input type="date" {...register("dob")} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
              <select {...register("category")} className="w-full border rounded px-3 py-2">
                <option value="GM">General (GM)</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Gender</label>
              <select {...register("gender")} className="w-full border rounded px-3 py-2">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <label className="text-xs font-medium text-gray-500 mb-1 block">Address</label>
              <textarea {...register("address")} className="w-full border rounded px-3 py-2 h-16" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold uppercase text-emerald-600">Admission & Quota Details</h3>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Program Selection</label>
              <select {...register("programId")} className="w-full border rounded px-3 py-2 font-semibold">
                <option value="">Select Target...</option>
                {programs.map(p => <option key={p._id} value={p._id}>{p.programName}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Admission Mode</label>
              <select {...register("admissionMode")} className="w-full border rounded px-3 py-2 text-black">
                <option value="Government">Government</option>
                <option value="Management">Management</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Quota Type</label>
              <select {...register("quotaType")} className="w-full border rounded px-3 py-2 text-black">
                {watchMode === "Government" ? (
                  <>
                    <option value="KCET">KCET</option>
                    <option value="COMEDK">COMEDK</option>
                  </>
                ) : (
                  <option value="Management">Management</option>
                )
                }
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Entry Mode</label>
              <select {...register("entryType")} className="w-full border rounded px-3 py-2">
                <option value="Regular">Regular</option>
                <option value="Lateral">Lateral</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Marks (%)</label>
              <input type="number" {...register("qualifyingMarks")} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Allotment No.</label>
              <input {...register("allotmentNumber")} className="w-full border rounded px-3 py-2" placeholder="e.g. KCET001" />
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded flex flex-col md:flex-row gap-8">
            <div>
              <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2">Checklist Status</h4>
              <div className="flex gap-4">{["Pending", "Submitted", "Verified"].map(s => <label key={s} className="flex items-center gap-2 text-sm"><input type="radio" value={s} {...register("documentStatus")} /> {s}</label>)}
              </div>
            </div>
            <div className="border-l border-gray-200 pl-8">
              <h4 className="text-[10px] font-bold uppercase text-gray-400 mb-2">Preliminary Fee Status</h4>
              <div className="flex gap-4">{["Pending", "Paid"].map(s => <label key={s} className="flex items-center gap-2 text-sm font-bold"><input type="radio" value={s} {...register("feeStatus")} /> {s}</label>)}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button disabled={loading || userRole === "Management"} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded font-bold transition-all shadow-md disabled:opacity-50">
              {loading ? "Registering..." : userRole === "Management" ? "Read Only" : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
