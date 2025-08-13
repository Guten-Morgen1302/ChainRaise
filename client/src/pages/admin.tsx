import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { ThreeBackground } from "@/components/three/ThreeBackground";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <ThreeBackground />
      <MainNavigation />
      <div className="relative z-10">
        <AdminDashboard />
      </div>
    </div>
  );
}