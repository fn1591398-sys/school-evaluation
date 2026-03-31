import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function DomainPage() {
  const params = useParams<{ id: string }>();
  const domainId = parseInt(params.id || "0");

  const { data: domain } = trpc.domains.getById.useQuery({ id: domainId });
  const { data: criteriaList, isLoading } = trpc.criteria.byDomain.useQuery({ domainId });

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 text-blue-700 hover:text-amber-600 transition-colors text-sm font-medium">
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              الرئيسية
            </button>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-bold text-blue-900">{domain?.name ?? "..."}</span>
        </div>
      </header>

      {/* Domain Hero */}
      <section
        className="py-10 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #0f2557 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1 rounded-full mb-4">
            مجال التقويم الذاتي
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-3">{domain?.name ?? "..."}</h1>
          {domain?.description && (
            <p className="text-blue-200 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">{domain.description}</p>
          )}
        </div>
      </section>

      {/* Criteria List */}
      <main className="flex-1 py-10 px-4" style={{ background: "oklch(0.97 0.015 80)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-amber-500 inline-block" />
            معايير المجال
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {(criteriaList ?? []).map((criterion, idx) => (
                <Link key={criterion.id} href={`/criteria/${criterion.id}`}>
                  <div
                    className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-4 p-5">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-amber-600 font-semibold mb-0.5">{criterion.code}</div>
                        <div className="text-base font-bold text-blue-900 group-hover:text-blue-700">{criterion.name}</div>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-amber-500 rotate-180 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 text-center text-xs text-gray-400 border-t border-amber-100 bg-white">
        ابتدائية ابن الجوزي للطفولة المبكرة برابغ — التقويم الذاتي
      </footer>
    </div>
  );
}
