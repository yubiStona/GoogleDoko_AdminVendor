import { NavLink } from "react-router-dom";

const tabs = [
  ["/admin/website/homepage", "Homepage"],
  ["/admin/website/pages", "Pages"],
  ["/admin/website/categories", "Products & Places"],
  ["/admin/website/history", "History"],
] as const;

export default function WebsiteManagementNav() {
  return <nav aria-label="Website management" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "10px 0 20px" }}>
    {tabs.map(([to, label]) => <NavLink key={to} to={to} style={({ isActive }) => ({ padding: "9px 14px", borderRadius: 999, border: `1px solid ${isActive ? "#168d51" : "#d9e8dd"}`, color: isActive ? "white" : "#476253", background: isActive ? "#168d51" : "white", fontWeight: 700, textDecoration: "none" })}>{label}</NavLink>)}
  </nav>;
}
