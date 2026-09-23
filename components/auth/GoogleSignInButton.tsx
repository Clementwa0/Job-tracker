"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            ux_mode?: "popup" | "redirect";
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

let gsiScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.accounts?.id) return Promise.resolve();

  if (!gsiScriptPromise) {
    gsiScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity Services")));
        return;
      }
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Google Identity Services"));
      document.head.appendChild(script);
    });
  }

  return gsiScriptPromise;
}

interface GoogleSignInButtonProps {
  onCredential: (idToken: string) => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}

export function GoogleSignInButton({
  onCredential,
  disabled,
  className,
  ariaLabel,
  children,
}: GoogleSignInButtonProps) {
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const hasMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState<string | null>(() =>
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ? null : "Google sign-in isn't configured yet.",
  );

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let cancelled = false;

    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled || !window.google || !hiddenContainerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          ux_mode: "popup",
          callback: (response) => {
            void onCredential(response.credential);
          },
        });

        window.google.accounts.id.renderButton(hiddenContainerRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
        });

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setConfigError("Couldn't load Google sign-in. Check your connection and try again.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleClick() {
    if (!ready || disabled) return;
    hiddenContainerRef.current?.querySelector<HTMLElement>("div[role=button]")?.click();
  }

  return (
    <div>
      <Button
        type="button"
        variant="default"
        onClick={handleClick}
        disabled={disabled || (hasMounted && (!ready || !!configError))}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </Button>
      {configError && (
        <p role="alert" className="mt-2 text-[13px] text-red-600">
          {configError}
        </p>
      )}
      <div
        ref={hiddenContainerRef}
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      />
    </div>
  );
}