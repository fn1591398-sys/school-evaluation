import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const DOMAIN_ICONS = ["🏫", "📚", "🎯", "🏗️"];
const DOMAIN_COLORS = [
  "from-blue-800 to-blue-600",
  "from-blue-700 to-blue-500",
  "from-amber-700 to-amber-500",
  "from-blue-900 to-blue-700",
];
const DOMAIN_BORDER = [
  "border-blue-700",
  "border-blue-500",
  "border-amber-500",
  "border-blue-900",
];

export default function Home() {
  const { data: domainsList, isLoading } = trpc.domains.list.useQuery();

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center rounded-xl p-2"
              style={{ background: "linear-gradient(135deg, #0f2557, #1e3a8a)", width: 64, height: 64 }}>
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663491308597/Hqj5hFEzvtuPEL7dFjnaUS/moe-logo-new-white_4692fc71.png" alt="وزارة التعليم" className="object-contain" style={{ width: 52, height: 52 }} />
            </div>
            <div>
              <div className="text-xs text-amber-600 font-semibold">التقويم الذاتي</div>
              <div className="text-sm font-bold text-blue-900 leading-tight">ابتدائية ابن الجوزي للطفولة المبكرة برابغ</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-500">
            <span className="bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-full font-medium">
              هيئة تقويم التعليم والتدريب
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-16 px-4"
        style={{
          background: "linear-gradient(135deg, #0f2557 0%, #1e3a8a 50%, #1d4ed8 100%)",
        }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)", transform: "translate(-30%, -30%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #f59e0b, transparent)", transform: "translate(30%, 30%)" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* البرنامج الوطني - بدون شعار */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur border border-white/20 rounded-full px-5 py-2 mb-4 text-white text-sm font-medium">
            <span>البرنامج الوطني للتقويم والاعتماد المدرسي</span>
          </div>
          {/* شعار هيئة تقويم التعليم والتدريب */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-3">
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663491308597/Hqj5hFEzvtuPEL7dFjnaUS/etec-logo-transparent_b1620fbd.png" alt="هيئة تقويم التعليم والتدريب" className="object-contain" style={{ width: 56, height: 56 }} />
              <div className="text-right">
                <div className="text-white font-bold text-sm">هيئة تقويم التعليم والتدريب</div>
                <div className="text-white/70 text-xs">Education &amp; Training Evaluation Commission</div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            التقويم الذاتي
          </h1>
          <h2 className="text-xl md:text-2xl font-bold mb-2" style={{ color: "#fbbf24" }}>
            ابتدائية ابن الجوزي للطفولة المبكرة برابغ
          </h2>
          <p className="text-blue-200 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            منصة متكاملة لرفع الشواهد والأدلة وفق معايير هيئة تقويم التعليم والتدريب
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { label: "مجالات", value: "4" },
              { label: "معايير", value: "11" },
              { label: "مؤشراً", value: "50+" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur border border-white/20 rounded-xl px-6 py-3 text-center">
                <div className="text-2xl font-extrabold text-amber-400">{stat.value}</div>
                <div className="text-white/80 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Info Bar */}
      <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-lg">👩‍💼</span>
            <span className="font-medium">مديرة المدرسة:</span>
            <span className="font-bold">مشاعل اللهيبي</span>
          </div>
          <div className="w-px h-5 bg-amber-300 hidden md:block" />
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-lg">👩‍💻</span>
            <span className="font-medium">المساعد الإداري:</span>
            <span className="font-bold">فاطمة اليوبي</span>
          </div>
        </div>
      </div>

      {/* Domains Section */}
      <main className="flex-1 py-12 px-4" style={{ background: "oklch(0.97 0.015 80)" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-blue-900 mb-2">مجالات التقويم الذاتي</h3>
            <p className="text-gray-500 text-sm">اختر المجال للاطلاع على معاييره ومؤشراته ورفع الشواهد</p>
            <div className="w-20 h-1 mx-auto mt-3 rounded-full" style={{ background: "linear-gradient(90deg, #1e3a8a, #f59e0b)" }} />
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(domainsList ?? []).map((domain, idx) => (
                <Link key={domain.id} href={`/domain/${domain.id}`}>
                  <div
                    className={`group relative bg-white rounded-2xl shadow-md border-2 ${DOMAIN_BORDER[idx % 4]} hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden`}
                    style={{ transform: "translateY(0)", transition: "transform 0.25s, box-shadow 0.25s" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
                  >
                    {/* Top gradient bar */}
                    <div className={`h-2 bg-gradient-to-r ${DOMAIN_COLORS[idx % 4]}`} />

                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-3xl bg-gradient-to-br ${DOMAIN_COLORS[idx % 4]} shadow-md flex-shrink-0`}>
                          {DOMAIN_ICONS[idx % 4]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ background: idx % 2 === 0 ? "#1e3a8a" : "#b45309" }}>
                              المجال {["الأول", "الثاني", "الثالث", "الرابع"][idx]}
                            </span>
                          </div>
                          <h4 className="text-lg font-extrabold text-blue-900 mb-2">{domain.name}</h4>
                          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{domain.description}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">انقر للاستعراض والرفع</span>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 group-hover:text-amber-600 transition-colors">
                          استعراض
                          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-sm text-gray-500 border-t border-amber-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="font-medium text-blue-900 mb-1">ابتدائية ابن الجوزي للطفولة المبكرة برابغ</p>
          <p>التقويم الذاتي — وفق معايير هيئة تقويم التعليم والتدريب</p>
        </div>
      </footer>
    </div>
  );
}
