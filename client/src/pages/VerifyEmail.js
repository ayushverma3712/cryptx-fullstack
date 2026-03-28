// client/src/pages/VerifyEmail.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const [digits, setDigits] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const refs = useRef([]);
  const { user, verifyOTP, resendOTP, logout } = useAuth();
  const navigate = useNavigate();

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  function handleDigit(i, val) {
    if (!/^\d*$/.test(val)) return;
    const next = [...digits];
    next[i] = val.slice(-1);
    setDigits(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    // Auto-submit when all 6 filled
    if (next.every(d => d) && val) {
      submitOTP(next.join(""));
    }
  }

  function handleKeyDown(i, e) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      submitOTP(text);
    }
  }

  async function submitOTP(otp) {
    setLoading(true);
    try {
      await verifyOTP(otp);
      toast.success("Email verified! Welcome to CryptX 🎉");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Verification failed.";
      toast.error(msg);
      setDigits(["","","","","",""]);
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendOTP();
      toast.success("New OTP sent to your email!");
      setCooldown(60);
      setDigits(["","","","","",""]);
      refs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not resend OTP.");
    } finally { setResending(false); }
  }

  return (
    <div className="app-bg" style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
      <div className="grid-bg" />
      <div className="card anim-up" style={{maxWidth:460,width:"100%",textAlign:"center",padding:"40px 36px",position:"relative",zIndex:1}}>

        <div style={{width:64,height:64,margin:"0 auto 20px",background:"linear-gradient(135deg,rgba(79,142,255,.2),rgba(0,229,176,.2))",border:"1px solid rgba(79,142,255,.3)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30}}>📧</div>

        <h2 style={{fontSize:22,marginBottom:10}}>Verify Your Email</h2>
        <p style={{color:"var(--text2)",fontSize:14,marginBottom:8,lineHeight:1.6}}>
          We sent a 6-digit code to
        </p>
        <div style={{background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:var(--r-sm),padding:"10px 16px",marginBottom:28,fontFamily:"'JetBrains Mono',monospace",fontSize:14,color:"var(--accent)",display:"inline-block"}}>
          {user?.email || "your email"}
        </div>

        {/* OTP Input boxes */}
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:28}} onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input key={i} ref={el => refs.current[i] = el}
              type="text" inputMode="numeric" maxLength={1}
              value={d} onChange={e => handleDigit(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              disabled={loading}
              style={{
                width:52,height:60,borderRadius:10,border:`2px solid ${d ? "var(--accent)" : "var(--border)"}`,
                background:"var(--bg2)",color:"var(--text)",fontSize:24,fontWeight:700,
                textAlign:"center",fontFamily:"'JetBrains Mono',monospace",outline:"none",
                transition:"border-color .2s",cursor:"text",
                boxShadow: d ? "0 0 0 3px rgba(79,142,255,.12)" : "none",
              }}
            />
          ))}
        </div>

        {loading && (
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,marginBottom:20,color:"var(--text2)",fontSize:13}}>
            <span className="spinner" style={{width:16,height:16}} />
            Verifying...
          </div>
        )}

        <button className="btn btn-primary btn-lg btn-full"
          onClick={() => submitOTP(digits.join(""))}
          disabled={loading || digits.some(d => !d)}>
          {loading ? "Verifying..." : "✅ Verify Email"}
        </button>

        <div style={{marginTop:20,fontSize:13,color:"var(--text2)"}}>
          Didn't receive it?{" "}
          <button onClick={handleResend} disabled={resending || cooldown > 0}
            style={{background:"none",border:"none",color:cooldown > 0 ? "var(--muted)" : "var(--accent)",cursor:cooldown > 0 ? "default":"pointer",fontSize:13,fontWeight:600}}>
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        <div style={{marginTop:20,paddingTop:16,borderTop:"1px solid var(--border)"}}>
          <button onClick={logout} style={{background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer"}}>
            ← Use a different account
          </button>
        </div>
      </div>
    </div>
  );
}
