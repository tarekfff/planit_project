import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password | Planit",
  description: "Securely reset your Planit password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
