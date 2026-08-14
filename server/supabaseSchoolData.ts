type R = Record<string, any>;

function cfg() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("إعدادات قاعدة البيانات الموحدة غير مكتملة");
  return { url, key };
}

async function rows(table: string, filter = "") {
  const { url, key } = cfg();
  const r = await fetch(`${url}/rest/v1/${table}?select=*${filter}`, { headers: { Authorization: `Bearer ${key}`, apikey: key } });
  if (!r.ok) throw new Error(`تعذر قراءة بيانات التقويم الموحدة: ${await r.text()}`);
  return r.json() as Promise<R[]>;
}

const domain = (r: R) => ({ id: Number(r.id), code: r.code, name: r.name, description: r.description, orderIndex: Number(r.order_index) });
const criteria = (r: R) => ({ id: Number(r.id), domainId: Number(r.domain_id), code: r.code, name: r.name, orderIndex: Number(r.order_index) });
const indicator = (r: R) => ({ id: Number(r.id), criteriaId: Number(r.criteria_id), code: r.code, text: r.text, orderIndex: Number(r.order_index), isPrivate: Number(r.is_private) });

export const listSharedDomains = async () => (await rows("domains", "&order=order_index.asc")).map(domain);
export const getSharedDomain = async (id: number) => { const [r] = await rows("domains", `&id=eq.${id}`); return r ? domain(r) : null; };
export const listSharedCriteria = async (id: number) => (await rows("criteria", `&domain_id=eq.${id}&order=order_index.asc`)).map(criteria);
export const getSharedCriteria = async (id: number) => { const [r] = await rows("criteria", `&id=eq.${id}`); return r ? criteria(r) : null; };
export const listSharedIndicators = async (id: number) => (await rows("indicators", `&criteria_id=eq.${id}&order=order_index.asc`)).map(indicator);
export const getSharedIndicator = async (id: number) => { const [r] = await rows("indicators", `&id=eq.${id}`); return r ? indicator(r) : null; };
