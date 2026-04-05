import { ArrowRight } from "lucide-react";

export function ProfilePhotos() {
    const photos = [
        'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop', // Large top
        'https://images.unsplash.com/photo-1519494080410-f9aa76cb4283?q=80&w=500&auto=format&fit=crop', // Small 1
        'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=500&auto=format&fit=crop', // Small 2
        'https://images.unsplash.com/photo-1594824436951-7f12bc41753a?q=80&w=500&auto=format&fit=crop', // Small 3
    ];

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Nos Photos</h2>

            <div className="rounded-3xl overflow-hidden bg-white border border-gray-100 p-2 shadow-sm">

                {/* Top Large Photo */}
                <div className="w-full h-[300px] rounded-2xl overflow-hidden mb-2 relative group cursor-pointer">
                    <img src={photos[0]} alt="Clinic Main" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                </div>

                {/* Bottom Row */}
                <div className="flex gap-2">
                    <div className="w-1/4 h-[120px] rounded-2xl overflow-hidden group cursor-pointer">
                        <img src={photos[1]} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="w-1/4 h-[120px] rounded-2xl overflow-hidden group cursor-pointer">
                        <img src={photos[2]} alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="w-1/4 h-[120px] rounded-2xl overflow-hidden group cursor-pointer relative">
                        <img src={photos[3]} alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-white font-bold text-sm">+12</span>
                        </div>
                    </div>

                    {/* See More block */}
                    <div className="w-1/4 h-[120px] rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer group">
                        <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-gray-900 transition-colors group-hover:translate-x-1" />
                    </div>
                </div>

            </div>
        </div>
    );
}
