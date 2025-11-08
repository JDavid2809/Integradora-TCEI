'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-dismissed');
        if (dismissed) {
            const dismissedTime = parseInt(dismissed);
            const oneDayInMs = 24 * 60 * 60 * 1000;
            if (Date.now() - dismissedTime < oneDayInMs) {
                setIsDismissed(true);
                return;
            }
        }

        const handler = (e: Event) => {
            e.preventDefault();

            // Verificar nuevamente al momento del evento
            const currentDismissed = localStorage.getItem('pwa-dismissed');
            if (currentDismissed) {
                const dismissedTime = parseInt(currentDismissed);
                const oneDayInMs = 24 * 60 * 60 * 1000;

                if (Date.now() - dismissedTime < oneDayInMs) {
                    return;
                }
            }

            setDeferredPrompt(e as BeforeInstallPromptEvent);

            // Esperar 3 segundos antes de mostrar el prompt
            setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        setIsInstalling(true);

        try {
            // Mostrar el prompt de instalación
            await deferredPrompt.prompt();

            // Esperar la elección del usuario
            const { outcome } = await deferredPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('PWA instalada exitosamente');
                localStorage.removeItem('pwa-dismissed'); // Limpiar el localStorage
            }
        } catch (error) {
            console.error('Error al instalar PWA:', error);
        } finally {
            setDeferredPrompt(null);
            setShowPrompt(false);
            setIsInstalling(false);
        }
    };

    const handleDismiss = () => {
        // Guardar timestamp del descarte
        localStorage.setItem('pwa-dismissed', Date.now().toString());
        setShowPrompt(false);
        setDeferredPrompt(null);
        setIsDismissed(true); // Marcar como descartado en el estado
    };

    // No mostrar si está descartado o no hay prompt
    if (isDismissed || !showPrompt || !deferredPrompt) return null;

    return (
        <>
            {/* Overlay con blur */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300"
                onClick={handleDismiss}
            />

            {/* Prompt card */}
            <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-full sm:max-w-lg z-50 animate-in slide-in-from-top-5 duration-500">
                <div className="bg-gradient-to-br from-[#00246a] via-[#003875] to-[#00246a] rounded-2xl shadow-2xl overflow-hidden border-2 border-[#e30f28] relative">
                    {/* Patrón decorativo */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#e30f28] rounded-full translate-y-24 -translate-x-24"></div>
                    </div>

                    {/* Botón cerrar */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all z-10"
                        aria-label="Cerrar"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="relative z-10 p-6 sm:p-8">
                        {/* Icono */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/95 backdrop-blur-sm shadow-xl flex items-center justify-center flex-shrink-0">
                                <img
                                    src="/logos/icon512_rounded.png"
                                    alt="App Icon"
                                    className="w-12 h-12 rounded-xl"
                                />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">
                                    ¡Instala la App!
                                </h3>
                                <p className="text-white/70 text-sm">
                                    Triunfando con el Inglés
                                </p>
                            </div>
                        </div>

                        {/* Beneficios */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-3 text-white/90 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-[#e30f28]/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 text-[#e30f28]" />
                                </div>
                                <span>Acceso rápido desde tu pantalla de inicio</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-[#e30f28]/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 text-[#e30f28]" />
                                </div>
                                <span>Funciona sin conexión a internet</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/90 text-sm">
                                <div className="w-8 h-8 rounded-lg bg-[#e30f28]/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="w-4 h-4 text-[#e30f28]" />
                                </div>
                                <span>Experiencia similar a una app nativa</span>
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleInstall}
                                disabled={isInstalling}
                                className="flex-1 bg-[#e30f28] hover:bg-[#c00d23] text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isInstalling ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Instalando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        <span>Instalar App</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-6 py-3.5 rounded-xl border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
                            >
                                Ahora no
                            </button>
                        </div>

                        {/* Indicador de dispositivo */}
                        <div className="mt-4 flex items-center justify-center gap-2 text-white/50 text-xs">
                            <Smartphone className="w-4 h-4" />
                            <span>Compatible con Android y Desktop</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
