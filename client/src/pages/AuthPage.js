// client/src/pages/AuthPage.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const MODES = { LOGIN:"login", REGISTER:"register", FORGOT:"forgot" };

export default function AuthPage() {
  const [mode, setMode]       = useState(MODES.LOGIN);
  const [form, setForm]       = useState({ fullName:"", email:"", password:"", confirm:"" });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw]   = useState(false);
  const [sent, setSent]       = useState(false);
  const { login, register, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => { setForm(f => ({...f, [k]: v})); setErrors(e => ({...e, [k]:""})); };

  function validate() {
    const e = {};
    if (mode === MODES.REGISTER) {
      if (!form.fullName.trim()) e.fullName = "Full name required";
      else if (!/\s/.test(form.fullName.trim())) e.fullName = "Enter first AND last name";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (mode !== MODES.FORGOT) {
      if (form.password.length < 8) e.password = "At least 8 characters";
      if (mode === MODES.REGISTER && form.password !== form.confirm) e.confirm = "Passwords do not match";
    }
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === MODES.LOGIN) {
        await login(form.email, form.password);
        toast.success("Welcome back!");
        navigate("/dashboard");
      } else if (mode === MODES.REGISTER) {
        await register(form.fullName.trim(), form.email, form.password);
        toast.success("Account created! Check your email for the OTP.");
        navigate("/verify-email");
      } else {
        await forgotPassword(form.email);
        setSent(true);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong.";
      if (msg.toLowerCase().includes("email")) setErrors(e => ({...e, email: msg}));
      else if (msg.toLowerCase().includes("password")) setErrors(e => ({...e, password: msg}));
      else toast.error(msg);
    } finally { setLoading(false); }
  }

  // Strength
  const sPwd = form.password;
  let sScore = 0;
  if (sPwd.length >= 8) sScore++;
  if (sPwd.length >= 14) sScore++;
  if (/[A-Z]/.test(sPwd) && /[a-z]/.test(sPwd)) sScore++;
  if (/[0-9]/.test(sPwd)) sScore++;
  if (/[^A-Za-z0-9]/.test(sPwd)) sScore++;
  const sColor = ["","#ff4d6d","#ff6b35","#ffcc00","#7ed321","#00e5b0"][Math.min(sScore,5)];
  const sLabel = ["","Very Weak","Weak","Fair","Good","Strong"][Math.min(sScore,5)];

  const switchMode = m => { setMode(m); setErrors({}); setForm({fullName:"",email:"",password:"",confirm:""}); setSent(false); };

  return (
    <div className="app-bg" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="grid-bg" />
      <div style={{width:"100%",maxWidth:440,position:"relative",zIndex:1}} className="anim-up">

        {/* Brand */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:54,height:54,margin:"0 auto 12px",background:"linear-gradient(135deg,#3266cc,#00e5b0)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,boxShadow:"0 8px 32px rgba(79,142,255,.28)"}}>🔐</div>
          <h1 style={{fontSize:30,letterSpacing:"-0.5px"}}>Crypt<span style={{color:"var(--green)"}}>X</span></h1>
          <p style={{color:"var(--text2)",fontSize:12,marginTop:4,fontFamily:"'JetBrains Mono',monospace"}}>
            AES-256 Multimedia Encryption · CYBER-IV-T073
          </p>
        </div>

        <div className="card" style={{padding:"32px 36px"}}>

          {/* Mode tabs */}
          {mode !== MODES.FORGOT && (
            <div style={{display:"flex",background:"var(--bg2)",borderRadius:10,padding:4,marginBottom:28,border:"1px solid var(--border)"}}>
              {[MODES.LOGIN, MODES.REGISTER].map(m => (
                <button key={m} onClick={() => switchMode(m)} style={{
                  flex:1,padding:"9px",border:"none",borderRadius:7,cursor:"pointer",
                  fontFamily:"'Outfit',sans-serif",fontSize:14,fontWeight:600,transition:"all .2s",
                  background: mode===m ? "var(--surf2)" : "transparent",
                  color: mode===m ? "var(--text)" : "var(--text2)",
                  boxShadow: mode===m ? "0 2px 8px rgba(0,0,0,.35)" : "none",
                }}>
                  {m === MODES.LOGIN ? "🔑 Sign In" : "✨ Register"}
                </button>
              ))}
            </div>
          )}

          {mode === MODES.FORGOT && !sent && (
            <div style={{marginBottom:22}}>
              <button onClick={() => switchMode(MODES.LOGIN)} className="btn btn-ghost btn-sm" style={{marginBottom:14}}>← Back</button>
              <h2 style={{fontSize:18,marginBottom:6}}>Forgot Password?</h2>
              <p style={{color:"var(--text2)",fontSize:13}}>Enter your email and we'll send a reset link.</p>
            </div>
          )}

          {sent ? (
            <div style={{textAlign:"center",padding:"16px 0"}}>
              <div style={{fontSize:52,marginBottom:16}}>📧</div>
              <h3 style={{marginBottom:8}}>Reset link sent!</h3>
              <p style={{color:"var(--text2)",fontSize:13,lineHeight:1.7,marginBottom:20}}>
                If that email is registered, you'll receive a password reset link shortly. Check your inbox.
              </p>
              <button onClick={() => switchMode(MODES.LOGIN)} className="btn btn-ghost btn-full">Back to Sign In</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>

              {/* Full name */}
              {mode === MODES.REGISTER && (
                <div className="form-group anim-in">
                  <label className="label">Full Name</label>
                  <input className={`input${errors.fullName?" err":""}`} type="text"
                    placeholder="Ayush Verma" autoComplete="name"
                    value={form.fullName} onChange={e => set("fullName", e.target.value)} />
                  {errors.fullName && <div className="ferr">⚠ {errors.fullName}</div>}
                </div>
              )}

              {/* Email */}
              <div className="form-group">
                <label className="label">Email Address</label>
                <input className={`input${errors.email?" err":""}`} type="email"
                  placeholder="you@example.com" autoComplete="email"
                  value={form.email} onChange={e => set("email", e.target.value)} />
                {errors.email && <div className="ferr">⚠ {errors.email}</div>}
              </div>

              {/* Password */}
              {mode !== MODES.FORGOT && (
                <div className="form-group">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:7}}>
                    <label className="label" style={{margin:0}}>Password</label>
                    {mode === MODES.LOGIN && (
                      <button type="button" onClick={() => switchMode(MODES.FORGOT)}
                        style={{background:"none",border:"none",color:"var(--accent)",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div style={{position:"relative"}}>
                    <input className={`input${errors.password?" err":""}`}
                      type={showPw?"text":"password"} placeholder="••••••••"
                      autoComplete={mode===MODES.LOGIN?"current-password":"new-password"}
                      value={form.password} onChange={e => set("password", e.target.value)}
                      style={{paddingRight:44}} />
                    <button type="button" onClick={() => setShowPw(p=>!p)}
                      style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:15,color:"var(--text2)"}}>
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.password && <div className="ferr">⚠ {errors.password}</div>}
                  {/* Strength */}
                  {mode === MODES.REGISTER && form.password && (
                    <div style={{marginTop:8}}>
                      <div style={{display:"flex",gap:4,marginBottom:4}}>
                        {[1,2,3,4,5].map(i => (
                          <div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=sScore?sColor:"var(--border)",transition:"background .3s"}} />
                        ))}
                      </div>
                      <div style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:sColor}}>{sLabel}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm */}
              {mode === MODES.REGISTER && (
                <div className="form-group anim-in">
                  <label className="label">Confirm Password</label>
                  <input className={`input${errors.confirm?" err":""}`}
                    type="password" placeholder="••••••••" autoComplete="new-password"
                    value={form.confirm} onChange={e => set("confirm", e.target.value)} />
                  {errors.confirm && <div className="ferr">⚠ {errors.confirm}</div>}
                  {!errors.confirm && form.confirm && form.confirm === form.password && (
                    <div className="fok">✓ Passwords match</div>
                  )}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{marginTop:4}}>
                {loading && <span className="spinner" style={{width:17,height:17}} />}
                {loading ? "Please wait..." : mode===MODES.LOGIN ? "Sign In →" : mode===MODES.REGISTER ? "Create Account →" : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>

        <div style={{textAlign:"center",marginTop:18,fontSize:12,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace"}}>
          Team CryptX · GEU · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
