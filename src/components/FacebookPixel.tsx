'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    fbq: any;
  }
}

interface FacebookPixelProps {
  pixelId: string;
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname();

  useEffect(() => {
    // Carregar Facebook Pixel
    if (!window.fbq) {
      (function (f: any, b: any, e: any, v: any) {
        let n: any;
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        const t = b.createElement(e);
        t.async = true;
        t.src = v;
        const s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
    }

    // Track page view on route change
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pixelId, pathname]);

  return null;
}

// Funções utilitárias para eventos do Facebook Pixel
export const trackEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

export const trackPurchase = (value: number, currency: string = 'BRL', contentIds?: string[]) => {
  trackEvent('Purchase', {
    value: value,
    currency: currency,
    content_ids: contentIds,
    content_type: 'product'
  });
};

export const trackAddToCart = (value: number, currency: string = 'BRL', contentIds?: string[]) => {
  trackEvent('AddToCart', {
    value: value,
    currency: currency,
    content_ids: contentIds,
    content_type: 'product'
  });
};

export const trackViewContent = (contentIds?: string[], value?: number, currency: string = 'BRL') => {
  trackEvent('ViewContent', {
    content_ids: contentIds,
    content_type: 'product',
    value: value,
    currency: currency
  });
};

export const trackInitiateCheckout = (value: number, currency: string = 'BRL', contentIds?: string[]) => {
  trackEvent('InitiateCheckout', {
    value: value,
    currency: currency,
    content_ids: contentIds,
    content_type: 'product'
  });
};

export const trackCompleteRegistration = () => {
  trackEvent('CompleteRegistration');
};

export const trackContact = () => {
  trackEvent('Contact');
};
