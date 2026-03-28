// client/src/pages/ResetPassword.js
import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token    = params.get("token");
  const [pwd, setPwd]       = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (pwd.length < 8) return toast.error("Password must be at least 8 characters.");
    if (pwd !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    try {
      await resetPassword(token, pwd);
      setDone(true);
      toast.success("Password reset! Please sign in.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed. Link may have expired.");
    } finally { setLoading(false); }
  }

  if (!token) return (
    <div className="app-bg" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="card anim-up" style={{maxWidth:420,width:"100%",textAlign:"center",padding:"40px 32px",position:"relative",zIndex:1}}>
        <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
        <h2>Invalid Reset Link</h2>
        <p style={{color:"var(--text2)",marginTop:10,marginBottom:24,fontSize:14}}>This reset link is missing or invalid. Please request a new one.</p>
        <button className="btn btn-primary btn-full" onClick={() => navigate("/login")}>Back to Sign In</button>
      </div>
    </div>
  );

  return (
    <div className="app-bg" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="grid-bg" />
      <div className="card anim-up" style={{maxWidth:420,width:"100%",padding:"36px 32px",position:"relative",zIndex:1}}>

        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:48,marginBottom:12}}>🔑</div>
          <h2 style={{fontSize:22}}>Set New Password</h2>
          <p style={{color:"var(--text2)",fontSize:13,marginTop:6}}>Choose a strong password for your CryptX account.</p>
        </div>

        {done ? (
          <div style={{textAlign:"center"}}>
            <div className="alert alert-ok" style={{justifyContent:"center",marginBottom:20}}>✅ Password reset successfully!</div>
            <button className="btn btn-primary btn-lg btn-full" onClick={() => navigate("/login")}>Sign In Now →</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="label">New Password</label>
              <input className="input" type="password" placeholder="Min. 8 characters"
                value={pwd} onChange={e => setPwd(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Confirm New Password</label>
              <input className="input" type="password" placeholder="Repeat password"
                value={confirm} onChange={e => setConfirm(e.target.value)} />
              {confirm && confirm === pwd && <div className="fok">✓ Passwords match</div>}
              {confirm && confirm !== pwd && <div className="ferr">Passwords do not match</div>}
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
              {loading ? <><span className="spinner" style={{width:17,height:17}} />Setting password...</> : "Reset Password →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
