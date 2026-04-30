import NotificationsPageContent from '@/components/features/notifications/NotificationsPageContent';

export const metadata = {
  title: 'Notifications | Planit',
  description: 'Consultez toutes vos notifications et restez informé de vos rendez-vous.',
};

export default function ClientNotificationsPage() {
  return (
    <NotificationsPageContent
      backHref="/client"
      backLabel="Retour à l'accueil"
    />
  );
}
