"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  const exchangeToken = useNylasExchangeToken();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      toast.error("Email connection was cancelled or failed.");
      router.replace("/user/settings/email?nylas_error=connection_failed");
      return;
    }

    exchangeToken.mutate(
      { code, state },
      {
        onSuccess: () => {
          router.replace("/user/settings/email?nylas_connected=true");
        },
        onError: () => {
          toast.error("Failed to connect email. Please try again.");
          router.replace("/user/settings/email?nylas_error=connection_failed");
        },
      }
    );
  }, [exchangeToken, router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
      <Loader2 className="h-8 w-8 animate-spin text-[#1A4A7A]" />
      <p className="text-sm">Connecting your email account…</p>
    </div>
  );
}
