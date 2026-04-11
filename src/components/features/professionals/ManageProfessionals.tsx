'use client';

import { useState, useActionState } from 'react';
import { addProfessionalStaff, editProfessionalStaff } from '@/modules/professionals/actions';
import { addService, updateService } from '@/modules/establishments/actions';
import { Modal } from '@/components/ui/modal';

type Professional = {
  id: string;
  full_name: string;
  bio?: string;
  is_active: boolean;
  avatar_url?: string;
};

type Service = {
  id: string;
  professional_id?: string;
  name: string;
  duration_minutes: number;
  description?: string;
  is_active: boolean;
};

export default function ManageProfessionals({ 
  initialProfessionals,
  services 
}: { 
  initialProfessionals: Professional[];
  services: Service[];
}) {
  const [activeTab, setActiveTab] = useState<'professionals' | 'services'>('professionals');

  // Next.js direct prop mapping for Server Action UI Sync
  const professionals = initialProfessionals;

  // ==== PROFESSIONAL STATE ====
  const [isAddProMenuOpen, setIsAddProMenuOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<Professional | null>(null);
  const [addProFormData, setAddProFormData] = useState({
    full_name: '', email: '', phone: '', bio: '', password: '', is_active: 'true'
  });
  const [addProState, addProAction, isAddingPro] = useActionState(addProfessionalStaff, { success: false });
  const [editProState, editProAction, isEditingPro] = useActionState(editProfessionalStaff, { success: false });

  if (addProState.success && isAddProMenuOpen) {
    setIsAddProMenuOpen(false);
    addProState.success = false; 
    setAddProFormData({ full_name: '', email: '', phone: '', bio: '', password: '', is_active: 'true' });
  }
  if (editProState.success && editingPro) {
    setEditingPro(null);
    editProState.success = false;
  }

  // ==== SERVICE STATE ====
  const [searchService, setSearchService] = useState('');
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [addServiceFormData, setAddServiceFormData] = useState({
    name: '', duration_minutes: 30, description: '', is_active: 'true'
  });
  
  const [addServState, addServAction, isAddingServ] = useActionState(addService, { success: false });
  const [editServState, editServAction, isEditingServ] = useActionState(updateService, { success: false });

  if (addServState.success && isAddServiceOpen) {
    setIsAddServiceOpen(false);
    addServState.success = false;
    setAddServiceFormData({ name: '', duration_minutes: 30, description: '', is_active: 'true' });
  }
  if (editServState.success && editingService) {
    setEditingService(null);
    editServState.success = false;
  }

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchService.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* HEADER BLOCK EXACTLY AS USER REQUESTED */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">Mes Professionnels & Services</h1>
        <p className="text-gray-500 mt-1">Gérez votre équipe et vos prestations</p>
        
        <div className="flex flex-wrap gap-4 mt-6 border-t border-gray-100 pt-6">
          <button 
            onClick={() => setActiveTab('professionals')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'professionals' ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Mes Professionnels 
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'professionals' ? 'bg-white/20' : 'bg-gray-300'}`}>{professionals.length}</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('services')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors ${activeTab === 'services' ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Mes Services 
            <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === 'services' ? 'bg-white/20' : 'bg-gray-300'}`}>{services.length}</span>
          </button>
        </div>
      </div>

      {/* PROFESSIONALS TAB */}
      {activeTab === 'professionals' && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setIsAddProMenuOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              + Ajouter un professionnel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((pro) => (
              <div key={pro.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-xl font-bold">
                      {pro.full_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{pro.full_name}</h3>
                      <p className="text-sm text-gray-500">{pro.bio || 'Non défini'}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${pro.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {pro.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setEditingPro(pro)}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm w-full py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    Voir détails
                  </button>
                </div>
              </div>
            ))}
            {professionals.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                Aucun professionnel trouvé. Commencez par en ajouter un!
              </div>
            )}
          </div>
        </>
      )}

      {/* SERVICES TAB */}
      {activeTab === 'services' && (
        <>
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
            <input 
              type="text" 
              placeholder="Rechercher un Service..." 
              value={searchService}
              onChange={e => setSearchService(e.target.value)}
              className="flex-1 max-w-sm px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 outline-none" 
            />
            <button
              onClick={() => setIsAddServiceOpen(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
            >
              + Ajouter un Service
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900">{service.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{service.description || 'Aucune description'}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${service.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {service.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 font-medium mb-6">
                  <span className="mr-2">⏱</span> {service.duration_minutes} min
                </div>
                
                <div className="pt-4 border-t border-gray-100 text-center">
                  <button
                    onClick={() => setEditingService(service)}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm w-full py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                  >
                    Voir detail
                  </button>
                </div>
              </div>
            ))}
            {filteredServices.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-300">
                Aucun service trouvé.
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================== */}
      {/* ====================== PRO MODALS ========================== */}
      {/* ========================================================== */}
      
      <Modal 
        isOpen={isAddProMenuOpen} 
        onClose={() => setIsAddProMenuOpen(false)}
        title="Ajouter un professionnel"
        description="Remplissez les informations du nouveau professionnel"
      >
        <form action={addProAction} className="p-6 space-y-4 overflow-y-auto">
              {addProState.error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{addProState.error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input required type="text" name="full_name" value={addProFormData.full_name} onChange={e => setAddProFormData({...addProFormData, full_name: e.target.value})} placeholder="Prenom Nom" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" name="email" value={addProFormData.email} onChange={e => setAddProFormData({...addProFormData, email: e.target.value})} placeholder="email@xxxx.dz" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="text" name="phone" value={addProFormData.phone} onChange={e => setAddProFormData({...addProFormData, phone: e.target.value})} placeholder="+213..." className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité *</label>
                <input type="text" name="bio" value={addProFormData.bio} onChange={e => setAddProFormData({...addProFormData, bio: e.target.value})} placeholder="Ex: Chirurgien Dentiste" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input type="password" name="password" value={addProFormData.password} onChange={e => setAddProFormData({...addProFormData, password: e.target.value})} placeholder="******" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="true" checked={addProFormData.is_active === 'true'} onChange={e => setAddProFormData({...addProFormData, is_active: e.target.value})} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>✅ Actif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="false" checked={addProFormData.is_active === 'false'} onChange={e => setAddProFormData({...addProFormData, is_active: e.target.value})} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>⛔ Inactif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 shrink-0">
                <button type="button" onClick={() => setIsAddProMenuOpen(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isAddingPro} className="px-5 py-2.5 bg-purple-600 text-white font-medium hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50">
                  {isAddingPro ? 'Création...' : 'Ajouter'}
                </button>
              </div>
            </form>
      </Modal>

      <Modal 
        isOpen={!!editingPro} 
        onClose={() => setEditingPro(null)}
        title="Voir les details d un professionnel"
        description="Modifier les informations"
      >
        {editingPro && (
          <form action={editProAction} className="p-6 space-y-4 overflow-y-auto">
            <input type="hidden" name="id" value={editingPro.id} />
              
              {editProState.error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{editProState.error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet *</label>
                <input required type="text" name="full_name" defaultValue={editingPro.full_name} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                  <input type="email" name="email" placeholder="email@xxxx.dz" disabled className="w-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-xl outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input type="text" name="phone" placeholder="+213..." className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe*</label>
                <input type="password" name="password" placeholder="••••••••" disabled title="Modification requiert accès admin" className="w-full px-4 py-2 border border-gray-300 bg-gray-50 text-gray-500 rounded-xl outline-none cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité *</label>
                <input type="text" name="bio" defaultValue={editingPro.bio || ''} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="true" defaultChecked={editingPro.is_active} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>✅ Actif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="false" defaultChecked={!editingPro.is_active} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>⛔ Inactif</span>
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  {services.filter(s => s.professional_id === editingPro.id).length > 0 ? (
                    <ul className="space-y-2">
                      {services.filter(s => s.professional_id === editingPro.id).map(service => (
                        <li key={service.id} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                          {service.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">Aucun service assigné.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 shrink-0">
                <button type="button" onClick={() => setEditingPro(null)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                  Annuler les changement
                </button>
                <button type="submit" disabled={isEditingPro} className="px-5 py-2.5 bg-purple-600 text-white font-medium hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50">
                  {isEditingPro ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
          </form>
        )}
      </Modal>


      {/* ========================================================== */}
      {/* ===================== SERVICE MODALS ======================= */}
      {/* ========================================================== */}

      <Modal 
        isOpen={isAddServiceOpen} 
        onClose={() => setIsAddServiceOpen(false)}
        title="Ajouter un service"
        description="Définissez les détails de la prestation"
      >
        <form action={addServAction} className="p-6 space-y-4 overflow-y-auto">
              {addServState.error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{addServState.error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service *</label>
                <input required type="text" name="name" value={addServiceFormData.name} onChange={e => setAddServiceFormData({...addServiceFormData, name: e.target.value})} placeholder="Ex: Consultation Générale" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes) *</label>
                <input required type="number" min="5" name="duration_minutes" value={addServiceFormData.duration_minutes} onChange={e => setAddServiceFormData({...addServiceFormData, duration_minutes: parseInt(e.target.value) || 0})} placeholder="Ex: 45" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} value={addServiceFormData.description} onChange={e => setAddServiceFormData({...addServiceFormData, description: e.target.value})} placeholder="Courte Description" className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="true" checked={addServiceFormData.is_active === 'true'} onChange={e => setAddServiceFormData({...addServiceFormData, is_active: e.target.value})} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>✅ Actif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="false" checked={addServiceFormData.is_active === 'false'} onChange={e => setAddServiceFormData({...addServiceFormData, is_active: e.target.value})} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>⛔ Inactif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 shrink-0">
                <button type="button" onClick={() => setIsAddServiceOpen(false)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isAddingServ} className="px-5 py-2.5 bg-purple-600 text-white font-medium hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50">
                  {isAddingServ ? 'Création...' : 'Ajouter'}
                </button>
              </div>
            </form>
      </Modal>

      <Modal 
        isOpen={!!editingService} 
        onClose={() => setEditingService(null)}
        title="Voir les details d un service"
        description="Modifier les informations"
      >
        {editingService && (
          <form action={editServAction} className="p-6 space-y-4 overflow-y-auto">
            <input type="hidden" name="id" value={editingService.id} />
              
              {editServState.error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{editServState.error}</div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du service *</label>
                <input required type="text" name="name" defaultValue={editingService.name} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Durée (minutes) *</label>
                <input required type="number" min="5" name="duration_minutes" defaultValue={editingService.duration_minutes} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows={3} defaultValue={editingService.description || ''} className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="true" defaultChecked={editingService.is_active} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>✅ Actif</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="is_active" value="false" defaultChecked={!editingService.is_active} className="text-purple-600 focus:ring-purple-600 w-4 h-4" />
                    <span>⛔ Inactif</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 shrink-0">
                <button type="button" onClick={() => setEditingService(null)} className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
                  Annuler les changement
                </button>
                <button type="submit" disabled={isEditingServ} className="px-5 py-2.5 bg-purple-600 text-white font-medium hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50">
                  {isEditingServ ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
