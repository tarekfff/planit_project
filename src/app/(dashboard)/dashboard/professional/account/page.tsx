import { getCurrentProfile, getCurrentUser } from "@/modules/auth/queries";
import { AccountForm } from "@/components/features/profile/AccountForm";
import { redirect } from "next/navigation";

export default async function ProfessionalAccountPage() {
    const profile = await getCurrentProfile();
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    return (
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <div className="max-w-6xl mx-auto p-8">
                <AccountForm profile={profile} userEmail={user.email || ''} />
            </div>
        </div>
    );
}
