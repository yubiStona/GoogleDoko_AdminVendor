import { useEffect, useState } from "react";
import { Archive, Eye, FilePlus2, Send } from "lucide-react";
import { api, type AdminCmsPage } from "../../api/client";
import { useAccount } from "../../context/AccountContext";
import { AdminHeader } from "./AdminPages";

const emptyContent = {
  title: "", description: "", body: "", heroImage: "", imageAlt: "",
  seoTitle: "", metaDescription: "", socialTitle: "", socialDescription: "", ogImage: "",
};
const fields: { key: keyof typeof emptyContent; label: string; long?: boolean }[] = [
  { key: "title", label: "Page title" }, { key: "description", label: "Short description", long: true },
  { key: "body", label: "Page content (plain text paragraphs; HTML and scripts are not accepted)", long: true },
  { key: "heroImage", label: "Hero image URL" }, { key: "imageAlt", label: "Image alt text" },
  { key: "seoTitle", label: "SEO title" }, { key: "metaDescription", label: "Meta description", long: true },
  { key: "socialTitle", label: "Social sharing title" }, { key: "socialDescription", label: "Social sharing description", long: true },
  { key: "ogImage", label: "Open Graph image URL" },
];

export default function AdminPagesManager() {
  const { showToast } = useAccount();
  const [pages, setPages] = useState<AdminCmsPage[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState<Record<string, string>>(emptyContent);
  const [navigationVisible, setNavigationVisible] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load(preferredId = selectedId) {
    setLoading(true); setError("");
    try {
      const list = await api.adminCmsPages(); setPages(list);
      if (preferredId) choose(list.find((page) => page.id === preferredId) || null);
      else if (list.length) choose(list[0]);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load website pages"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(null); }, []);

  function choose(page: AdminCmsPage | null) {
    setSelectedId(page?.id || null);
    if (!page) { setSlug(""); setContent({ ...emptyContent }); setNavigationVisible(false); setDisplayOrder(0); return; }
    setSlug(page.draftSlug || page.slug);
    setContent({ ...emptyContent, ...(page.draftContent || page.publishedContent || {}) });
    setNavigationVisible(Boolean(page.navigationVisible)); setDisplayOrder(page.displayOrder);
  }
  function newPage() { choose(null); setError(""); }

  async function save(publish: boolean) {
    if (!slug.trim() || !content.title?.trim() || !content.description?.trim()) { setError("Enter a URL slug, page title, and description."); return; }
    setSaving(true); setError("");
    try {
      const saved = await api.adminSaveCmsPageDraft(selectedId, { slug, content, navigationVisible, displayOrder });
      if (publish) await api.adminPublishCmsPage(saved.id);
      showToast(publish ? "Page published" : "Page draft saved");
      await load(saved.id);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save page"); }
    finally { setSaving(false); }
  }
  async function uploadHero(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    try { const result = await api.uploadImage(file); setContent((current) => ({ ...current, heroImage: result.url })); showToast("Page image uploaded. Save the draft to keep it."); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not upload image"); }
    finally { setUploading(false); }
  }
  async function setStatus(status: "draft" | "archived") {
    if (!selectedId) return;
    if (!window.confirm(status === "archived" ? "Archive this page? It will no longer be visible publicly." : "Unpublish this page? Customers will no longer be able to view it.")) return;
    setSaving(true);
    try { await api.adminSetCmsPageStatus(selectedId, status); showToast(status === "archived" ? "Page archived" : "Page unpublished"); await load(selectedId); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not update page status"); }
    finally { setSaving(false); }
  }

  return <div className="vd-settings">
    <AdminHeader title="Pages Management" subtitle="Create and publish informational pages using structured, safe content fields." refresh={() => void load()} busy={loading} actions={<button type="button" className="vd-add-btn" onClick={newPage}><FilePlus2 size={16} />New page</button>} />
    {error && <p role="alert" className="auth-error">{error}</p>}
    {loading ? <p>Loading pages…</p> : <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, .5fr) minmax(0, 1.5fr)", gap: 18, alignItems: "start" }}>
      <aside className="vd-card" style={{ padding: 12 }}><strong style={{ display: "block", padding: 8 }}>Pages</strong>
        {!pages.length && <p style={{ padding: 8, color: "#667f70" }}>No pages yet. Create an informational page to begin.</p>}
        {pages.map((page) => <button key={page.id} type="button" onClick={() => choose(page)} style={{ width: "100%", textAlign: "left", padding: 12, border: 0, borderRadius: 10, background: selectedId === page.id ? "#e7f5eb" : "transparent", cursor: "pointer" }}><strong>{(page.draftContent || page.publishedContent)?.title || page.slug}</strong><small style={{ display: "block", color: "#667f70" }}>/{page.draftSlug || page.slug} · {page.status}</small></button>)}
      </aside>
      <div style={{ display: "grid", gap: 18 }}>
        <section className="vd-card auth-form">
          <label className="auth-field"><span>URL slug</span><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="about-us" /></label>
          {fields.map(({ key, label, long }) => <label className="auth-field" key={key}><span>{label}</span>{long ? <textarea rows={key === "body" ? 7 : 3} value={content[key] || ""} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} /> : <input value={content[key] || ""} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} />}{key === "heroImage" && <><small>Upload JPEG, PNG, or WebP up to 5 MB.</small><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { void uploadHero(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></>}</label>)}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, margin: "14px 0" }}><label><input type="checkbox" checked={navigationVisible} onChange={(event) => setNavigationVisible(event.target.checked)} /> Show in navigation</label><label>Display order <input type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(Number(event.target.value))} style={{ width: 70 }} /></label></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><button type="button" className="vd-add-btn" disabled={saving || uploading} onClick={() => void save(false)}>Save draft</button><button type="button" className="auth-btn" disabled={saving || uploading} onClick={() => void save(true)}><Send size={16} />{saving ? "Saving…" : "Publish"}</button>{selectedId && <><button type="button" className="vd-add-btn" disabled={saving} onClick={() => void setStatus("draft")}>Unpublish</button><button type="button" className="vd-add-btn" disabled={saving} onClick={() => void setStatus("archived")}><Archive size={16} />Archive</button></>}</div>
        </section>
        <section className="vd-card"><h2 style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 17 }}><Eye size={17} />Draft preview</h2><small>Public URL: /pages/{slug || "your-slug"}</small><h1>{content.title || "Page title"}</h1><p>{content.description || "Page description"}</p>{content.heroImage && <img src={content.heroImage} alt={content.imageAlt || ""} style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 12 }} />}<p style={{ whiteSpace: "pre-wrap" }}>{content.body || "Your page content will appear here."}</p></section>
      </div>
    </div>}
  </div>;
}
