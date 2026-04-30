'use client';

import { useState, useEffect, useActionState } from 'react';
import { updateProfile, updatePassword, ActionResult } from '@/modules/auth/actions';
import { User, Phone, Mail, Loader2, CheckCircle2, AlertCircle, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AccountFormProps {
    profile: any;
    userEmail: string;
}

const initialState: ActionResult = {
    success: false,
};

export function AccountForm({ profile, userEmail }: AccountFormProps) {
    const [state, formAction, isPending] = useActionState(updateProfile, initialState);
    const [pwdState, pwdAction, isPwdPending] = useActionState(updatePassword, initialState);
    
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const [fullName, setFullName] = useState(profile?.full_name ?? '');
    const [phone, setPhone] = useState(profile?.phone ?? '');

    // Sync local state when profile prop changes (e.g. after server revalidation)
    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name ?? '');
            setPhone(profile.phone ?? '');
        }
    }, [profile]);

    // Note: useActionState provides isPending automatically.
    
    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-none shadow-xl bg-white/70 backdrop-blur-md overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100 pb-8">
                    <div className="flex items-center gap-6">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-white shadow-lg overflow-hidden group-hover:border-primary/30 transition-all duration-300">
                                {profile?.avatar_url ? (
                                    <img 
                                        src={profile.avatar_url} 
                                        alt={profile.full_name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-primary/40" />
                                )}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-gray-100 text-gray-600 hover:text-primary transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-900">Paramètres du compte</CardTitle>
                            <CardDescription className="text-gray-500 mt-1">
                                Gérez vos informations personnelles et vos préférences.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form action={formAction} className="space-y-6">
                        {state?.success && (
                            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-2xl border border-green-100 animate-in zoom-in-95 duration-300">
                                <CheckCircle2 className="w-5 h-5" />
                                <p className="text-sm font-medium">Vos modifications ont été enregistrées avec succès.</p>
                            </div>
                        )}

                        {state?.error && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in zoom-in-95 duration-300">
                                <AlertCircle className="w-5 h-5" />
                                <p className="text-sm font-medium">{state.error}</p>
                            </div>
                        )}

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-sm font-bold text-gray-700 ml-1">Nom complet</Label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-3 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        id="full_name"
                                        name="full_name"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Votre nom"
                                        className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-primary/20 transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 opacity-70">
                                <Label htmlFor="email" className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                                    Email
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">Lecture seule</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                                    <Input 
                                        id="email"
                                        defaultValue={userEmail}
                                        disabled
                                        className="pl-12 h-12 rounded-xl border-gray-100 bg-gray-50/50 font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-bold text-gray-700 ml-1">Téléphone</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-3 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                                    <Input 
                                        id="phone"
                                        name="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="0X XX XX XX XX"
                                        className="pl-12 h-12 rounded-xl border-gray-200 focus:ring-primary/20 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <Input 
                                type="hidden"
                                name="avatar_url"
                                defaultValue={profile?.avatar_url}
                            />
                        </div>

                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                disabled={isPending}
                                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    'Enregistrer les modifications'
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/70 backdrop-blur-md overflow-hidden">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-50 rounded-lg">
                            <Lock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold text-gray-900">Sécurité</CardTitle>
                            <CardDescription>
                                Mettez à jour votre mot de passe pour sécuriser votre compte.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                    {!showPasswordForm ? (
                        <Button 
                            onClick={() => setShowPasswordForm(true)}
                            variant="outline" 
                            className="w-full h-11 rounded-xl border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-all"
                        >
                            Changer le mot de passe
                        </Button>
                    ) : (
                        <form action={pwdAction} className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                            {pwdState?.success && (
                                <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100 mb-2">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <p className="text-xs font-medium">Mot de passe mis à jour avec succès.</p>
                                </div>
                            )}
                            
                            {pwdState?.error && (
                                <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-xl border border-red-100 mb-2">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-xs font-medium">{pwdState.error}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="currentPassword text-xs font-bold text-gray-600">Mot de passe actuel</Label>
                                <Input 
                                    id="currentPassword"
                                    name="currentPassword"
                                    type="password"
                                    placeholder="Entrez votre mot de passe actuel"
                                    className="h-11 rounded-xl border-gray-200 focus:ring-primary/20 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password text-xs font-bold text-gray-600">Nouveau mot de passe</Label>
                                <div className="relative group">
                                    <Input 
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Min. 8 caractères"
                                        className="h-11 rounded-xl border-gray-200 focus:ring-primary/20 transition-all font-medium pr-10"
                                        required
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword text-xs font-bold text-gray-600">Confirmer le mot de passe</Label>
                                <Input 
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Répétez le mot de passe"
                                    className="h-11 rounded-xl border-gray-200 focus:ring-primary/20 transition-all font-medium"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button 
                                    type="button"
                                    onClick={() => setShowPasswordForm(false)}
                                    variant="ghost"
                                    className="flex-1 h-11 rounded-xl font-bold text-gray-500"
                                >
                                    Annuler
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={isPwdPending}
                                    className="flex-[2] h-11 rounded-xl bg-gray-900 hover:bg-black text-white font-bold shadow-lg transition-all"
                                >
                                    {isPwdPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Mettre à jour'
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
