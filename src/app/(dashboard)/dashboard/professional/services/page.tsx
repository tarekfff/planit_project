import { getProfessionalServicesSettings } from "@/modules/professionals/queries";
import ProfessionalServicesManager from "@/components/features/professionals/ProfessionalServicesManager";
import { redirect } from "next/navigation";

export default async function ProfessionalServicesPage() {
  const data = await getProfessionalServicesSettings();

  if (!data) {
    redirect("/dashboard/professional");
  }

  return (
    <main className="p-8 pb-32">
      <ProfessionalServicesManager 
        services={data.services} 
        workingHours={data.professional.working_hours || []} 
      />
    </main>
  );
}
