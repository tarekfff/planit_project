import { getEstablishmentProfileData } from "@/modules/dashboard/queries";
import { ProfileHeader } from "@/components/features/profile/ProfileHeader";
import { ProfileMainInfo } from "@/components/features/profile/ProfileMainInfo";
import { ProfileServices } from "@/components/features/profile/ProfileServices";
import { ProfileProfessionals } from "@/components/features/profile/ProfileProfessionals";
import { ProfileHours } from "@/components/features/profile/ProfileHours";
import { ProfilePhotos } from "@/components/features/profile/ProfilePhotos";
import { redirect } from "next/navigation";

export default async function ManagerProfilePage() {
    const data = await getEstablishmentProfileData();

    if (!data || !data.establishment) {
        redirect("/dashboard/manager");
    }

    const { user, establishment, professionals, services } = data;

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
            {/* Header + Banner */}
            <ProfileHeader establishment={establishment} />

            <div className="max-w-6xl mx-auto p-8 space-y-12">

                {/* Main Info & Map Area */}
                <ProfileMainInfo establishment={establishment} userEmail={user.email} />

                {/* Services */}
                <ProfileServices services={services} />

                {/* Professionals */}
                <ProfileProfessionals professionals={professionals} />

                {/* Opening Hours */}
                <ProfileHours />

                {/* Photos */}
                <ProfilePhotos />
            </div>
        </div>
    );
}
