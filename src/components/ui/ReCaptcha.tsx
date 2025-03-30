'use client';

import { useRef, useEffect } from 'react';
import Script from 'next/script';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  siteKey?: string;
}

// Definición del tipo para el objeto global de reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
      render: (container: string | HTMLElement, parameters: any) => number;
    };
    onReCaptchaLoad: () => void;
  }
}

export default function ReCaptcha({ onVerify, siteKey }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  
  // Usa la clave del sitio de las variables de entorno si no se proporciona
  const recaptchaSiteKey = siteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeRNwQrAAAAAGfwBk0_pUFrmlM6U-A5pTbCiUlZ';

  useEffect(() => {
    if (!containerRef.current) return;

    // Define la función de callback global
    window.onReCaptchaLoad = () => {
      if (containerRef.current && window.grecaptcha) {
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: recaptchaSiteKey,
          callback: onVerify,
          'expired-callback': () => onVerify(null),
          'error-callback': () => onVerify(null),
        });
      }
    };

    // Limpieza al desmontar
    return () => {
      // No hay una manera directa de "destruir" un widget de reCAPTCHA, 
      // pero podemos asegurarnos de que el callback ya no haga nada
      window.onReCaptchaLoad = () => {};
    };
  }, [onVerify, recaptchaSiteKey]);

  return (
    <>
      <Script
        src={`https://www.google.com/recaptcha/api.js?onload=onReCaptchaLoad&render=explicit`}
        strategy="lazyOnload"
      />
      <div ref={containerRef} className="g-recaptcha mb-4"></div>
    </>
  );
}