export interface RfqMetaItem {
  label: string;
  value: string;
}

const SPLIT_LABELS = [
  "Delivery Working Days",
  "Response Deadline",
  "Payment Terms",
  "Delivery Location",
  "Incoterms",
  "Warranty Period",
  "Quote Validity",
  "Currency",
  "VAT Rate",
  "Required Certifications",
  "Technical Query Deadline",
  "Installation Support",
  "Equipment Condition",
  "After-sales Support",
  "Items",
];

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function looksLikeExtractedRfqSummary(description?: string | null) {
  if (!description) return false;
  const normalized = normalizeWhitespace(description);
  const labelHits = SPLIT_LABELS.filter((label) => normalized.includes(`${label}:`)).length;
  return labelHits >= 3 || normalized.length > 220;
}

export function buildRfqMeta(description?: string | null, maxItems = 4): RfqMetaItem[] {
  if (!description) return [];
  const normalized = normalizeWhitespace(description);
  const found: RfqMetaItem[] = [];

  for (const label of SPLIT_LABELS) {
    const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const nextLabels = SPLIT_LABELS
      .filter((candidate) => candidate !== label)
      .map((candidate) => candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|");
    const pattern = nextLabels
      ? new RegExp(`${escaped}:\\s*(.+?)(?=(?:${nextLabels}):|$)`, "i")
      : new RegExp(`${escaped}:\\s*(.+)$`, "i");
    const match = normalized.match(pattern);
    if (!match?.[1]) continue;
    found.push({
      label,
      value: match[1].trim(),
    });
    if (found.length >= maxItems) break;
  }

  return found;
}

export function compactRfqDescription(description?: string | null) {
  if (!description) return null;
  if (looksLikeExtractedRfqSummary(description)) return null;
  const normalized = normalizeWhitespace(description);
  return normalized.length > 160 ? `${normalized.slice(0, 157)}...` : normalized;
}
