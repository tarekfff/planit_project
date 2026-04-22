import { searchEstablishments, getAllWilayas } from '@/modules/establishments/queries';
import { SearchFilters } from './SearchFilters';
import { MapPin, Star, ChevronRight, Search } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    wilaya?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || '';
  const wilaya = params.wilaya || '';

  const [establishments, wilayas] = await Promise.all([
    searchEstablishments(searchQuery, wilaya),
    getAllWilayas()
  ]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/50 animate-in fade-in duration-500">
      
      {/* Search Header Hero */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 opacity-20 rounded-full blur-3xl pointer-events-none transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
            Trouvez le professionnel idéal
          </h1>
          <p className="text-lg text-indigo-100 font-medium max-w-xl mx-auto">
            Recherchez et prenez rendez-vous avec les meilleurs établissements près de chez vous en quelques clics.
          </p>

          <SearchFilters 
            initialSearchQuery={searchQuery} 
            initialWilaya={wilaya} 
            wilayas={wilayas} 
          />
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-2xl font-bold text-gray-900">
            {establishments.length} résultat{establishments.length > 1 ? 's' : ''}
          </h2>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
             <span>Trier par</span>
             <select className="bg-transparent border-none font-bold text-gray-900 outline-none cursor-pointer">
               <option>Pertinence</option>
               <option>Nouveautés</option>
             </select>
          </div>
        </div>

        {establishments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {establishments.map((est) => (
              <div key={est.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full hover:-translate-y-1">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden border border-gray-100">
                    {est.logo_url ? (
                      <img src={est.logo_url} alt={est.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🏬</span>
                    )}
                  </div>
                  <div className="bg-green-50 text-green-600 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-green-100 shadow-sm">
                    <Star className="w-3.5 h-3.5 fill-current" /> 4.9
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {est.name}
                </h3>
                
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mt-2">
                  <MapPin className="w-4 h-4 text-indigo-400" />
                  <span className="truncate">{est.wilaya || 'Algérie'}</span>
                  {est.address && <span className="truncate text-gray-400">- {est.address}</span>}
                </div>

                <p className="text-sm text-gray-600 mt-4 line-clamp-2 flex-1 relative before:absolute before:left-0 before:top-0 before:w-1 before:h-full before:bg-gradient-to-b before:from-indigo-100 before:to-transparent pl-3">
                  {est.description || 'Description non disponible pour le moment.'}
                </p>

                {est.services && est.services.length > 0 && (
                  <div className="mt-5 pt-5 border-t border-gray-50">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Services proposés</p>
                    <div className="flex flex-wrap gap-1.5">
                      {est.services.slice(0, 3).map((s: any) => (
                          <span key={s.id} className="inline-flex bg-gray-50 text-gray-700 text-[11px] font-bold px-2 py-1 rounded-md border border-gray-100">
                            {s.name}
                          </span>
                      ))}
                      {est.services.length > 3 && (
                          <span className="inline-flex bg-indigo-50 text-indigo-700 text-[11px] font-bold px-2 py-1 rounded-md">
                            +{est.services.length - 3}
                          </span>
                      )}
                    </div>
                  </div>
                )}

                <Link href={`/estabilshement/${est.id}`} className="mt-6 w-full py-3 bg-gray-50 hover:bg-indigo-600 text-gray-900 hover:text-white text-sm font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md">
                  Prendre RDV <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100 max-w-2xl mx-auto mt-10">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-500 font-medium text-lg">Nous n'avons trouvé aucun établissement correspondant à votre recherche.</p>
            <Link 
              href="/search"
              className="mt-8 inline-block px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Réinitialiser les filtres
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
