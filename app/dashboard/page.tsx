export const dynamic = "force-dynamic";
import { Suspense } from "react";
import DashboardClient from "./client";

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight:"100vh", background:"#000008", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"40px", height:"40px", border:"3px solid rgba(0,153,255,0.2)", borderTopColor:"#0099ff", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      </div>
    }>
      <DashboardClient />
    </Suspense>
  );
}
