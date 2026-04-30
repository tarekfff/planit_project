import NotificationsPageContent from '@/components/features/notifications/NotificationsPageContent';

export const metadata = {
  title: 'Notifications | Planit Manager',
  description: 'Consultez toutes vos notifications et restez informé de vos rendez-vous.',
};

export default function ManagerNotificationsPage() {
  return (
    <NotificationsPageContent
      backHref="/dashboard/manager"
      backLabel="Retour au dashboard"
    />
  );
}
