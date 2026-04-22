'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useCallback } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';

interface SearchFiltersProps {
  initialSearchQuery: string;
  initialWilaya: string;
  wilayas: string[];
}

export function SearchFilters({ initialSearchQuery, initialWilaya, wilayas }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(initialSearchQuery);
  const [wilaya, setWilaya] = useState(initialWilaya);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('q', search); else params.delete('q');
    if (wilaya) params.set('wilaya', wilaya); else params.delete('wilaya');
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="mt-8 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex flex-col md:flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-200" />
        <input 
          type="text" 
          placeholder="Quel service ou professionnel cherchez-vous ?" 
          className="w-full bg-white/10 text-white placeholder:text-indigo-200 border border-transparent focus:border-white/30 focus:bg-white/20 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>
      
      <div className="relative md:w-64">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-200" />
        <select 
          className="w-full bg-white/10 text-white border border-transparent focus:border-white/30 focus:bg-white/20 rounded-xl py-3.5 pl-11 pr-4 outline-none transition-all font-medium appearance-none cursor-pointer"
          value={wilaya}
          onChange={(e) => {
            setWilaya(e.target.value);
            // Auto-trigger on wilaya change
            const qs = createQueryString('wilaya', e.target.value);
            router.push(`/search?${qs}`);
          }}
        >
          <option value="" className="text-gray-900">Toutes les wilayas</option>
          {wilayas.map(w => (
            <option key={w} value={w} className="text-gray-900">{w}</option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Filter className="w-4 h-4 text-indigo-200" />
        </div>
      </div>

      <button 
        onClick={handleSearch}
        className="bg-white text-indigo-900 font-bold py-3.5 px-8 rounded-xl hover:bg-gray-50 transition-colors shadow-lg active:scale-95 duration-200"
      >
        Rechercher
      </button>
    </div>
  );
}
