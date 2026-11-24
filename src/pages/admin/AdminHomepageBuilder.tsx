import { useEffect, useState } from "react";
import { Eye, Save, Send, ArrowUp, ArrowDown } from "lucide-react";
import { api, type HomepageCmsSection } from "../../api/client";
import { useAccount } from "../../context/AccountContext";
import { AdminHeader } from "./AdminPages";

type SectionKey = HomepageCmsSection["key"];
const fields: Record<SectionKey, { key: string; label: string }[]> = {
  hero: [
    { key: "eyebrow", label: "Tagline" }, { key: "title", label: "Main heading" },
    { key: "description", label: "Description" }, { key: "backgroundImage", label: "Background image URL" },
    { key: "imageAlt", label: "Background image alt text" },
  ],
  food: [
    { key: "eyebrow", label: "Eyebrow" }, { key: "title", label: "Heading" },
    { key: "description", label: "Description" }, { key: "button", label: "Button label" },
    { key: "image", label: "Image URL" }, { key: "imageAlt", label: "Image alt text" },
    { key: "href", label: "Button destination" },
  ],
  lifestyle: [
    { key: "eyebrow", label: "Eyebrow" }, { key: "title", label: "Heading" },
    { key: "description", label: "Description" }, { key: "button", label: "Button label" },
    { key: "image", label: "Image URL" }, { key: "imageAlt", label: "Image alt text" },
    { key: "href", label: "Button destination" },
  ],
};
const titles: Record<SectionKey, string> = { hero: "Homepage hero", food: "Food destination", lifestyle: "Lifestyle destination" };

export default function AdminHomepageBuilder() {
  const { showToast } = useAccount();
  const [sections, setSections] = useState<HomepageCmsSection[]>([]);
  const [selected, setSelected] = useState<SectionKey>("hero");
  const [content, setContent] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState(true);
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try {
      const data = await api.adminHomepage();
      setSections(data);
      const active = data.find((section) => section.key === selected) || data[0];
      if (active) {
        setContent({ ...active.draftContent });
        setVisible(Boolean(active.draftVisible));
        setOrder(active.displayOrder);
        setSelected(active.key);
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load homepage content"); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function choose(key: SectionKey) {
    const section = sections.find((item) => item.key === key);
    if (!section) return;
    setSelected(key); setContent({ ...section.draftContent });
    setVisible(Boolean(section.draftVisible)); setOrder(section.displayOrder);
  }

  async function save(publish: boolean) {
    if (fields[selected].some(({ key }) => !content[key]?.trim())) {
      setError("Fill in every required field before saving."); return;
    }
    setSaving(true); setError("");
    try {
      await api.adminSaveHomepageDraft(selected, { content, visible, displayOrder: Math.max(0, order) });
      if (publish) await api.adminPublishHomepage(selected);
      showToast(publish ? `${titles[selected]} published` : `${titles[selected]} draft saved`);
      await load();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save homepage content"); }
    finally { setSaving(false); }
  }

  async function upload(file?: File) {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const result = await api.uploadImage(file);
      const imageField = selected === "hero" ? "backgroundImage" : "image";
      setContent((current) => ({ ...current, [imageField]: result.url }));
      showToast("Image uploaded. Save the draft to keep the change.");
    } catch (err) { setError(err instanceof Error ? err.message : "Image upload failed"); }
    finally { setUploading(false); }
  }

  const image = selected === "hero" ? content.backgroundImage : content.image;
  return <div className="vd-settings">
    <AdminHeader title="Homepage Builder" subtitle="Edit the public homepage, preview draft changes, then publish them." refresh={() => void load()} busy={loading} />
    {error && <p role="alert" className="auth-error">{error}</p>}
    {loading ? <p>Loading homepage content…</p> : <>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
        {(["hero", "food", "lifestyle"] as SectionKey[]).map((key) => <button key={key} type="button" className={selected === key ? "auth-btn" : "vd-add-btn"} onClick={() => choose(key)}>{titles[key]}</button>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(280px, .9fr)", gap: 20, alignItems: "start" }}>
        <section className="vd-card auth-form" aria-label={`${titles[selected]} editor`}>
          <h2 style={{ color: "#168d51", fontSize: 18 }}>Section content</h2>
          {fields[selected].map(({ key, label }) => <label className="auth-field" key={key}>
            <span>{label}</span>
            {key === "description" ? <textarea rows={3} value={content[key] || ""} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} /> : <input value={content[key] || ""} onChange={(event) => setContent((current) => ({ ...current, [key]: event.target.value }))} />}
          </label>)}
          <label className="auth-field"><span>Upload replacement image</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(event) => { void upload(event.currentTarget.files?.[0]); event.currentTarget.value = ""; }} />{uploading && <small>Uploading image…</small>}</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", margin: "14px 0" }}>
            <label style={{ display: "flex", gap: 8, alignItems: "center" }}><input type="checkbox" checked={visible} onChange={(event) => setVisible(event.target.checked)} />Show on public homepage</label>
            {selected !== "hero" && <><label style={{ display: "flex", gap: 8, alignItems: "center" }}>Display order <input type="number" min="0" value={order} onChange={(event) => setOrder(Number(event.target.value))} style={{ width: 75 }} /></label>
            <button type="button" aria-label="Move section earlier" className="vd-add-btn" onClick={() => setOrder((value) => Math.max(1, value - 1))}><ArrowUp size={16} /></button>
            <button type="button" aria-label="Move section later" className="vd-add-btn" onClick={() => setOrder((value) => value + 1)}><ArrowDown size={16} /></button></>}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="vd-add-btn" disabled={saving || uploading} onClick={() => void save(false)}><Save size={16} />Save draft</button>
            <button type="button" className="auth-btn" disabled={saving || uploading} onClick={() => void save(true)}><Send size={16} />{saving ? "Saving…" : "Publish"}</button>
          </div>
          <p style={{ color: "#667f70", fontSize: 12 }}>Current status: {sections.find((item) => item.key === selected)?.status || "published"}</p>
        </section>
        <section className="vd-card" aria-label="Draft preview" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{ padding: 18, display: "flex", gap: 8, alignItems: "center" }}><Eye size={17} /><strong>Draft preview</strong></div>
          <div style={{ minHeight: 300, position: "relative", padding: 24, display: "flex", flexDirection: "column", justifyContent: "end", color: "white", background: "#1d4a32" }}>
            {image && <img src={image} alt={content.imageAlt || ""} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: .72 }} />}
            <div style={{ position: "relative", textShadow: "0 1px 4px #10251a" }}>
              <small>{content.eyebrow}</small><h2 style={{ fontSize: 28, margin: "8px 0" }}>{content.title}</h2><p>{content.description}</p>
              {selected !== "hero" && <button type="button" className="auth-btn">{content.button || "Explore"}</button>}
            </div>
          </div>
          {!visible && <p style={{ padding: "0 18px 14px", color: "#a44" }}>This section is hidden from customers when published.</p>}
        </section>
      </div>
    </>}
  </div>;
}
