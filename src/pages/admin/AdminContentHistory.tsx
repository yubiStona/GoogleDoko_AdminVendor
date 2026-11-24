import { useEffect, useState } from "react";
import { api } from "../../api/client";
import { AdminHeader } from "./AdminPages";

type HistoryItem = { id: number; recordType: string; recordKey: string; action: string; previousContent: unknown; newContent: unknown; adminUserId: number | null; createdAt: string };
export default function AdminContentHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const load = async () => {
    setLoading(true); setError("");
    try { const data = await api.adminCmsHistory(page); setItems(data.items); setPages(data.totalPages || 1); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load content history."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [page]);
  return <div className="admin-page">
    <AdminHeader title="Content History" subtitle="Review saved drafts, publications, and other website content changes." actions={<button className="secondary-button" onClick={() => void load()}>Refresh</button>} />
    {error && <p className="error-text">{error}</p>}
    <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Content</th><th>Record</th><th>Action</th><th>Admin ID</th><th>Changed</th><th>Snapshot</th></tr></thead>
      <tbody>{loading ? <tr><td colSpan={6}>Loading history…</td></tr> : items.length === 0 ? <tr><td colSpan={6}>No content changes recorded yet.</td></tr> : items.map((item) => <tr key={item.id}><td>{item.recordType.replaceAll("_", " ")}</td><td>{item.recordKey}</td><td>{item.action.replaceAll("_", " ")}</td><td>{item.adminUserId ?? "—"}</td><td>{new Date(item.createdAt).toLocaleString()}</td><td><details><summary>View</summary><pre>{JSON.stringify({ previous: item.previousContent, next: item.newContent }, null, 2)}</pre></details></td></tr>)}</tbody>
    </table></div>
    <div className="table-pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button></div>
  </div>;
}
