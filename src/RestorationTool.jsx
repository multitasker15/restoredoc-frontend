import { useState, useRef, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const JOB_TYPES = [
  { id: "water",     label: "Water Damage" },
  { id: "fire",      label: "Fire & Smoke" },
  { id: "mold",      label: "Mold Remediation" },
  { id: "storm",     label: "Storm Damage" },
  { id: "biohazard", label: "Biohazard" },
];

const WATER_CATEGORIES = ["Category 1 — Clean Water", "Category 2 — Grey Water", "Category 3 — Black Water"];
const WATER_CLASSES    = ["Class 1 — Minimal", "Class 2 — Significant", "Class 3 — Extensive", "Class 4 — Specialty"];

const IconDocument = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="15" y2="17"/>
  </svg>
);

const IconChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
    <line x1="2" y1="20" x2="22" y2="20"/>
  </svg>
);

const IconTag = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

const IconCamera = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconCopy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);

const IconLink = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

export default function RestorationTool() {
  const [screen, setScreen] = useState(() => {
    if (localStorage.getItem("rda_token")) return "tool";
    const mode = new URLSearchParams(window.location.search).get("mode");
    return mode === "signup" ? "signup" : "login";
  });
  const [jobType, setJobType]             = useState(null);
  const [jobDetails, setJobDetails]       = useState("");
  const [techName, setTechName]           = useState("");
  const [waterCategory, setWaterCategory] = useState("");
  const [waterClass, setWaterClass]       = useState("");
  const [photo, setPhoto]                 = useState(null);
  const [photoPreview, setPhotoPreview]   = useState(null);
  const [checklist, setChecklist]         = useState(null);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [confirmed, setConfirmed]         = useState(null);
  const [aiIdentification, setAiId]       = useState(null);
  const fileRef = useRef();

  const [token, setToken]     = useState(() => localStorage.getItem("rda_token") || null);
  const [company, setCompany] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rda_company") || "null"); } catch { return null; }
  });
  const [authEmail, setAuthEmail]             = useState("");
  const [authPassword, setAuthPassword]       = useState("");
  const [authCompanyName, setAuthCompanyName] = useState("");
  const [authError, setAuthError]             = useState(null);
  const [authLoading, setAuthLoading]         = useState(false);

  const [dashStats, setDashStats]     = useState(null);
  const [dashLoading, setDashLoading] = useState(false);

  const trialDays = company?.trialDaysLeft ?? 7;

  useEffect(() => {
    if (screen !== "dashboard" || !token || dashStats) return;
    setDashLoading(true);
    fetch(`${API_BASE}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setDashStats(d); setDashLoading(false); })
      .catch(() => setDashLoading(false));
  }, [screen, token]);

  const handleLogin = async () => {
    setAuthLoading(true); setAuthError(null);
    try {
      const res  = await fetch(`${API_BASE}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: authEmail, password: authPassword }) });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Login failed"); setAuthLoading(false); return; }
      localStorage.setItem("rda_token", data.token);
      localStorage.setItem("rda_company", JSON.stringify(data.company));
      setToken(data.token); setCompany(data.company); setScreen("tool");
    } catch { setAuthError("Network error. Please try again."); }
    setAuthLoading(false);
  };

  const handleSignup = async () => {
    setAuthLoading(true); setAuthError(null);
    try {
      const res  = await fetch(`${API_BASE}/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyName: authCompanyName, email: authEmail, password: authPassword }) });
      const data = await res.json();
      if (!res.ok) { setAuthError(data.error || "Signup failed"); setAuthLoading(false); return; }
      localStorage.setItem("rda_token", data.token);
      localStorage.setItem("rda_company", JSON.stringify(data.company));
      setToken(data.token); setCompany(data.company); setScreen("tool");
    } catch { setAuthError("Network error. Please try again."); }
    setAuthLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("rda_token"); localStorage.removeItem("rda_company");
    setToken(null); setCompany(null); setDashStats(null); setScreen("tool");
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setPhoto(file); setPhotoPreview(URL.createObjectURL(file)); setConfirmed(null); setAiId(null);
  };

  const identifyPhoto = async () => {
    if (!photo) return; setLoading(true); setError(null);
    try {
      const form = new FormData(); form.append("photo", photo);
      const teamSlug = company?.teamSlug || "test-team";
      const res  = await fetch(`${API_BASE}/checklist/identify/${teamSlug}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Identification failed."); setLoading(false); return; }
      setAiId(data.identification);
    } catch { setError("Photo identification failed. Please try again."); }
    setLoading(false);
  };

  const generateChecklist = async () => {
    if (!jobType && !photo) { setError("Please select a job type or upload a photo."); return; }
    setLoading(true); setError(null); setChecklist(null);
    try {
      const form = new FormData();
      if (jobType)       form.append("jobType",        JOB_TYPES.find(j => j.id === jobType)?.label || jobType);
      if (jobDetails)    form.append("jobDetails",     jobDetails);
      if (waterCategory) form.append("waterCategory",  waterCategory);
      if (waterClass)    form.append("waterClass",     waterClass);
      form.append("techName", techName || "Field Tech");
      if (aiIdentification && confirmed !== false) form.append("aiIdentification", aiIdentification);
      form.append("photoConfirmed", confirmed === false ? "false" : "true");
      if (photo && confirmed !== false) form.append("photo", photo);
      const teamSlug = company?.teamSlug || "test-team";
      const res  = await fetch(`${API_BASE}/checklist/generate/${teamSlug}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to generate checklist."); setLoading(false); return; }
      setChecklist(data.checklist);
    } catch { setError("Failed to generate checklist. Please try again."); }
    setLoading(false);
  };

  const reset = () => {
    setJobType(null); setJobDetails(""); setWaterCategory(""); setWaterClass("");
    setTechName(""); setPhoto(null); setPhotoPreview(null); setChecklist(null);
    setError(null); setConfirmed(null); setAiId(null);
  };

  const isAuthScreen = screen === "login" || screen === "signup";

  return (
    <div style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif", minHeight: "100vh", background: "#f9fafb", color: "#111827", display: "flex" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f9fafb; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        .nav-item { display: flex; align-items: center; gap: 9px; padding: 8px 11px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; color: #94a3b8; border: none; background: none; width: 100%; text-align: left; font-family: inherit; transition: color 0.15s, background 0.15s; }
        .nav-item:hover { color: #e2e8f0; background: rgba(255,255,255,0.07); }
        .nav-item.active { color: white; background: rgba(255,255,255,0.11); }
        .input-field { width: 100%; background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 9px 12px; color: #111827; font-family: inherit; font-size: 14px; resize: vertical; transition: border 0.15s, box-shadow 0.15s; outline: none; }
        .input-field:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }
        .input-field::placeholder { color: #9ca3af; }
        .select-field { width: 100%; background: white; border: 1px solid #d1d5db; border-radius: 6px; padding: 9px 12px; color: #111827; font-family: inherit; font-size: 14px; outline: none; cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 36px; transition: border 0.15s, box-shadow 0.15s; }
        .select-field:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); outline: none; }
        .primary-btn { background: #2563eb; border: none; border-radius: 6px; color: white; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; padding: 9px 18px; transition: background 0.15s; }
        .primary-btn:hover:not(:disabled) { background: #1d4ed8; }
        .primary-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .primary-btn.full { width: 100%; padding: 10px 18px; }
        .secondary-btn { background: white; border: 1px solid #d1d5db; border-radius: 6px; color: #374151; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; padding: 8px 16px; transition: background 0.15s, border-color 0.15s; }
        .secondary-btn:hover { background: #f9fafb; border-color: #9ca3af; }
        .photo-zone { border: 1.5px dashed #d1d5db; border-radius: 8px; padding: 28px 20px; text-align: center; cursor: pointer; transition: border-color 0.15s, background 0.15s; background: #fafafa; }
        .photo-zone:hover { border-color: #2563eb; background: #eff6ff; }
        .checklist-item { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; font-size: 14px; color: #374151; line-height: 1.55; }
        .checkbox { width: 17px; height: 17px; min-width: 17px; border: 1.5px solid #d1d5db; border-radius: 4px; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; margin-top: 2px; background: white; }
        .checkbox.checked { background: #2563eb; border-color: #2563eb; }
        .stat-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px 24px; }
        .label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px; }
        .error-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 10px 14px; color: #dc2626; font-size: 13px; margin-bottom: 16px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.22s ease forwards; }
      `}</style>

      {/* AUTH SCREENS — full-page centered, no sidebar */}
      {isAuthScreen && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", padding: "20px" }}>
          <div style={{ width: "100%", maxWidth: 400 }} className="fade-in">
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                <div style={{ width: 32, height: 32, background: "#2563eb", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <IconDocument />
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", color: "#111827" }}>RestoreDoc<span style={{ color: "#2563eb" }}>AI</span></span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", marginBottom: 6 }}>
                {screen === "login" ? "Sign in to your account" : "Create your account"}
              </h1>
              <p style={{ color: "#6b7280", fontSize: 14 }}>
                {screen === "login" ? "Enter your credentials to continue" : "Start your 7-day free trial — no credit card required"}
              </p>
            </div>

            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 10, padding: "28px" }}>
              {screen === "signup" && (
                <div style={{ marginBottom: 16 }}>
                  <label className="label">Company name</label>
                  <input className="input-field" type="text" placeholder="ABC Restoration Co"
                    value={authCompanyName} onChange={e => setAuthCompanyName(e.target.value)} />
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label className="label">Email address</label>
                <input className="input-field" type="email" placeholder="you@company.com"
                  value={authEmail} onChange={e => setAuthEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Password</label>
                <input className="input-field" type="password" placeholder={screen === "signup" ? "Min. 8 characters" : ""}
                  value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (screen === "login" ? handleLogin() : handleSignup())} />
              </div>

              {authError && <div className="error-box">{authError}</div>}

              <button className="primary-btn full" disabled={authLoading}
                onClick={screen === "login" ? handleLogin : handleSignup}>
                {authLoading
                  ? (screen === "login" ? "Signing in..." : "Creating account...")
                  : (screen === "login" ? "Sign in" : "Create account")}
              </button>

              <p style={{ textAlign: "center", color: "#6b7280", fontSize: 13, marginTop: 16 }}>
                {screen === "login" ? "Don't have an account? " : "Already have an account? "}
                <button style={{ background: "none", border: "none", color: "#2563eb", cursor: "pointer", fontSize: 13, padding: 0, fontFamily: "inherit", fontWeight: 500 }}
                  onClick={() => { setAuthError(null); setScreen(screen === "login" ? "signup" : "login"); }}>
                  {screen === "login" ? "Sign up free" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR + MAIN LAYOUT */}
      {!isAuthScreen && (
        <>
          {/* SIDEBAR */}
          <div style={{ width: 220, minWidth: 220, background: "#1a2332", display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
            <div style={{ padding: "18px 16px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 28, height: 28, background: "#2563eb", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconDocument />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: "white", letterSpacing: "-0.2px" }}>
                  RestoreDoc<span style={{ color: "#60a5fa" }}>AI</span>
                </span>
              </div>
            </div>

            <nav style={{ padding: "10px 8px", flex: 1 }}>
              <button className={`nav-item ${screen === "tool" ? "active" : ""}`} onClick={() => setScreen("tool")}>
                <IconDocument /> New Checklist
              </button>
              <button className={`nav-item ${screen === "dashboard" ? "active" : ""}`} onClick={() => setScreen("dashboard")}>
                <IconChart /> Dashboard
              </button>
              <button className={`nav-item ${screen === "pricing" ? "active" : ""}`} onClick={() => setScreen("pricing")}>
                <IconTag /> Pricing
              </button>
            </nav>

            <div style={{ padding: "12px 12px 18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              {token ? (
                <>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f0", marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {company?.name || "Your Company"}
                    </div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(37,99,235,0.2)", border: "1px solid rgba(96,165,250,0.25)", borderRadius: 20, padding: "3px 9px" }}>
                      <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: "#93c5fd" }}>{trialDays} days remaining</span>
                    </div>
                  </div>
                  <button className="nav-item" onClick={handleLogout} style={{ color: "#6b7280", padding: "7px 10px", fontSize: 13 }}>
                    <IconLogout /> Sign out
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button className="primary-btn full" style={{ fontSize: 13 }}
                    onClick={() => { setAuthError(null); setScreen("signup"); }}>
                    Start free trial
                  </button>
                  <button style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 500, padding: "5px 0", textAlign: "center" }}
                    onClick={() => { setAuthError(null); setScreen("login"); }}>
                    Sign in
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, minHeight: "100vh", overflow: "auto", background: "#f9fafb" }}>

            {/* NEW CHECKLIST SCREEN */}
            {screen === "tool" && (
              <div style={{ maxWidth: 660, margin: "0 auto", padding: "40px 32px" }}>
                {!checklist ? (
                  <>
                    <div style={{ marginBottom: 28 }}>
                      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", marginBottom: 4 }}>New Checklist</h1>
                      <p style={{ color: "#6b7280", fontSize: 14 }}>Generate an IICRC-standard documentation checklist for any restoration job.</p>
                    </div>

                    {/* JOB TYPE — segmented control */}
                    <div style={{ marginBottom: 22 }}>
                      <label className="label">Job type</label>
                      <div style={{ display: "flex", border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", background: "white" }}>
                        {JOB_TYPES.map((j, idx) => (
                          <button key={j.id} onClick={() => setJobType(j.id)} style={{
                            flex: 1, padding: "9px 4px", border: "none",
                            borderLeft: idx > 0 ? "1px solid #d1d5db" : "none",
                            background: jobType === j.id ? "#2563eb" : "white",
                            color: jobType === j.id ? "white" : "#374151",
                            fontFamily: "inherit", fontSize: 12, fontWeight: 500,
                            cursor: "pointer", transition: "background 0.15s, color 0.15s", lineHeight: 1.35,
                          }}>
                            {j.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* WATER SUBCATEGORY */}
                    {jobType === "water" && (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }} className="fade-in">
                        <div>
                          <label className="label">Water category</label>
                          <select className="select-field" value={waterCategory} onChange={e => setWaterCategory(e.target.value)}>
                            <option value="">Select...</option>
                            {WATER_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">Water class</label>
                          <select className="select-field" value={waterClass} onChange={e => setWaterClass(e.target.value)}>
                            <option value="">Select...</option>
                            {WATER_CLASSES.map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* PHOTO UPLOAD */}
                    <div style={{ marginBottom: 20 }}>
                      <label className="label">
                        Photo of damage{" "}
                        <span style={{ color: "#9ca3af", fontWeight: 400 }}>(optional)</span>
                      </label>
                      <input type="file" accept="image/*" ref={fileRef} style={{ display: "none" }} onChange={handlePhoto} capture="environment" />
                      {!photoPreview ? (
                        <div className="photo-zone" onClick={() => fileRef.current.click()}>
                          <div style={{ color: "#9ca3af", marginBottom: 8, display: "flex", justifyContent: "center" }}>
                            <IconCamera />
                          </div>
                          <div style={{ color: "#374151", fontWeight: 500, fontSize: 14, marginBottom: 3 }}>Upload or take a photo</div>
                          <div style={{ color: "#9ca3af", fontSize: 13 }}>AI will identify damage type and customize your checklist</div>
                        </div>
                      ) : (
                        <div>
                          <div style={{ position: "relative" }}>
                            <img src={photoPreview} alt="damage" style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb", maxHeight: 220, objectFit: "cover", display: "block" }} />
                            <button onClick={() => { setPhoto(null); setPhotoPreview(null); setAiId(null); setConfirmed(null); }}
                              style={{ position: "absolute", top: 8, right: 8, background: "rgba(17,24,39,0.7)", border: "none", borderRadius: 4, color: "white", padding: "4px 10px", cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 500 }}>
                              Remove
                            </button>
                          </div>
                          {!aiIdentification && !loading && (
                            <button className="secondary-btn" style={{ marginTop: 10, width: "100%", fontSize: 13 }} onClick={identifyPhoto}>
                              Identify damage type with AI
                            </button>
                          )}
                          {aiIdentification && confirmed === null && (
                            <div style={{ marginTop: 10, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 6, padding: "14px 16px" }} className="fade-in">
                              <div style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", marginBottom: 6, letterSpacing: "0.5px", textTransform: "uppercase" }}>AI Analysis</div>
                              <p style={{ fontSize: 14, color: "#1e40af", lineHeight: 1.6, marginBottom: 12 }}>{aiIdentification}</p>
                              <div style={{ display: "flex", gap: 8 }}>
                                <button style={{ flex: 1, padding: "8px 0", background: "#16a34a", border: "none", borderRadius: 5, color: "white", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => setConfirmed(true)}>Correct</button>
                                <button style={{ flex: 1, padding: "8px 0", background: "white", border: "1px solid #d1d5db", borderRadius: 5, color: "#374151", fontFamily: "inherit", fontSize: 13, fontWeight: 500, cursor: "pointer" }} onClick={() => setConfirmed(false)}>Incorrect</button>
                              </div>
                            </div>
                          )}
                          {confirmed === true  && <div style={{ marginTop: 8, fontSize: 13, color: "#16a34a" }}>Photo analysis will be used in checklist generation</div>}
                          {confirmed === false && <div style={{ marginTop: 8, fontSize: 13, color: "#d97706" }}>Continuing with job type and details only</div>}
                        </div>
                      )}
                    </div>

                    {/* JOB DETAILS */}
                    <div style={{ marginBottom: 16 }}>
                      <label className="label">Job details</label>
                      <textarea className="input-field" rows={4}
                        placeholder="Describe the damage — location, materials affected, cause, square footage, and any additional notes..."
                        value={jobDetails} onChange={e => setJobDetails(e.target.value)} />
                    </div>

                    {/* TECH NAME */}
                    <div style={{ marginBottom: 24 }}>
                      <label className="label">Technician name</label>
                      <input className="input-field" type="text" placeholder="e.g. Mike Thompson"
                        value={techName} onChange={e => setTechName(e.target.value)} />
                    </div>

                    {error && <div className="error-box">{error}</div>}

                    <button className="primary-btn full" disabled={loading || (!jobType && !photo)} onClick={generateChecklist}>
                      {loading ? (
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                          <span style={{ width: 15, height: 15, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                          Generating checklist...
                        </span>
                      ) : "Generate checklist"}
                    </button>
                  </>
                ) : (
                  <div className="fade-in">
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 16 }}>
                      <div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", marginBottom: 8 }}>Documentation Checklist</h1>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {jobType && (
                            <span style={{ display: "inline-flex", alignItems: "center", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 4, padding: "3px 9px", fontSize: 12, fontWeight: 500, color: "#1d4ed8" }}>
                              {JOB_TYPES.find(j => j.id === jobType)?.label}
                            </span>
                          )}
                          <span style={{ display: "inline-flex", alignItems: "center", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 4, padding: "3px 9px", fontSize: 12, fontWeight: 500, color: "#15803d" }}>
                            IICRC Standard
                          </span>
                        </div>
                      </div>
                      <button className="secondary-btn" style={{ fontSize: 13, flexShrink: 0 }} onClick={reset}>New checklist</button>
                    </div>

                    <ChecklistRenderer text={checklist} />

                    <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
                      <button className="secondary-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: 1 }}
                        onClick={() => navigator.clipboard.writeText(checklist)}>
                        <IconCopy /> Copy to clipboard
                      </button>
                      <button className="primary-btn" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: 1 }}
                        onClick={() => { const b = new Blob([checklist], { type: "text/plain" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `checklist-${Date.now()}.txt`; a.click(); }}>
                        <IconDownload /> Download
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DASHBOARD SCREEN */}
            {screen === "dashboard" && (
              <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 32px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", marginBottom: 4 }}>Dashboard</h1>
                  <p style={{ color: "#6b7280", fontSize: 14 }}>Track documentation activity across your team</p>
                </div>

                {!token ? (
                  <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, padding: "52px 32px", textAlign: "center" }}>
                    <div style={{ width: 44, height: 44, background: "#f3f4f6", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#6b7280" }}>
                      <IconLock />
                    </div>
                    <h2 style={{ fontSize: 17, fontWeight: 600, color: "#111827", marginBottom: 6 }}>Sign in to view your dashboard</h2>
                    <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 22 }}>Track checklists, technicians, and activity across your company.</p>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                      <button className="secondary-btn" onClick={() => { setAuthError(null); setScreen("login"); }}>Sign in</button>
                      <button className="primary-btn" onClick={() => { setAuthError(null); setScreen("signup"); }}>Start free trial</button>
                    </div>
                  </div>
                ) : dashLoading ? (
                  <div style={{ color: "#9ca3af", fontSize: 14, padding: "40px 0" }}>Loading...</div>
                ) : (
                  <>
                    {/* Metrics */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
                      {[
                        { label: "Total checklists",   value: dashStats?.overview?.totalChecklists     ?? "—" },
                        { label: "This month",         value: dashStats?.overview?.checklistsThisMonth ?? "—" },
                        { label: "Technicians",        value: dashStats?.overview?.uniqueTechs         ?? "—" },
                        { label: "Avg completion",     value: dashStats?.overview?.avgCompletionRate != null ? `${dashStats.overview.avgCompletionRate}%` : "—" },
                      ].map(s => (
                        <div key={s.label} className="stat-card">
                          <div style={{ fontSize: 26, fontWeight: 700, color: "#111827", letterSpacing: "-0.5px", marginBottom: 4 }}>{s.value}</div>
                          <div style={{ color: "#6b7280", fontSize: 13 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Team link */}
                    <div className="stat-card" style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <IconLink />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>Team access link</span>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#16a34a", fontWeight: 500 }}>
                          <span style={{ width: 6, height: 6, background: "#4ade80", borderRadius: "50%", display: "inline-block" }} />
                          Active
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "9px 14px" }}>
                        <span style={{ fontSize: 13, color: "#374151", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {dashStats?.teamLink ?? "—"}
                        </span>
                        <button className="secondary-btn" style={{ padding: "5px 12px", fontSize: 12, flexShrink: 0 }}
                          onClick={() => dashStats?.teamLink && navigator.clipboard.writeText(dashStats.teamLink)}>
                          Copy
                        </button>
                      </div>
                      <p style={{ color: "#9ca3af", fontSize: 12, marginTop: 8 }}>Share with your technicians. No login required.</p>
                    </div>

                    {/* Recent checklists table */}
                    {dashStats?.recentChecklists?.length > 0 && (
                      <div className="stat-card">
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: "#111827", marginBottom: 16 }}>Recent checklists</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                              {["Job type", "Technician", "Date", "Completion"].map((h, i) => (
                                <th key={h} style={{ textAlign: i === 3 ? "right" : "left", padding: "0 0 10px", fontWeight: 500, color: "#6b7280", fontSize: 12 }}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dashStats.recentChecklists.map((c, i) => (
                              <tr key={c.id} style={{ borderBottom: i < dashStats.recentChecklists.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                                <td style={{ padding: "11px 0", color: "#111827", fontWeight: 500 }}>{c.jobType || "—"}</td>
                                <td style={{ padding: "11px 0", color: "#374151" }}>{c.techName || "—"}</td>
                                <td style={{ padding: "11px 0", color: "#6b7280" }}>{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: "11px 0", textAlign: "right" }}>
                                  <span style={{ display: "inline-block", background: "#f0fdf4", color: "#15803d", borderRadius: 4, padding: "2px 8px", fontSize: 12, fontWeight: 500 }}>
                                    {c.completion}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* PRICING SCREEN */}
            {screen === "pricing" && (
              <div style={{ maxWidth: 880, margin: "0 auto", padding: "40px 32px" }}>
                <div style={{ marginBottom: 32 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", letterSpacing: "-0.3px", marginBottom: 4 }}>Pricing</h1>
                  <p style={{ color: "#6b7280", fontSize: 14 }}>One denied insurance claim pays for years of this subscription.</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
                  {[
                    { name: "Starter", price: "$197", period: "/mo", techs: "1–3 technicians",   features: ["Unlimited checklists", "Photo damage identification", "Team access link", "Basic dashboard", "Email support"], featured: false },
                    { name: "Growth",  price: "$397", period: "/mo", techs: "4–10 technicians",  features: ["Everything in Starter", "Advanced analytics", "Xactimate formatting", "Priority support", "Usage reports"], featured: true },
                    { name: "Pro",     price: "$697", period: "/mo", techs: "11–20 technicians", features: ["Everything in Growth", "White label option", "API access", "Dedicated account manager", "Custom checklists"], featured: false },
                  ].map(p => (
                    <div key={p.name} style={{ background: "white", border: p.featured ? "2px solid #2563eb" : "1px solid #e5e7eb", borderRadius: 8, padding: "24px", position: "relative" }}>
                      {p.featured && (
                        <div style={{ position: "absolute", top: -1, left: 24, right: 24, background: "#2563eb", color: "white", textAlign: "center", fontSize: 11, fontWeight: 600, padding: "4px 0", borderRadius: "0 0 6px 6px", letterSpacing: "0.5px" }}>
                          MOST POPULAR
                        </div>
                      )}
                      <div style={{ paddingTop: p.featured ? 12 : 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>{p.name}</div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 2, marginBottom: 4 }}>
                          <span style={{ fontSize: 32, fontWeight: 700, color: "#111827", letterSpacing: "-1px" }}>{p.price}</span>
                          <span style={{ color: "#9ca3af", fontSize: 14 }}>{p.period}</span>
                        </div>
                        <div style={{ color: "#9ca3af", fontSize: 13, marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>{p.techs}</div>
                        <div style={{ marginBottom: 24 }}>
                          {p.features.map(f => (
                            <div key={f} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 10, fontSize: 14, color: "#374151" }}>
                              <span style={{ color: "#2563eb", marginTop: 2, flexShrink: 0 }}><IconCheck /></span>
                              {f}
                            </div>
                          ))}
                        </div>
                        <button
                          className={p.featured ? "primary-btn full" : "secondary-btn"}
                          style={{ width: "100%", fontSize: 14 }}
                          onClick={() => { setAuthError(null); setScreen(token ? "tool" : "signup"); }}>
                          Start free trial
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 24, textAlign: "center" }}>All plans include a 7-day free trial. No credit card required.</p>
              </div>
            )}

          </div>
        </>
      )}
    </div>
  );
}

function ChecklistRenderer({ text }) {
  const [checked, setChecked] = useState({});
  const lines = text.split('\n');
  const total = lines.filter(l => l.includes('[ ]')).length;
  const done  = Object.values(checked).filter(Boolean).length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 14, background: "#f9fafb" }}>
        <div style={{ flex: 1, background: "#e5e7eb", borderRadius: 4, height: 5, overflow: "hidden" }}>
          <div style={{ width: `${pct}%`, background: "#2563eb", height: "100%", borderRadius: 4, transition: "width 0.2s" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#374151", whiteSpace: "nowrap" }}>{done} / {total} complete</span>
      </div>
      <div style={{ padding: "4px 20px 20px" }}>
        {lines.map((line, i) => {
          if (!line.trim()) return <div key={i} style={{ height: 4 }} />;
          const isSection = /^\d+\.\s+[A-Z\s&—]+$/.test(line.trim()) || (line.includes('—') && line.length < 60 && !line.includes('[ ]'));
          const isItem    = line.includes('[ ]');
          if (isSection) return (
            <div key={i} style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", letterSpacing: "0.7px", textTransform: "uppercase", marginTop: 20, marginBottom: 6, paddingBottom: 6, borderBottom: "1px solid #f3f4f6" }}>
              {line.replace(/^\d+\.\s+/, '')}
            </div>
          );
          if (isItem) {
            const label = line.replace('[ ]', '').trim();
            return (
              <div key={i} className="checklist-item">
                <div className={`checkbox ${checked[i] ? "checked" : ""}`} onClick={() => setChecked(p => ({ ...p, [i]: !p[i] }))}>
                  {checked[i] && <span style={{ color: "white", display: "flex" }}><IconCheck /></span>}
                </div>
                <span style={{ textDecoration: checked[i] ? "line-through" : "none", color: checked[i] ? "#9ca3af" : "#374151" }}>{label}</span>
              </div>
            );
          }
          return <div key={i} style={{ color: "#9ca3af", fontSize: 13, padding: "3px 0", lineHeight: 1.6 }}>{line}</div>;
        })}
      </div>
    </div>
  );
}
