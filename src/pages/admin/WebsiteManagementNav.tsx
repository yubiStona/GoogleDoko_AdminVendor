import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/admin/website/homepage", label: "Landing Page", heading: "Landing Page" },
  { to: "/admin/website/food-home", label: "Home", heading: "Food / Home page" },
  { to: "/admin/website/categories?group=product", label: "Categories by Food", heading: "Food / Categories by Food" },
  { to: "/admin/website/categories?group=place", label: "Categories by Place", heading: "Food / Categories by Place" },
  { to: "/admin/website/categories?group=place&view=details", label: "Inside Place", heading: "Food / Place details" },
  { to: "/admin/website/pages", label: "Pages", heading: "Food / Informational pages" },
  { to: "/admin/website/history", label: "History", heading: "Content history" },
] as const;

export default function WebsiteManagementNav() {
  const location = useLocation();
  return <nav aria-label="Website management" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 10, margin: "10px 0 20px" }}>
    {items.map(({ to, label, heading }) => {
      const [path, query] = to.split("?");
      const active = location.pathname === path && (query ? location.search === `?${query}` : true);
      return <Link key={to} to={to} title={heading} aria-current={active ? "page" : undefined} style={{ padding: "10px 13px", borderRadius: 12, border: `1px solid ${active ? "#168d51" : "#d9e8dd"}`, color: active ? "white" : "#476253", background: active ? "#168d51" : "white", fontWeight: 700, textDecoration: "none" }}><small style={{ display: "block", opacity: .75, fontSize: 10 }}>{heading.includes(" /") ? heading.split(" /")[0] : "Website"}</small>{label}</Link>;
    })}
  </nav>;
}
