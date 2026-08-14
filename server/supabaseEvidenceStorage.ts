type SharedEvidenceRow = {
  id: number | string;
  indicator_id: number;
  title: string;
  description: string;
  file_key: string;
  file_name: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  created_at: string;
};

export type SharedEvidence = {
  id: number;
  indicatorId: number;
  title: string;
  description: string;
  fileKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: Date;
  downloadUrl: string | null;
};

type EvidenceUpload = {
  indicatorId: number;
  fileName: string;
  fileType: string;
  fileSize: number;
  title: string;
  description: string;
  uploadedBy: string;
  buffer: Buffer;
};

function config() {
  const projectUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_BUCKET;
  if (!projectUrl || !serviceRoleKey || !bucket) {
    throw new Error("إعدادات التخزين المشترك غير مكتملة");
  }
  return { projectUrl, serviceRoleKey, bucket };
}

function encodedPath(fileKey: string) {
  return fileKey.split("/").map(encodeURIComponent).join("/");
}

function headers(contentType?: string): HeadersInit {
  const { serviceRoleKey } = config();
  return {
    Authorization: `Bearer ${serviceRoleKey}`,
    apikey: serviceRoleKey,
    ...(contentType ? { "Content-Type": contentType } : {}),
  };
}

async function ensureSuccess(response: Response, action: string) {
  if (response.ok) return;
  const details = await response.text().catch(() => "");
  throw new Error(`${action} تعذر: ${details || response.statusText}`);
}

async function signedUrl(fileKey: string): Promise<string> {
  const { projectUrl, bucket } = config();
  const storageUrl = `${projectUrl}/storage/v1`;
  const response = await fetch(`${storageUrl}/object/sign/${encodeURIComponent(bucket)}/${encodedPath(fileKey)}`, {
    method: "POST",
    headers: headers("application/json"),
    body: JSON.stringify({ expiresIn: 3600 }),
  });
  await ensureSuccess(response, "إنشاء رابط تنزيل الشاهد");
  const result = await response.json() as { signedURL?: string; signedUrl?: string };
  const value = result.signedURL ?? result.signedUrl;
  if (!value) throw new Error("لم يُنشأ رابط تنزيل للشاهد");
  return value.startsWith("http") ? value : `${storageUrl}${value}`;
}

function mapRow(row: SharedEvidenceRow, downloadUrl: string | null): SharedEvidence {
  return {
    id: Number(row.id), indicatorId: row.indicator_id, title: row.title,
    description: row.description, fileKey: row.file_key, fileName: row.file_name,
    fileType: row.file_type, fileSize: Number(row.file_size), uploadedBy: row.uploaded_by,
    createdAt: new Date(row.created_at), downloadUrl,
  };
}

export async function listSharedEvidences(indicatorId: number): Promise<SharedEvidence[]> {
  const { projectUrl } = config();
  const response = await fetch(`${projectUrl}/rest/v1/evidences?indicator_id=eq.${indicatorId}&order=created_at.asc`, { headers: headers() });
  await ensureSuccess(response, "قراءة الشواهد المشتركة");
  const rows = await response.json() as SharedEvidenceRow[];
  return Promise.all(rows.map(async (row) => {
    try { return mapRow(row, await signedUrl(row.file_key)); }
    catch { return mapRow(row, null); }
  }));
}

export async function uploadSharedEvidence(input: EvidenceUpload) {
  const { projectUrl, bucket } = config();
  const extension = input.fileName.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "bin";
  const fileKey = `evidences/${input.indicatorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const storageUrl = `${projectUrl}/storage/v1`;
  const fileResponse = await fetch(`${storageUrl}/object/${encodeURIComponent(bucket)}/${encodedPath(fileKey)}`, {
    method: "POST",
    headers: { ...headers(input.fileType), "x-upsert": "false" },
    body: new Uint8Array(input.buffer),
  });
  await ensureSuccess(fileResponse, "رفع ملف الشاهد");
  const metadataResponse = await fetch(`${projectUrl}/rest/v1/evidences`, {
    method: "POST",
    headers: { ...headers("application/json"), Prefer: "return=representation" },
    body: JSON.stringify({ indicator_id: input.indicatorId, title: input.title, description: input.description, file_key: fileKey, file_name: input.fileName, file_type: input.fileType, file_size: input.fileSize, uploaded_by: input.uploadedBy }),
  });
  try { await ensureSuccess(metadataResponse, "تسجيل بيانات الشاهد"); }
  catch (error) {
    await fetch(`${storageUrl}/object/${encodeURIComponent(bucket)}/${encodedPath(fileKey)}`, { method: "DELETE", headers: headers() });
    throw error;
  }
  const [row] = await metadataResponse.json() as SharedEvidenceRow[];
  if (!row) throw new Error("لم يُنشأ سجل الشاهد");
  return { id: Number(row.id), key: fileKey };
}

export async function deleteSharedEvidence(id: number) {
  const { projectUrl, bucket } = config();
  const rowResponse = await fetch(`${projectUrl}/rest/v1/evidences?id=eq.${id}&select=*`, { headers: headers() });
  await ensureSuccess(rowResponse, "قراءة بيانات الشاهد");
  const [row] = await rowResponse.json() as SharedEvidenceRow[];
  if (!row) return { success: true };
  const storageUrl = `${projectUrl}/storage/v1`;
  const fileResponse = await fetch(`${storageUrl}/object/${encodeURIComponent(bucket)}/${encodedPath(row.file_key)}`, { method: "DELETE", headers: headers() });
  await ensureSuccess(fileResponse, "حذف ملف الشاهد");
  const deleteResponse = await fetch(`${projectUrl}/rest/v1/evidences?id=eq.${id}`, { method: "DELETE", headers: headers() });
  await ensureSuccess(deleteResponse, "حذف سجل الشاهد");
  return { success: true };
}
