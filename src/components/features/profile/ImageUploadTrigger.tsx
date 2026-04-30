'use client';

import { useState, useRef } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { uploadEstablishmentImage } from '@/modules/establishments/actions';

interface ImageUploadTriggerProps {
    type: 'logo' | 'banner';
    className?: string;
}

export function ImageUploadTrigger({ type, className }: ImageUploadTriggerProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            alert('Veuillez sélectionner une image');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('L\'image est trop volumineuse (max 5MB)');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const result = await uploadEstablishmentImage(formData);
            if (result.success) {
                // Success - the page will revalidate and show the new image
            } else {
                alert(result.error || 'Erreur lors de l\'upload');
            }
        } catch (error) {
            alert('Une erreur est survenue');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    }

    return (
        <div className={className}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:bg-white transition-all group"
                title={`Changer ${type === 'logo' ? 'le logo' : 'la bannière'}`}
            >
                {isUploading ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : (
                    <Camera className="w-5 h-5 text-gray-600 group-hover:text-primary" />
                )}
            </button>
        </div>
    );
}
