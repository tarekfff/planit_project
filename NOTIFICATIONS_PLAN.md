# Plan d'Implémentation du Système de Notifications en Temps Réel

Ce document détaille le plan complet pour mettre en œuvre un système de notifications en temps réel pour tous les utilisateurs (Clients, Managers, Professionnels) de la plateforme Planit en utilisant **Supabase Realtime**.

## 1. Architecture de la Base de Données (Supabase)

Il faut créer une table centralisée pour stocker toutes les notifications.

### A. Création de la table `notifications`
Exécutez cette requête SQL dans l'éditeur SQL de Supabase :

```sql
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- Le destinataire
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Celui qui a déclenché l'action (optionnel)
  type VARCHAR(50) NOT NULL, -- ex: 'appointment_accepted', 'new_appointment', 'review_left'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255), -- Lien de redirection quand on clique sur la notification
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Index pour accélérer les requêtes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
```

### B. Sécurité (RLS - Row Level Security)
Il faut s'assurer que chaque utilisateur ne peut lire que ses propres notifications.

```sql
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres notifications (ex: lu)" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);
```

### C. Activer Supabase Realtime
Pour que l'application React puisse écouter les ajouts en direct, vous devez activer Realtime sur cette table :

```sql
alter publication supabase_realtime add table public.notifications;
```

---

## 2. Logique Backend (Server Actions)

Créer une fonction utilitaire générique pour envoyer des notifications, puis l'appeler dans vos actions existantes.

### A. Créer le fichier `src/modules/notifications/actions.ts`

```typescript
'use server';
import { createClient } from '@/lib/supabase/server';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  actorId?: string;
}

export async function createNotification(data: CreateNotificationParams) {
  const supabase = await createClient();
  const { error } = await supabase.from('notifications').insert({
    user_id: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    link: data.link || null,
    actor_id: data.actorId || null
  });
  
  if (error) console.error("Erreur création notification:", error);
  return { success: !error };
}
```

### B. Intégrer dans les actions (Exemples)
- **Quand le Manager accepte un rendez-vous** (`updateAppointment` dans `appointments/actions.ts`) :
  ```typescript
  await createNotification({
    userId: appointment.client_id, // Destinataire: le client
    type: 'appointment_accepted',
    title: 'Rendez-vous confirmé !',
    message: 'Votre rendez-vous pour le service de Coiffure a été accepté.',
    link: '/client/appointments'
  });
  ```
- **Quand le Client réserve** (`createClientAppointment`) :
  ```typescript
  await createNotification({
    userId: establishment.manager_id, // Destinataire: le manager
    type: 'new_appointment',
    title: 'Nouvelle demande de rendez-vous',
    message: 'Un client a demandé un rendez-vous le 15 Octobre.',
    link: '/dashboard/manager/calendar'
  });
  ```

---

## 3. L'Interface Temps Réel (Composants React)

### A. Le Composant `NotificationBell` (Cloche globale)
Créez un composant Client `src/components/ui/NotificationBell.tsx` et placez-le dans votre Navbar globale (`layout.tsx`).

Ce composant va :
1. Charger les notifications non lues au montage.
2. S'abonner aux WebSockets de Supabase pour écouter les nouvelles notifications.
3. Afficher une pastille rouge et un "Toast" (alerte flottante) quand un message arrive.

```tsx
'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell } from 'lucide-react';
// import { toast } from 'sonner'; // Si vous utilisez une lib de toast

export default function NotificationBell({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    // 1. Charger le nombre initial
    const fetchCount = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };
    fetchCount();

    // 2. Écouter les nouveautés en temps réel
    const channel = supabase.channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => {
          setUnreadCount((prev) => prev + 1);
          // Afficher une alerte flottante (toast)
          // toast(payload.new.title, { description: payload.new.message });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId, supabase]);

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </div>
  );
}
```

---

## 4. Pages Dédiées aux Notifications

### A. Page `/client/notifications/page.tsx`
Cette page servira à lister l'historique complet des notifications de l'utilisateur.

- Faire une requête `SELECT * FROM notifications WHERE user_id = {mon_id} ORDER BY created_at DESC`.
- Afficher les messages sous forme de liste.
- Ajouter un bouton "Tout marquer comme lu" qui déclenche une Action Serveur faisant un `UPDATE notifications SET is_read = true WHERE user_id = {mon_id}`.

### B. Mutualisation (Optionnelle)
Au lieu d'avoir une page séparée pour le client (`/client/notifications`) et le manager (`/dashboard/manager/notifications`), vous pouvez créer une route générique partagée par tous : `src/app/(dashboard)/notifications/page.tsx`. 
Comme la politique de sécurité (RLS) limite déjà la lecture par `user_id`, le code de la page sera exactement le même pour tous les rôles.

---

## Résumé du flux de travail pour l'implémentation
1. **Base de données** : Exécutez le code SQL.
2. **Backend** : Créez la fonction `createNotification` et parsemez vos Server Actions actuelles (création/modification de RDV) d'appels à cette fonction.
3. **Frontend Global** : Intégrez `NotificationBell` dans le menu supérieur.
4. **Frontend Détail** : Créez la page de liste des notifications pour la consultation de l'historique.
