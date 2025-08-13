import { MainNavigation } from "@/components/navigation/MainNavigation";
import { ThreeBackground } from "@/components/three/ThreeBackground";
import { BackButton } from "@/components/navigation/BackButton";

interface PageLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  showNavigation?: boolean;
  backTo?: string;
  backLabel?: string;
}

export function PageLayout({ 
  children, 
  showBackground = true, 
  showNavigation = true,
  backTo,
  backLabel
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background relative">
      {showBackground && <ThreeBackground />}
      {showNavigation && <MainNavigation />}
      
      <div className="relative z-10">
        {(backTo || backLabel) && (
          <div className="container mx-auto px-4 pt-4">
            <BackButton to={backTo} label={backLabel} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}