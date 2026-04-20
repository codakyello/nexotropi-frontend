"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useNylasExchangeToken } from "@/services/requests/negotiation";

export default function NylasCallbackPage() {
  return (
    <Suspense>
      <NylasCallbackContent />
    </Suspense>
  );
}

function NylasCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mutateAsync } = useNylasExchangeToken();
  const calledRef = useRef(false);
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const oauthError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (oauthError || !code || !state) {
      const msg = errorDescription || "Email connection was cancelled or failed.";
      setStatus("error");
      router.replace(`/user/settings/email?nylas_error=connection_failed&nylas_error_message=${encodeURIComponent(msg)}`);
      return;
    }

    mutateAsync({ code, state })
      .then(() => {
        console.log("[Nylas callback] ✅ token exchange succeeded");
        setStatus("success");
        router.replace("/user/settings/email?nylas_connected=true");
      })
      .catch((err: any) => {
        console.error("[Nylas callback] ❌ token exchange failed", err);
        const msg =
          err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to connect email. Please try again.";
        setStatus("error");
        router.replace(`/user/settings/email?nylas_error=connection_failed&nylas_error_message=${encodeURIComponent(msg)}`);
      });
  }, [mutateAsync, router, searchParams])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
      <Loader2 className="h-8 w-8 animate-spin text-[#1A4A7A]" />
      <p className="text-sm">Connecting your email account…</p>
    </div>
  );
}
