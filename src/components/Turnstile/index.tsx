import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// Cloudflare Turnstile captcha: https://developers.cloudflare.com/turnstile/
interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptPromise: Promise<void> | null = null;

const loadScript = () => {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error("Failed to load captcha"));
      };
      document.head.appendChild(script);
    });
  }

  return scriptPromise;
};

export interface TurnstileHandles {
  reset(): void;
}

interface TurnstileProps {
  onTokenChange(token: string): void;
}

const Turnstile = forwardRef<TurnstileHandles, TurnstileProps>(({ onTokenChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>();

  useImperativeHandle(ref, () => ({
    reset() {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current);
      }
      onTokenChange("");
    },
  }), [onTokenChange]);

  useEffect(() => {
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: import.meta.env.VITE_APP_TURNSTILE_SITE_KEY,
          language: "pt-br",
          callback: onTokenChange,
          "expired-callback": () => onTokenChange(""),
          "error-callback": () => onTokenChange(""),
        });
      })
      .catch((error) => console.error(error));

    return () => {
      cancelled = true;

      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
      }
      widgetIdRef.current = undefined;
    };
  }, [onTokenChange]);

  return <div ref={containerRef} />;
});

export default Turnstile;
