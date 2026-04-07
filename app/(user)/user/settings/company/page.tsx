"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Building2, Palette, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useCompanyProfile, useCreateCompanyProfile, useUpdateCompanyProfile } from "@/services/requests/negotiation";

export default function CompanyProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useCompanyProfile();
  const createProfile = useCreateCompanyProfile();
  const updateProfile = useUpdateCompanyProfile();

  const [form, setForm] = useState({
    company_name: "",
    legal_entity_name: "",
    tagline: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state_province: "",
    postal_code: "",
    country: "",
    phone: "",
    email: "",
    website: "",
    tax_id: "",
    registration_number: "",
    default_currency: "USD",
    default_payment_terms: "",
    default_delivery_location: "",
    signatory_name: "",
    signatory_title: "",
    primary_color: "#1A4A7A",
    secondary_color: "#38bdf8",
    logo_url: "",
    stamp_url: "",
    footer_disclaimer: "",
    terms_and_conditions: "",
  });

  const isNew = !profile && !isLoading;

  useEffect(() => {
    if (profile) {
      setForm({
        company_name: (profile as any).company_name || "",
        legal_entity_name: (profile as any).legal_entity_name || "",
        tagline: (profile as any).tagline || "",
        address_line_1: (profile as any).address_line_1 || "",
        address_line_2: (profile as any).address_line_2 || "",
        city: (profile as any).city || "",
        state_province: (profile as any).state_province || "",
        postal_code: (profile as any).postal_code || "",
        country: (profile as any).country || "",
        phone: (profile as any).phone || "",
        email: (profile as any).email || "",
        website: (profile as any).website || "",
        tax_id: (profile as any).tax_id || "",
        registration_number: (profile as any).registration_number || "",
        default_currency: (profile as any).default_currency || "USD",
        default_payment_terms: (profile as any).default_payment_terms || "",
        default_delivery_location: (profile as any).default_delivery_location || "",
        signatory_name: (profile as any).signatory_name || "",
        signatory_title: (profile as any).signatory_title || "",
        primary_color: (profile as any).primary_color || "#1A4A7A",
        secondary_color: (profile as any).secondary_color || "#38bdf8",
        logo_url: (profile as any).logo_url || "",
        stamp_url: (profile as any).stamp_url || "",
        footer_disclaimer: (profile as any).footer_disclaimer || "",
        terms_and_conditions: (profile as any).terms_and_conditions || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!form.company_name) { toast.error("Company name required"); return; }
    try {
      const data = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ""));
      if (isNew) {
        await createProfile.mutateAsync(data);
        toast.success("Company profile created — PDF branding is now active");
      } else {
        await updateProfile.mutateAsync(data);
        toast.success("Company profile updated");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Failed to save");
    }
  };

  const f = (key: keyof typeof form, label: string, opts?: { type?: string; span?: boolean; placeholder?: string }) => (
    <div className={opts?.span ? "col-span-2" : ""}>
      <Label className="text-xs font-medium text-gray-700">{label}</Label>
      <Input
        type={opts?.type || "text"}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={opts?.placeholder}
        className="mt-1"
      />
    </div>
  );

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="flex items-center gap-3 mb-2">
        <Building2 className="h-6 w-6 text-[#1A4A7A]" />
        <h1 className="text-2xl font-bold text-gray-900">{isNew ? "Create" : "Edit"} Company Profile</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        This information appears on your branded RFQ PDFs sent to suppliers. Complete all fields for professional documents.
      </p>

      <div className="space-y-5">
        {/* Company details */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Company Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {f("company_name", "Company Name *")}
            {f("legal_entity_name", "Legal Entity Name", { placeholder: "As registered — appears on PDF footer" })}
            {f("tagline", "Tagline", { span: true })}
            {f("email", "Email", { type: "email" })}
            {f("phone", "Phone")}
            {f("website", "Website")}
            {f("tax_id", "Tax ID / TIN")}
            {f("registration_number", "Registration Number (RC)")}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Address</h2>
          <div className="grid grid-cols-2 gap-4">
            {f("address_line_1", "Address Line 1", { span: true })}
            {f("address_line_2", "Address Line 2", { span: true })}
            {f("city", "City")}
            {f("state_province", "State / Province")}
            {f("postal_code", "Postal Code")}
            {f("country", "Country")}
          </div>
        </div>

        {/* Document defaults */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4" /> Document Defaults
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {f("default_currency", "Default Currency", { placeholder: "USD" })}
            {f("default_payment_terms", "Default Payment Terms", { placeholder: "Net 30" })}
            {f("default_delivery_location", "Default Delivery Location", { span: true, placeholder: "e.g. Lagos, Nigeria" })}
            {f("signatory_name", "Signatory Name", { placeholder: "Person signing the RFQ" })}
            {f("signatory_title", "Signatory Title", { placeholder: "e.g. Head of Procurement" })}
          </div>
        </div>

        {/* Branding — used directly in PDF generation */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <Palette className="h-4 w-4" /> PDF Branding
          </h2>
          <p className="text-xs text-gray-500 mb-4">These fields are used directly when generating the branded PDF sent to suppliers.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Logo URL</Label>
              <Input value={form.logo_url} onChange={e => setForm({ ...form, logo_url: e.target.value })} placeholder="https://..." className="mt-1" />
              <p className="text-[11px] text-gray-400 mt-1">Public URL to your company logo (PNG/SVG recommended)</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Stamp / Seal URL</Label>
              <Input value={form.stamp_url} onChange={e => setForm({ ...form, stamp_url: e.target.value })} placeholder="https://..." className="mt-1" />
              <p className="text-[11px] text-gray-400 mt-1">Optional stamp or seal image on the PDF</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Primary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5" />
                <Input value={form.primary_color} onChange={e => setForm({ ...form, primary_color: e.target.value })} className="font-mono text-sm" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Header and accent color on the PDF</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Secondary Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <input type="color" value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} className="h-9 w-12 rounded border border-gray-300 cursor-pointer p-0.5" />
                <Input value={form.secondary_color} onChange={e => setForm({ ...form, secondary_color: e.target.value })} className="font-mono text-sm" />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Highlight and label color on the PDF</p>
            </div>
            {/* Live color preview */}
            <div className="col-span-2 rounded-md overflow-hidden border border-gray-200">
              <div className="px-4 py-2.5 text-white text-xs font-bold" style={{ backgroundColor: form.primary_color }}>
                PREVIEW — {form.company_name || "Your Company"} · PROCUREMENT PLATFORM
              </div>
              <div className="px-4 py-3 bg-white flex items-center justify-between">
                <span className="text-xs font-semibold" style={{ color: form.secondary_color }}>REQUEST FOR QUOTATION</span>
                <span className="text-xs text-gray-400">{form.legal_entity_name || form.company_name || "Legal Entity Name"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Legal text */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Legal Text</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-gray-700">Footer Disclaimer</Label>
              <Textarea value={form.footer_disclaimer} onChange={(e) => setForm({ ...form, footer_disclaimer: e.target.value })} rows={2} className="mt-1" placeholder="e.g. This RFQ does not constitute a purchase order..." />
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-700">Terms & Conditions</Label>
              <Textarea value={form.terms_and_conditions} onChange={(e) => setForm({ ...form, terms_and_conditions: e.target.value })} rows={5} className="mt-1" placeholder="Standard procurement terms..." />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={handleSave} disabled={createProfile.isPending || updateProfile.isPending} className="bg-[#1A4A7A]">
          {(createProfile.isPending || updateProfile.isPending) ? "Saving..." : isNew ? "Create Profile" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
