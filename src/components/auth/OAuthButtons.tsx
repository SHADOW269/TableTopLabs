"use client";

import { authClient } from "@/lib/auth/auth-client";
import { useState } from "react";

const PROVIDERS = [
  {
    id: "google",
    label: "Google",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.9c2.3-2.1 3.7-5.2 3.7-8.6Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.7-2.9c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5l-3.8 3c1.9 3.8 5.8 6.6 10.7 6.6Z"
        />
        <path
          fill="#FBBC05"
          d="M5.1 14.4a7.2 7.2 0 0 1-.4-2.4c0-.8.1-1.6.4-2.4L1.3 6.6A12 12 0 0 0 0 12c0 1.9.5 3.8 1.3 5.4l3.8-3Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.6c2.3 0 3.8 1 4.7 1.8l3.4-3.3C17.9 1.2 15.2 0 12 0 7.1 0 3.2 2.8 1.3 6.6l3.8 3c1-2.9 3.7-5 6.9-5Z"
        />
      </svg>
    ),
  },
] as const;

/** Shared Google button on the auth pages — existing Better Auth handlers only. */
export function OAuthButtons() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function social(provider: "google") {
    setBusy(true);
    setError(null);
    try {
      const res = await authClient.signIn.social({
        provider,
        callbackURL: "/auth/callback",
        errorCallbackURL: "/auth/error",
      });
      if (res.error)
        setError("That sign-in isn't configured yet. Try email instead.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-social">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          className="btn-social"
          onClick={() => social(p.id)}
          disabled={busy}
        >
          {p.icon}
          <span>Continue with {p.label}</span>
        </button>
      ))}
      {error && (
        <p className="auth-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
