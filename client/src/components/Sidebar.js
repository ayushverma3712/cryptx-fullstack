// client/src/components/Sidebar.js
import React from "react";
import { NavLink } from "react-router-dom";

const NAV = [
  { to:"/",         icon:"⚡", label:"Dashboard"    },
  { to:"/encrypt",  icon:"🔐", label:"Encrypt File"  },
  { to:"/decrypt",  icon:"🔓", label:"Decrypt File"  },
  { to:"/history",  icon:"📋", label:"File History"  },
];

export default function Sidebar({ onClose }) {
  return (
    <aside style={{width:235,minHeight:"100vh",background:"var(--surface)",borderRight:"1px solid var(--border)",display:"flex",flexDirection:"column",flexShrink:0}}>

      {/* Brand */}
      <div style={{padding:"22px 18px 18px",borderBottom:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#3266cc,#00e5b0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🔐</div>
          <div>
            <div style={{fontSize:20,fontWeight:800,letterSpacing:"-0.5px"}}>Crypt<span style={{color:"var(--green)"}}>X</span></div>
            <div style={{fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace"}}>AES-256 Encryption</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"14px 10px",overflowY:"auto"}}>
        <div style={{fontSize:10,color:"var(--muted)",fontFamily:"'JetBrains Mono',monospace",letterSpacing:1,padding:"0 8px 8px",textTransform:"uppercase"}}>Menu</div>
        {NAV.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={onClose}
            style={({isActive}) => ({
              display:"flex",alignItems:"center",gap:10,
              padding:"10px 12px",borderRadius:8,marginBottom:2,
              textDecoration:"none",fontWeight:600,fontSize:14,transition:"all .15s",
              background: isActive ? "linear-gradient(135deg,rgba(50,102,204,.25),rgba(0,229,176,.15))" : "transparent",
              color: isActive ? "var(--text)" : "var(--text2)",
              borderLeft: isActive ? "3px solid var(--accent)" : "3px solid transparent",
            })}>
            <span style={{fontSize:16}}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={{padding:"14px 10px",borderTop:"1px solid var(--border)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--bg2)",borderRadius:8,border:"1px solid var(--border)"}}>
          <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,#3266cc,#00e5b0)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#07090f",flexShrink:0}}>
            CX
          </div>
          <div style={{minWidth:0,flex:1}}>
            <div style={{fontSize:13,fontWeight:600}}>CryptX</div>
            <div style={{fontSize:10,color:"var(--text2)",fontFamily:"'JetBrains Mono',monospace"}}>Team CYBER-IV-T073</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
