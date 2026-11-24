import { useEffect, useState } from "react";
import { Archive, Eye, FilePlus2, Send, Trash2 } from "lucide-react";
import { api, getAdminMediaUrl, type AdminCmsCategory } from "../../api/client";
import { useAccount } from "../../context/AccountContext";
import { AdminHeader } from "./AdminPages";
import WebsiteManagementNav from "./WebsiteManagementNav";

const blank = { name: "", description: "", image: "", seoTitle: "", metaDescription: "", unit: "piece", theme: "green", icon: "tag", heroEyebrow: "", heroTitle: "" };
const groupLabel: Record<AdminCmsCategory["group"], string> = { product: "Shop by Product", place: "Shop by Place", lifestyle: "Shop by Lifestyle" };

export default function AdminCategoriesManager() {
  const { showToast } = useAccount();
  const [rows, setRows] = useState<AdminCmsCategory[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [group, setGroup] = useState<AdminCmsCategory["group"]>("product");
  const [content, setContent] = useState<Record<string, string>>(blank);
  const [parentId, setParentId] = useState<number | null>(null);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [reassignToId, setReassignToId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function load(preferred = selectedId) {
    setLoading(true); setError("");
    try {
      const list = await api.adminCmsCategories(); setRows(list);
      if (preferred) choose(list.find((row) => row.id === preferred) || null);
      else if (list.length) choose(list[0]);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load categories"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(null); }, []);
  function choose(row: AdminCmsCategory | null) {
    setSelectedId(row?.id || null);
    if (!row) { setGroup("product"); setContent({ ...blank }); setParentId(null); setDisplayOrder(0); setReassignToId(undefined); return; }
    setGroup(row.group); setContent({ ...blank, ...(row.draftContent || row.content || row.publishedContent || {}) });
    setParentId(row.parentId); setDisplayOrder(row.displayOrder); setReassignToId(undefined);
  }
  async function upload(file?: File) {
    if (!file) return;
    setUploading(true);
    try { const result = await api.uploadImage(file); setContent((current) => ({ ...current, image: result.url })); showToast("Category image uploaded. Save the draft to keep it."); }
    catch (err) { setError(err instanceof Error ? err.message : "Image upload failed"); }
    finally { setUploading(false); }
  }
  async function save(publish: boolean) {
    if (!content.name.trim()) { setError("Category name is required."); return; }
    setSaving(true); setError("");
    try {
      const saved = await api.adminSaveCmsCategoryDraft(selectedId, { group, content, parentId, displayOrder });
      if (publish) await api.adminPublishCmsCategory(saved.id);
      showToast(publish ? "Category published" : "Category draft saved"); await load(saved.id);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save category"); }
    finally { setSaving(false); }
  }
  async function archive() {
    if (!selectedId || !window.confirm("Archive this category? It will be hidden from public category listings.")) return;
    setSaving(true);
    try { await api.adminArchiveCmsCategory(selectedId); showToast("Category archived"); await load(selectedId); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not archive category"); }
    finally { setSaving(false); }
  }
  async function remove() {
    if (!selectedId) return;
    const selected = rows.find((row) => row.id === selectedId);
    if (!window.confirm(`Delete “${content.name}”? ${selected?.productCount || 0} products and ${selected?.childCount || 0} child categories depend on it.`)) return;
    setSaving(true); setError("");
    try { await api.adminDeleteCmsCategory(selectedId, reassignToId); showToast("Category deleted and references reassigned"); choose(null); await load(null); }
    catch (err) {
      const message = err instanceof Error ? err.message : "Could not delete category";
      setError(message.includes("CATEGORY_IN_USE") ? "This category is in use. Select a published category in the same group to reassign its products and child categories, or archive it." : message);
    } finally { setSaving(false); }
  }
  const selected = rows.find((row) => row.id === selectedId);
  const groupRows = rows.filter((row) => row.group === group && row.id !== selectedId && row.status === "published");

  return <div className="vd-settings">
    <AdminHeader title="Categories Management" subtitle="Manage product, place, and lifestyle categories with protected product relationships." refresh={() => void load()} busy={loading} actions={<button type="button" className="vd-add-btn" onClick={() => choose(null)}><FilePlus2 size={16} />New category</button>} />
    <WebsiteManagementNav />
    {error && <p role="alert" className="auth-error">{error}</p>}
    {loading ? <p>Loading categories…</p> : <div style={{ display: "grid", gridTemplateColumns: "minmax(190px, .55fr) minmax(0, 1.45fr)", gap: 18, alignItems: "start" }}>
      <aside className="vd-card" style={{ padding: 12 }}><strong style={{ display: "block", padding: 8 }}>Categories</strong>{!rows.length && <p style={{ color: "#667f70", padding: 8 }}>No CMS categories yet. Existing product categories remain available while you add managed entries.</p>}{rows.map((row) => <button key={row.id} type="button" onClick={() => choose(row)} style={{ width: "100%", display: "block", textAlign: "left", padding: 11, border: 0, borderRadius: 10, background: selectedId === row.id ? "#e7f5eb" : "transparent", cursor: "pointer" }}><strong>{row.content?.name || row.slug}</strong><small style={{ display: "block", color: "#667f70" }}>{groupLabel[row.group]} · {row.status}</small></button>)}</aside>
      <section className="vd-card auth-form">
        <label className="auth-field"><span>Category group</span><select value={group} onChange={(event) => setGroup(event.target.value as AdminCmsCategory["group"])}>{Object.entries(groupLabel).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <label className="auth-field"><span>Display name</span><input value={content.name} onChange={(event) => setContent((v) => ({ ...v, name: event.target.value }))} /></label>
          <label className="auth-field"><span>Default unit (products/lifestyle)</span><input value={content.unit} onChange={(event) => setContent((v) => ({ ...v, unit: event.target.value }))} placeholder="kg, piece, set" /></label>
          <label className="auth-field"><span>Parent category (optional)</span><select value={parentId || ""} onChange={(event) => setParentId(event.target.value ? Number(event.target.value) : null)}><option value="">No parent</option>{groupRows.map((row) => <option value={row.id} key={row.id}>{row.content?.name || row.slug}</option>)}</select></label>
          <label className="auth-field"><span>Display order</span><input type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(Number(event.target.value))} /></label>
        </div>
        <label className="auth-field"><span>Description</span><textarea rows={3} value={content.description} onChange={(event) => setContent((v) => ({ ...v, description: event.target.value }))} /></label>
        {group === "place" && <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}><label className="auth-field"><span>Place page hero label</span><input value={content.heroEyebrow} onChange={(event) => setContent((v) => ({ ...v, heroEyebrow: event.target.value }))} /></label><label className="auth-field"><span>Place page hero heading</span><input value={content.heroTitle} onChange={(event) => setContent((v) => ({ ...v, heroTitle: event.target.value }))} /></label></div>}
        <label className="auth-field"><span>Image URL</span><input value={content.image} onChange={(event) => setContent((v) => ({ ...v, image: event.target.value }))} /><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { void upload(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} /></label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}><label className="auth-field"><span>SEO title</span><input value={content.seoTitle} onChange={(event) => setContent((v) => ({ ...v, seoTitle: event.target.value }))} /></label><label className="auth-field"><span>SEO description</span><textarea value={content.metaDescription} onChange={(event) => setContent((v) => ({ ...v, metaDescription: event.target.value }))} /></label></div>
        {selected && <p style={{ color: selected.productCount || selected.childCount ? "#9a5b00" : "#667f70" }}>Dependencies: {selected.productCount} products · {selected.childCount} child categories. {selected.productCount || selected.childCount ? "Reassign before deletion or archive this category." : "Safe to delete."}</p>}
        {Boolean(selected?.productCount || selected?.childCount) && <label className="auth-field"><span>Reassign to published category before deleting</span><select value={reassignToId || ""} onChange={(event) => setReassignToId(event.target.value ? Number(event.target.value) : undefined)}><option value="">Choose a category…</option>{groupRows.map((row) => <option key={row.id} value={row.id}>{row.content?.name || row.slug}</option>)}</select></label>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}><button type="button" className="vd-add-btn" disabled={saving || uploading} onClick={() => void save(false)}>Save draft</button><button type="button" className="auth-btn" disabled={saving || uploading} onClick={() => void save(true)}><Send size={16} />{saving ? "Saving…" : "Publish"}</button>{selected && <><button type="button" className="vd-add-btn" disabled={saving} onClick={() => void archive()}><Archive size={16} />Archive</button><button type="button" className="vd-add-btn" disabled={saving || uploading || Boolean((selected.productCount || selected.childCount) && !reassignToId)} onClick={() => void remove()}><Trash2 size={16} />Delete</button></>}</div>
        {content.image && <div style={{ marginTop: 18 }}><h3 style={{ display: "flex", gap: 8, alignItems: "center" }}><Eye size={16} />Preview</h3><img src={getAdminMediaUrl(content.image)} alt={content.name} style={{ width: "100%", maxHeight: 240, objectFit: "cover", borderRadius: 12 }} /><h2>{content.name || "Category name"}</h2><p>{content.description || "Category description"}</p></div>}
      </section>
    </div>}
  </div>;
}
