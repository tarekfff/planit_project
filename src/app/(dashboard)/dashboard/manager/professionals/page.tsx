import { getEstablishmentProfileData } from '@/modules/establishments/queries';
import ManageProfessionals from '@/components/features/professionals/ManageProfessionals';
import { redirect } from 'next/navigation';

export default async function ManagerProfessionalsPage() {
  const data = await getEstablishmentProfileData();
  
  if (!data?.establishment) {
    redirect('/dashboard/manager');
  }

  // Pass down the professionals and services to the client component
  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <ManageProfessionals 
        initialProfessionals={data.professionals} 
        services={data.services} 
      />
    </div>
  );
}
