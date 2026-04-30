import NotificationsPageContent from '@/components/features/notifications/NotificationsPageContent';

export const metadata = {
  title: 'Notifications | Planit Professional',
  description: 'Consultez toutes vos notifications et restez informé de vos rendez-vous.',
};

export default function ProfessionalNotificationsPage() {
  return (
    <NotificationsPageContent
      backHref="/dashboard/professional"
      backLabel="Retour au dashboard"
    />
  );
}
