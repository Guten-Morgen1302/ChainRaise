import { AdminAvalancheTransactions } from "@/components/admin/AdminAvalancheTransactions";
import { MainNavigation } from "@/components/navigation/MainNavigation";
import { ThreeBackground } from "@/components/three/ThreeBackground";

export default function AdminAvalancheTransactionsPage() {
  return (
    <div className="min-h-screen bg-background relative">
      <ThreeBackground />
      <MainNavigation />
      <div className="relative z-10 pt-16">
        <div className="container mx-auto px-4 py-8">
          <AdminAvalancheTransactions />
        </div>
      </div>
    </div>
  );
}