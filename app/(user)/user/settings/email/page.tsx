"use client";

import { Suspense, useEffect } from "react";
import { ArrowLeft, Mail, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNylasStatus, useNylasConnect, useNylasDisconnect } from "@/services/requests/negotiation";
import { useQueryClient } from "@tanstack/react-query";

export default function EmailSetupPage() {
  return (
    <Suspense>
      <EmailSetupContent />
    </Suspense>
  );
}

function EmailSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qc = useQueryClient();
  // isFetching covers both initial load AND background refetches (stale cache)
  const { data: nylasStatus, isLoading, isFetching, isError, refetch } = useNylasStatus();
  const connectNylas = useNylasConnect();
  const disconnectNylas = useNylasDisconnect();

  const isConnected = !!(nylasStatus?.grant_id);

  // Handle OAuth callback: backend redirects to /?nylas_connected=true after OAuth
  useEffect(() => {
    if (searchParams.get("nylas_connected") === "true") {
      toast.success("Email connected successfully!");
      qc.invalidateQueries({ queryKey: ["nylas-status"] });
    } else if (searchParams.get("nylas_error")) {
      toast.error("Email connection failed. Please try again.");
    }
  }, []);

  const handleConnect = async (provider: string) => {
    try {
      const result = await connectNylas.mutateAsync(provider);
      // Backend returns { url: "..." } — redirect the whole page so OAuth flow works
      if (result?.url) {
        window.location.href = result.url;
      } else {
        toast.error("No auth URL returned from server");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to initiate connection");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect email? This will stop all email-based negotiations.")) return;
    try {
      await disconnectNylas.mutateAsync();
      toast.success("Email disconnected");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to disconnect");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Mail className="h-6 w-6 text-[#1A4A7A]" />
        <h1 className="text-2xl font-bold text-gray-900">Email Connection</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Connection Status</h3>

        {isLoading || isFetching ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking connection...
          </div>
        ) : isError ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span className="font-medium text-amber-700">Connection Status Unavailable</span>
            </div>
            <p className="text-sm text-gray-500">
              We could not verify your email integration right now. This may be a temporary request failure rather than a disconnected account.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh Status</Button>
              <Button size="sm" className="bg-[#1A4A7A]" onClick={() => handleConnect("google")} disabled={connectNylas.isPending}>
                {connectNylas.isPending ? "Connecting..." : "Connect Gmail"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleConnect("microsoft")} disabled={connectNylas.isPending}>
                Connect Outlook
              </Button>
            </div>
          </div>
        ) : isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="font-medium text-green-700">Email Connected</span>
              {nylasStatus?.provider && (
                <Badge variant="outline" className="text-xs capitalize">{nylasStatus.provider}</Badge>
              )}
              {nylasStatus?.status && (
                <Badge variant="outline" className="text-xs capitalize text-gray-500">{nylasStatus.status}</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Inbound emails from suppliers will be automatically classified and processed by the AI negotiation pipeline.
            </p>
            <p className="text-xs text-gray-400">
              To switch to a different provider, disconnect first then reconnect with the new account.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()}>Refresh Status</Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDisconnect} disabled={disconnectNylas.isPending}>
                {disconnectNylas.isPending ? "Disconnecting..." : "Disconnect"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-400" />
              <span className="font-medium text-red-600">Not Connected</span>
            </div>
            <p className="text-sm text-gray-500">
              Connect your email account via Nylas to enable the AI negotiation pipeline. The system will monitor inbound emails, classify them, extract offers, and generate counteroffers.
            </p>
            <div className="flex gap-2">
              <Button size="sm" className="bg-[#1A4A7A]" onClick={() => handleConnect("google")} disabled={connectNylas.isPending}>
                {connectNylas.isPending ? "Connecting..." : "Connect Gmail"}
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleConnect("microsoft")} disabled={connectNylas.isPending}>
                Connect Outlook
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex gap-3">
            <span className="bg-[#1A4A7A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">1</span>
            <p><strong>Connect:</strong> Link your email via Nylas OAuth (Gmail or Outlook)</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-[#1A4A7A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">2</span>
            <p><strong>Classify:</strong> AI reads every inbound email and classifies it (quote, clarification, rejection, etc.)</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-[#1A4A7A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">3</span>
            <p><strong>Extract:</strong> For quotes, AI extracts pricing, quantity, delivery terms from the email</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-[#1A4A7A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">4</span>
            <p><strong>Negotiate:</strong> AI generates counteroffers based on your strategy and constraints</p>
          </div>
          <div className="flex gap-3">
            <span className="bg-[#1A4A7A] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0">5</span>
            <p><strong>Review:</strong> In manual mode, you approve each reply before it&apos;s sent</p>
          </div>
        </div>
      </div>
    </div>
  );
}
