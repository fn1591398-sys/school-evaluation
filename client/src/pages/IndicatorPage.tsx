import { useState, useRef } from "react";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const FILE_ICONS: Record<string, string> = {
  "application/pdf": "📄",
  "image/jpeg": "🖼️",
  "image/png": "🖼️",
  "image/gif": "🖼️",
  "image/webp": "🖼️",
  "video/mp4": "🎬",
  "video/quicktime": "🎬",
  "audio/mpeg": "🎵",
  "audio/wav": "🎵",
  "application/msword": "📝",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "📝",
  "application/vnd.ms-excel": "📊",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "📊",
  "application/vnd.ms-powerpoint": "📋",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "📋",
};

function getFileIcon(fileType: string): string {
  return FILE_ICONS[fileType] || "📎";
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function IndicatorPage() {
  const params = useParams<{ id: string }>();
  const indicatorId = parseInt(params.id || "0");

  const { data: indicator } = trpc.indicators.getById.useQuery({ id: indicatorId });
  const { data: evidences, refetch, isLoading: loadingEvidences } = trpc.evidences.byIndicator.useQuery({ indicatorId });

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.evidences.upload.useMutation({
    onSuccess: () => {
      toast.success("تم رفع الشاهد بنجاح!");
      setShowUploadForm(false);
      setTitle("");
      setDescription("");
      setUploadedBy("");
      setSelectedFile(null);
      setUploading(false);
      refetch();
    },
    onError: (err) => {
      toast.error(`فشل الرفع: ${err.message}`);
      setUploading(false);
    },
  });

  const deleteMutation = trpc.evidences.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الشاهد");
      refetch();
    },
    onError: () => toast.error("فشل الحذف"),
  });

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  const handleUpload = async () => {
    if (!selectedFile || !title.trim()) {
      toast.error("يرجى اختيار ملف وإدخال العنوان");
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error("حجم الملف يتجاوز الحد المسموح (20MB)");
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onerror = () => {
        toast.error("فشل قراءة الملف");
        setUploading(false);
      };
      reader.onload = async (e) => {
        try {
          const base64 = (e.target?.result as string).split(",")[1];
          await uploadMutation.mutateAsync({
            indicatorId,
            fileName: selectedFile.name,
            fileType: selectedFile.type || "application/octet-stream",
            fileSize: selectedFile.size,
            title: title.trim(),
            description: description.trim(),
            uploadedBy: uploadedBy.trim() || "مجهول",
            fileData: base64,
          });
        } catch {
          setUploading(false);
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setUploading(false);
    }
  };

  const evidenceCount = evidences?.length ?? 0;
  const isComplete = evidenceCount >= 8;

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Cairo', 'Tajawal', sans-serif" }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-amber-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/">
            <button className="flex items-center gap-2 text-blue-700 hover:text-amber-600 transition-colors text-sm font-medium">
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              الرئيسية
            </button>
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500 truncate max-w-xs">الشواهد</span>
        </div>
      </header>

      {/* Indicator Hero */}
      <section
        className="py-8 px-4"
        style={{ background: "linear-gradient(135deg, #0f2557 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #b45309, #f59e0b)" }}>
              📌
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded" dir="ltr">
                  {indicator?.code ?? "..."}
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isComplete ? "bg-green-400/20 text-green-300" : "bg-amber-400/20 text-amber-300"}`}>
                  {evidenceCount} / 8+ شاهد {isComplete ? "✓" : ""}
                </span>
              </div>
              <p className="text-white text-base md:text-lg font-medium leading-relaxed">
                {indicator?.text ?? "جارٍ التحميل..."}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-200 mb-1">
              <span>تقدم الشواهد</span>
              <span>{Math.min(evidenceCount, 8)} / 8</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((evidenceCount / 8) * 100, 100)}%`,
                  background: isComplete ? "#22c55e" : "linear-gradient(90deg, #f59e0b, #fbbf24)",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4" style={{ background: "oklch(0.97 0.015 80)" }}>
        <div className="max-w-4xl mx-auto">
          {/* Upload Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <span className="w-1 h-6 rounded-full bg-amber-500 inline-block" />
              الشواهد والأدلة
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${isComplete ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                {evidenceCount} شاهد
              </span>
            </h2>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-lg text-white transition-all"
              style={{ background: showUploadForm ? "#6b7280" : "linear-gradient(135deg, #1e3a8a, #2563eb)" }}
            >
              {showUploadForm ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  إلغاء
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  رفع شاهد جديد
                </>
              )}
            </button>
          </div>

          {/* Upload Form */}
          {showUploadForm && (
            <div className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 mb-6 animate-pulse-once">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                <span>📤</span> رفع شاهد جديد
              </h3>

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center mb-4 cursor-pointer transition-all ${dragOver ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-amber-400 hover:bg-amber-50"}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.mp3,.wav"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">{getFileIcon(selectedFile.type)}</span>
                    <p className="font-bold text-blue-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="text-xs text-red-500 hover:text-red-700 mt-1"
                    >
                      إزالة الملف
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <span className="text-4xl">📁</span>
                    <p className="font-medium">اسحب الملف هنا أو انقر للاختيار</p>
                    <p className="text-xs">PDF، Word، Excel، PowerPoint، صور، فيديو، صوت</p>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">عنوان الشاهد *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="أدخل عنواناً وصفياً للشاهد"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">اسم الرافع</label>
                  <input
                    type="text"
                    value={uploadedBy}
                    onChange={(e) => setUploadedBy(e.target.value)}
                    placeholder="اسم من يرفع الشاهد"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">وصف الشاهد</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف مختصر للشاهد وكيف يدعم المؤشر"
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-none"
                />
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || !selectedFile || !title.trim()}
                className="w-full py-3 rounded-lg text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #1e3a8a, #2563eb)" }}
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    جارٍ الرفع...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    رفع الشاهد
                  </>
                )}
              </button>
            </div>
          )}

          {/* Evidences List */}
          {loadingEvidences ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
            </div>
          ) : evidenceCount === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <span className="text-5xl block mb-3">📂</span>
              <p className="text-gray-500 font-medium">لا توجد شواهد مرفوعة بعد</p>
              <p className="text-gray-400 text-sm mt-1">ارفع 8 شواهد أو أكثر لإكمال هذا المؤشر</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(evidences ?? []).map((ev, idx) => (
                <div key={ev.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:border-amber-200 transition-all p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0 bg-gray-50 border border-gray-100">
                      {getFileIcon(ev.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-blue-900 text-sm">{ev.title}</p>
                          {ev.description && (
                            <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{ev.description}</p>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-400 flex-shrink-0">#{idx + 1}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <span className="text-xs text-gray-400">{ev.fileName}</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{formatFileSize(ev.fileSize)}</span>
                        {ev.uploadedBy && (
                          <>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400">بواسطة: {ev.uploadedBy}</span>
                          </>
                        )}
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">{formatDate(ev.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {ev.downloadUrl && (
                        <a
                          href={ev.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          تحميل
                        </a>
                      )}
                      <button
                        onClick={() => {
                          if (confirm("هل تريد حذف هذا الشاهد؟")) {
                            deleteMutation.mutate({ id: ev.id });
                          }
                        }}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Completion Badge */}
          {isComplete && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-bold text-green-800">اكتمل المؤشر!</p>
                <p className="text-sm text-green-600">تم رفع {evidenceCount} شاهد — تم تجاوز الحد المطلوب (8 شواهد)</p>
              </div>
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
