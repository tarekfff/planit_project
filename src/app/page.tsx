"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Users, Clock, Bell, UserPlus, Settings, CalendarCheck, Check, Zap, Layers, ChevronRight, Menu, X } from "lucide-react";

export default function HomePage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("annually");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════ NAVBAR ═══════════════════ */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5">
              <Image
                src="/logo.svg"
                alt="Planit Logo"
                width={146}
                height={131}
                className="w-24 pt-5 h-auto"
                priority
                unoptimized
              />
            </Link>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#accueil" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Accueil</a>
              <a href="#fonctionnalites" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Fonctionnalités</a>
              <a href="#comment-ca-marche" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Comment ça marche</a>
              <a href="#tarifs" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Tarifs</a>
              <a href="#contact" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:text-[var(--planit-cyan-dark)] transition-colors"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold bg-primary text-white px-4 py-2 rounded-xl hover:bg-[var(--planit-cyan-dark)] transition-all shadow-sm hover:shadow-md"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      </nav>




{/* ═══════════════════ HERO - VERSION AMÉLIORÉE ═══════════════════ */}
<section id="accueil" className="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 pt-8 pb-16 lg:pt-12 lg:pb-24">
  
  {/* Blob décoratif (forme organique) */}
  <div className="absolute top-0 right-0 w-full lg:w-3/5 h-full pointer-events-none z-0">
    <div className="relative w-full h-full">
      <Image
        src="/hero-blob.svg"
        alt=""
        fill
        className="object-cover object-right-top opacity-90"
        priority
      />
    </div>
  </div>

  {/* Contenu principal */}
  <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-8">
      
      {/* Bloc texte gauche */}
      <div className="flex-1 lg:max-w-xl xl:max-w-2xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight text-gray-900">
          Gérez vos rendez-vous,<br />
          simplement et intelligemment
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-lg">
          Planit connecte vos clients à vos professionnels en toute simplicité
        </p>
        
        {/* Boutons CTA */}
        <div className="flex flex-wrap gap-4 mt-8">
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold bg-[#40BDFB] text-white hover:bg-[#34a4db] transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
          >
            Commencer gratuitement
          </Link>
          <a
            href="#fonctionnalites"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-semibold border-2 border-gray-200 bg-white/80 backdrop-blur-sm text-gray-700 hover:border-[#40BDFB] hover:bg-white hover:text-[#40BDFB] transition-all hover:scale-105 active:scale-95"
          >
            En savoir plus
          </a>
        </div>
      </div>

      {/* Bloc illustration + cartes flottantes (côté droit) */}
      <div className="flex-1 relative flex justify-center lg:justify-end">
        <div className="relative w-full max-w-[550px] lg:max-w-[650px] xl:max-w-[750px] min-h-[450px] lg:min-h-[550px]">
          
          {/* CARTES FLOTTANTES (alignées à gauche de l'illustration) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4 sm:gap-5">
            {/* Carte 1 - Réservation Intelligente */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl py-3 sm:py-4 px-4 sm:px-6 pr-6 sm:pr-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-default backdrop-blur-sm bg-white/95">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#40BDFB] text-white text-base sm:text-lg font-bold flex items-center justify-center shadow-md shadow-blue-500/30">
                1
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-gray-900">Réservation</p>
                <p className="text-xs sm:text-sm text-gray-500 -mt-0.5">Intelligente</p>
              </div>
            </div>

            {/* Carte 2 - Votre Temps est Précieux (décalée) */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl py-3 sm:py-4 px-4 sm:px-6 pr-6 sm:pr-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-default backdrop-blur-sm bg-white/95 translate-x-6 sm:translate-x-8 lg:translate-x-12">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#40BDFB] text-white text-base sm:text-lg font-bold flex items-center justify-center shadow-md shadow-blue-500/30">
                2
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-gray-900">Votre Temps</p>
                <p className="text-xs sm:text-sm text-gray-500 -mt-0.5">est Précieux</p>
              </div>
            </div>

            {/* Carte 3 - Toujours Informé (décalée encore plus) */}
            <div className="group bg-white rounded-2xl sm:rounded-3xl py-3 sm:py-4 px-4 sm:px-6 pr-6 sm:pr-10 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center gap-4 hover:-translate-y-1 transition-all duration-300 cursor-default backdrop-blur-sm bg-white/95 translate-x-12 sm:translate-x-16 lg:translate-x-24">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#40BDFB] text-white text-base sm:text-lg font-bold flex items-center justify-center shadow-md shadow-blue-500/30">
                3
              </div>
              <div>
                <p className="text-sm sm:text-base font-bold text-gray-900">Toujours</p>
                <p className="text-xs sm:text-sm text-gray-500 -mt-0.5">Informé</p>
              </div>
            </div>
          </div>

          {/* Illustration principale (jeune femme avec tablette/calendrier) */}
          <div className="relative w-full h-full min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]">
            <Image
              src="/new-hero-illustration.png"
              alt="Planit - Gestion de rendez-vous simplifiée"
              fill
              className="object-contain object-right-bottom drop-shadow-2xl"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>



      {/* ═══════════════════ FONCTIONNALITÉS ═══════════════════ */}
      <section id="fonctionnalites" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Nos Fonctionnalités</h2>
            <p className="text-gray-500 max-w-lg mx-auto">
              Une plateforme complète qui simplifie la gestion de vos rendez-vous de A à Z
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Calendar, label: "Réservation en Ligne", desc: "Réservez un créneau en quelques clics, 24h/24 et 7j/7", color: "text-blue-500", bg: "bg-blue-50" },
              { icon: Users, label: "Multi-Professionnels", desc: "Gérez plusieurs professionnels au sein d'un même établissement", color: "text-indigo-500", bg: "bg-indigo-50" },
              { icon: Clock, label: "Créneaux Intelligents", desc: "Le système propose automatiquement les meilleurs créneaux disponibles", color: "text-orange-500", bg: "bg-orange-50" },
              { icon: Bell, label: "Notifications Auto", desc: "Confirmations et rappels envoyés automatiquement à vos clients", color: "text-pink-500", bg: "bg-pink-50" },
            ].map((feature) => (
              <div key={feature.label} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{feature.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="#comment-ca-marche" className="inline-flex items-center text-sm font-semibold text-primary hover:text-[var(--planit-cyan-dark)] transition-colors">
              En savoir plus <ChevronRight className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════ COMMENT ÇA MARCHE ═══════════════════ */}
      <section id="comment-ca-marche" className="py-20 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Comment ça marche ?</h2>
            <p className="text-gray-500">Commencez en 3 étapes simples</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dotted connector line (desktop only) */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-0.5 border-t-2 border-dashed border-primary/30" />

            {[
              { icon: UserPlus, label: "Créez votre compte", desc: "Inscrivez-vous en tant qu'établissement ou client, remplissez vos informations et accédez à votre espace en quelques secondes", color: "bg-blue-500" },
              { icon: Settings, label: "Configurez votre espace", desc: "Ajoutez vos professionnels, définissez vos services, horaires et disponibilités. Ou explorez et recherchez l'établissement qui correspond à vos besoins", color: "bg-orange-500" },
              { icon: CalendarCheck, label: "Réservez et laissez Planit gérer", desc: "Prenez rendez-vous en un clic, créez des RDV manuellement et laissez le système suggérer automatiquement les meilleurs créneaux. Recevez des notifications instantanées", color: "bg-red-500" },
            ].map((step, i) => (
              <div key={step.label} className="flex flex-col items-center text-center relative">
                <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-5 shadow-lg relative z-10`}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{step.label}</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ TARIFICATION ═══════════════════ */}
      <PricingSection billingCycle={billingCycle} setBillingCycle={setBillingCycle} />

      {/* ═══════════════════ FOOTER ═══════════════════ */}
      <footer id="contact" className="bg-gray-950 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Logo & Links */}
            <div>
              <Link href="/" className="flex items-center gap-1.5 mb-6">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  <span className="text-primary">P</span>lanit
                </span>
              </Link>
              <div className="space-y-2 text-sm">
                <a href="#accueil" className="block hover:text-primary transition-colors">Accueil</a>
                <a href="#fonctionnalites" className="block hover:text-primary transition-colors">Fonctionnalités</a>
                <a href="#comment-ca-marche" className="block hover:text-primary transition-colors">Comment ça marche</a>
                <a href="#tarifs" className="block hover:text-primary transition-colors">Tarifs</a>
                <a href="#contact" className="block hover:text-primary transition-colors">Contact</a>
                <Link href="/login" className="block hover:text-primary transition-colors">Se connecter</Link>
                <Link href="/register" className="block hover:text-primary transition-colors">Commencer</Link>
              </div>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-white font-bold mb-4">Légal</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block hover:text-primary transition-colors">Politique de confidentialité</a>
                <a href="#" className="block hover:text-primary transition-colors">Mentions légales</a>
                <a href="#" className="block hover:text-primary transition-colors">Cookies</a>
                <a href="#" className="block hover:text-primary transition-colors">Conditions d&apos;utilisation</a>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-bold mb-4">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>📧 contact@planit.dz</p>
                <p>📞 +213 554 85 26 33</p>
                <p>📍 Boumerdès, Algérie</p>
                <a href="#" className="block hover:text-primary transition-colors">Nous contacter</a>
                <a href="#" className="block hover:text-primary transition-colors">Support & Aide</a>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-white font-bold text-lg mb-2">Ne manquez rien avec Planit</h3>
              <p className="text-sm text-gray-400 mb-4">
                Recevez les dernières mises à jour, nouveautés et conseils directement dans votre boîte mail
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Entrez votre email"
                  className="flex-1 px-4 py-2.5 rounded-l-xl bg-gray-800 border border-gray-700 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-primary"
                />
                <button className="px-4 py-2.5 rounded-r-xl bg-gray-700 hover:bg-gray-600 text-sm font-medium text-white transition-colors">
                  S&apos;abonner →
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">Copyright @2026 Planit</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════ PRICING COMPONENT ═══════════════════ */
function PricingSection({ billingCycle, setBillingCycle }: {
  billingCycle: "monthly" | "annually",
  setBillingCycle: (val: "monthly" | "annually") => void
}) {
  const prices = {
    monthly: { basic: "0", business: "3 500", enterprise: "Sur devis" },
    annually: { basic: "0", business: "2 900", enterprise: "Sur devis" }
  };

  return (
    <section id="tarifs" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Tarification Simple et Transparente</h2>
          <p className="text-gray-500">Choisissez le plan qui correspond à vos besoins. Essayez gratuitement pendant 30 jours</p>
        </div>

        {/* Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 rounded-full p-1 shadow-inner">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              Facturation Mensuelle
            </button>
            <button
              onClick={() => setBillingCycle("annually")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "annually" ? "bg-gray-900 text-white shadow-md" : "text-gray-500 hover:text-gray-700"}`}
            >
              Facturation Annuelle
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Basic Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 mb-4 mx-auto">
              <Zap className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-1">Basic plan</h3>
            <div className="text-center mb-1">
              <span className="text-3xl font-bold text-gray-900">{prices[billingCycle].basic} DA</span>
              <span className="text-gray-500 text-sm"> / mois</span>
            </div>
            <p className="text-sm text-gray-500 text-center mb-6">Gratuit pour toujours</p>

            <div className="space-y-3 flex-1">
              {["1 Établissement", "2 Professionnels maximum", "Réservation en ligne", "Notifications de base (confirmation uniquement)", "Planning simple", "Support communautaire"].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="mt-8 block text-center px-6 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-all"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Business Plan (Featured) */}
          <div className="bg-gray-950 rounded-2xl p-8 flex flex-col relative shadow-xl scale-[1.03] text-white">
            {/* Badge */}
            <div className="absolute -top-3 right-6 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Best Value
            </div>

            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4 mx-auto">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-center mb-1">Business plan</h3>
            <div className="text-center mb-1">
              <span className="text-3xl font-bold text-primary">{prices[billingCycle].business} DA</span>
              <span className="text-gray-400 text-sm"> / mois</span>
            </div>
            <p className="text-sm text-gray-400 text-center mb-6">Facturé {billingCycle === "annually" ? "annuellement" : "mensuellement"}</p>

            <div className="space-y-3 flex-1">
              {["1 Établissement", "Jusqu'à 10 Professionnels", "Réservation en ligne", "Créneaux intelligents automatiques", "Planning avancé (jour / semaine / mois)", "Statistiques et rapports", "Historique complet des RDV"].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}
            </div>

            <Link
              href="/register"
              className="mt-8 block text-center px-6 py-3 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-[var(--planit-cyan-dark)] transition-all shadow-md"
            >
              Commencer l&apos;essai gratuit
            </Link>
          </div>

          {/* Enterprise Plan */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 flex flex-col hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 mb-4 mx-auto">
              <Layers className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-lg font-bold text-center text-gray-900 mb-1">Enterprise plan</h3>
            <div className="text-center mb-1">
              <span className="text-3xl font-bold text-gray-900">Sur devis</span>
            </div>
            <p className="text-sm text-gray-500 text-center mb-6">Facturé annuellement</p>

            <div className="space-y-3 flex-1">
              {["Établissements illimités", "Professionnels illimités", "Toutes les fonctionnalités Pro", "Tableau de bord multi-établissements", "Notifications SMS intégrées", "Statistiques avancées et exports", "Accès API", "Intégrations personnalisées"].map((f) => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-600">{f}</span>
                </div>
              ))}
            </div>

            <a
              href="#contact"
              className="mt-8 block text-center px-6 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:border-primary hover:text-primary transition-all"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
