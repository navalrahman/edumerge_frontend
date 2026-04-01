"use client";

import React, { useEffect, useState } from "react";
import DashboardLayout from "../_components/DashboardLayout";
import api from "@/lib/apiClient";
import Cookies from "js-cookie";

interface Applicant {
  _id: string;
  fullName: string;
  name: string; 
  email: string;
  phone: string;
  programId: { _id: string; programName: string; department: string };
  admissionMode: string;
  quotaType: string;
  feeStatus: "Pending" | "Paid";
  documentStatus: "Pending" | "Submitted" | "Verified";
  status: "Draft" | "Seat Locked" | "Admitted";
  admissionNumber?: string;
}

export default function AdmissionsPage() {
  const [list, setList] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const userRole = Cookies.get("userRole");

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await api.get("/applicants");
      const mapped = res.data.map((a: any) => ({
        ...a,
        fullName: a.name || a.fullName,
        programId: a.programId || { _id: "", programName: "Unknown Program", department: "N/A" }
      }));
      setList(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  console.log('list', list)

  const handleAction = async (id: string, status: string) => {
    const applicant = list.find(a => a._id === id);
    if (!applicant) return;

    try {
      if (status === "Draft") {
        await api.post(`/applicant/allocate/${id}`, {
          applicant
        });
        alert("Seat locked successfully!");
      } else if (status === "Seat Locked") {
        if (applicant.feeStatus !== "Paid") {
          alert("BLOCK: Fee must be PAID first.");
          return;
        }
        if (applicant.documentStatus !== "Verified") {
          alert("BLOCK: Documents must be VERIFIED first.");
          return;
        }
        const res = await api.post(`/applicant/confirm/${id}`);
        alert(`ADMITTED! Admission No: ${res.data.admissionNumber}`);
      }
      fetchList();
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || "Action failed.");
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto text-black">
        <header className="mb-8 p-6 bg-white border border-gray-100 rounded flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Admission Desk (Seat Allocation)</h1>
            <p className="text-xs text-gray-500 font-medium">Verify fees and lock seat allocations in real-time.</p>
          </div>
          <button onClick={fetchList} className="bg-gray-50 border px-3 py-2 text-[10px] font-bold uppercase text-gray-500 rounded tracking-widest hover:bg-white transition-all">Refresh Desk</button>
        </header>

        {loading ? (
          <div className="text-center py-20 font-black text-blue-600 animate-pulse">Checking Admissions...</div>
        ) : list.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-400 font-bold">No candidates found for admission.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded border shadow-sm">
            <table className="w-full text-left border-collapse text-black">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 text-[10px] font-bold uppercase text-gray-400 px-6">Applicant Records</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-gray-400 px-6 text-center">Program & Mode</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-gray-400 px-6 text-center">Status Tracking</th>
                  <th className="p-4 text-[10px] font-bold uppercase text-gray-400 px-6 text-right">Confirmation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {list.map(a => (
                  <tr key={a._id} className="hover:bg-blue-50/10">
                    <td className="p-4 px-6">
                      <div className="font-bold text-gray-800">{a.fullName}</div>
                      <div className="text-[10px] font-medium text-gray-400">{a.phone} • {a.email}</div>
                    </td>
                    <td className="p-4 px-6 text-center">
                      <div className="text-xs font-bold text-gray-600">{a.programId?.programName}</div>
                      <div className="flex gap-2 justify-center mt-1">
                        <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">{a.admissionMode}</span>
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-200">{a.quotaType}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-center">
                      <div className="flex justify-center flex-col items-center gap-1">
                        <button
                          onClick={async () => {
                            await api.put(`/applicant/${a._id}`, { feeStatus: a.feeStatus === "Paid" ? "Pending" : "Paid" });
                            fetchList();
                          }}
                          className={`text-[10px] font-black uppercase ${a.feeStatus === "Paid" ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-rose-600 bg-rose-50 border border-rose-100"} px-3 py-1 rounded-full hover:scale-105 transition-all`}
                        >
                          Fee: {a.feeStatus}
                        </button>
                        <button
                          onClick={async () => {
                            const next = a.documentStatus === "Pending" ? "Submitted" : a.documentStatus === "Submitted" ? "Verified" : "Pending";
                            await api.put(`/applicant/${a._id}`, { documentStatus: next });
                            fetchList();
                          }}
                          className="text-[9px] font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase"
                        >
                          Docs: {a.documentStatus}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right">
                      {a.status === "Admitted" ? (
                        <div className="flex flex-col items-end">
                          <span className="text-[9px] font-bold text-emerald-500 uppercase">ADMITTED</span>
                          <span className="bg-gray-100 border border-gray-200 px-2 py-1 rounded font-mono text-xs text-blue-700">{a.admissionNumber}</span>
                        </div>
                      ) : (
                        <button
                          disabled={userRole === "Management"}
                          onClick={() => handleAction(a._id, a.status)}
                          className={`text-[10px] font-bold uppercase tracking-widest px-5 py-2.5 rounded transition-all disabled:opacity-50 ${a.status === "Seat Locked" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-900 hover:bg-black text-white"}`}
                        >
                          {a.status === "Draft" ? "Lock Seat" : "Finalize Admission"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
