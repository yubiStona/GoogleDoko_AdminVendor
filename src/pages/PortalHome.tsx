import { Link } from "react-router-dom";

export default function PortalHome() {
  return (
    <main className="auth-gate-page">
      <section className="auth-prompt-card static">
        <h1>GoogleDoko Operations Portal</h1>
        <p>Choose your secure workspace to continue.</p>
        <div className="auth-prompt-actions">
          <Link to="/admin/login" className="auth-btn">
            Admin login
          </Link>
          <Link to="/login?role=vendor" className="auth-btn ghost">
            Vendor login
          </Link>
          <Link to="/signup/vendor" className="auth-prompt-continue">
            Register as a vendor
          </Link>
        </div>
      </section>
    </main>
  );
}
