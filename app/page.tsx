'use client'

import DashboardLayout from "./_components/DashboardLayout";
import { useRouter } from "next/navigation";
import Home from "./_components/home/Home";

export default function Page() {

  return (
    <DashboardLayout>
      <Home />
    </DashboardLayout>
  );
}
