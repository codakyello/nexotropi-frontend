import React from "react";

type Report = {
    id: string;
    title: string;
    cadence: "quarterly" | "monthly" | "weekly";
    generatedAt: string; // e.g., "2 days ago"
    savings: string;     // e.g., "$450K saved"
    negotiations: number;
};

const reports: Report[] = Array.from({ length: 8 }).map((_, i) => ({
    id: `r-${i + 1}`,
    title: "Q4 2024 Procurement Analysis",
    cadence: "quarterly",
    generatedAt: "2 days ago",
    savings: "$450K saved",
    negotiations: 45,
}));


const DownloadIcon = () => (
    <svg className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
);

const ReportCard = ({ report }: { report: Report }) => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4">
        <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                {/* <PaperIcon /> */}
                <img src="/paper.svg" />
            </span>

            <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-800">
                    {report.title}
                </h3>

                <p className="text-sm text-slate-500">
                    <span className="capitalize">{report.cadence}</span>
                    <span className="mx-1.5">·</span>
                    <span>Generated {report.generatedAt}</span>
                </p>
            </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="text-right">
                <div className="text-sm font-semibold text-emerald-600">
                    {report.savings}
                </div>
                <div className="text-sm text-slate-500">
                    {report.negotiations} negotiations
                </div>
            </div>

            <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50"
                aria-label="Download report"
                title="Download"
            >
                <DownloadIcon />
            </button>
        </div>
    </div>
);

const ReportMetrics: React.FC = () => {
    return (
        <section className="mx-auto max-w-7xl px-4 pb-8 pt-6">
            <header className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Generated Reports</h2>
                <p className="mt-1 text-slate-500">
                    Comprehensive reports and documentation
                </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                {reports.map((r) => (
                    <ReportCard key={r.id} report={r} />
                ))}
            </div>
        </section>
    );
};

export default ReportMetrics;
