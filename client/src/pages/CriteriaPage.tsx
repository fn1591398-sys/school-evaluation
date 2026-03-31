import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";

export default function CriteriaPage() {
  const params = useParams<{ id: string }>();
  const criteriaId = parseInt(params.id || "0");

  const { data: criteriaInfo } = trpc.criteria.getById.useQuery({ id: criteriaId });
  const { data: indicators, isLoading } = trpc.indicators.byCriteria.useQuery({ criteriaId });

  // ترتيب المؤشرات حسب orderIndex ثم id لضمان الترتيب الصحيح
  const sortedIndicators = [...(indicators ?? [])].sort((a, b) => {
    if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
    return a.id - b.id;
  });

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
          <span className="text-sm font-bold text-blue-900 truncate max-w-xs">{criteriaInfo?.name ?? "المؤشرات"}</span>
        </div>
      </header>

      {/* Hero */}
      <section
        className="py-10 px-4 text-center"
        style={{ background: "linear-gradient(135deg, #0f2557 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
      >
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold px-4 py-1 rounded-full mb-4">
            مؤشرات المعيار
          </div>
          {criteriaInfo?.code && (
            <div className="text-amber-300 text-sm font-mono font-bold mb-2" dir="ltr">
              {criteriaInfo.code}
            </div>
          )}
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            {criteriaInfo?.name ?? "مؤشرات المعيار"}
          </h1>
          <p className="text-blue-200 text-sm mt-2">
            اختر المؤشر لرفع الشواهد والأدلة
            {sortedIndicators.length > 0 && (
              <span className="mr-2 bg-white/10 px-2 py-0.5 rounded-full text-xs">
                {sortedIndicators.length} مؤشر
              </span>
            )}
          </p>
        </div>
      </section>

      {/* Indicators */}
      <main className="flex-1 py-10 px-4" style={{ background: "oklch(0.97 0.015 80)" }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-blue-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 rounded-full bg-amber-500 inline-block" />
            المؤشرات
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
            </div>
          ) : sortedIndicators.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">📋</div>
              <p>لا توجد مؤشرات لهذا المعيار</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedIndicators.map((indicator, idx) => (
                <Link key={indicator.id} href={`/indicator/${indicator.id}`}>
                  <div className="group bg-white rounded-xl shadow-sm border border-gray-100 hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer p-5">
                    <div className="flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0 mt-0.5"
                        style={{ background: "linear-gradient(135deg, #b45309, #f59e0b)" }}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded" dir="ltr">
                            {indicator.code}
                          </span>
                          {indicator.isPrivate === 1 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 border border-orange-200">
                              ★ خاص بالمدارس الأهلية
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed group-hover:text-blue-800">{indicator.text}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        <EvidenceCount indicatorId={indicator.id} />
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-amber-500 rotate-180 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="py-4 px-4 text-center text-xs text-gray-400 border-t border-amber-100 bg-white">
        ابتدائية ابن الجوزي للطفولة المبكرة برابغ — التقويم الذاتي
      </footer>
    </div>
  );
}

function EvidenceCount({ indicatorId }: { indicatorId: number }) {
  const { data: evidences } = trpc.evidences.byIndicator.useQuery({ indicatorId });
  const count = evidences?.length ?? 0;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${count > 0 ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-400"}`}>
      {count} شاهد
    </span>
  );
}
