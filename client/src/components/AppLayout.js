// client/src/components/AppLayout.js
import React, { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="app-bg" style={{display:"flex",minHeight:"100vh",position:"relative"}}>
      <div className="grid-bg" />

      {/* Desktop sidebar */}
      <div style={{position:"sticky",top:0,height:"100vh",flexShrink:0,zIndex:10,display:"flex"}} id="sb-desktop">
        <Sidebar />
      </div>

      {/* Mobile overlay */}
      {open && <div onClick={() => setOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:199,backdropFilter:"blur(4px)"}} />}

      {/* Mobile drawer */}
      <div style={{position:"fixed",top:0,left:0,height:"100%",zIndex:200,transition:"transform .28s ease",transform:open?"translateX(0)":"translateX(-105%)"}} id="sb-mobile">
        <Sidebar onClose={() => setOpen(false)} />
      </div>

      {/* Main */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,position:"relative",zIndex:1}}>
        {/* Mobile topbar */}
        <div style={{display:"none",alignItems:"center",gap:12,padding:"13px 18px",background:"var(--surface)",borderBottom:"1px solid var(--border)",position:"sticky",top:0,zIndex:50}} id="topbar-mobile">
          <button onClick={() => setOpen(true)} style={{background:"none",border:"none",color:"var(--text)",fontSize:22,cursor:"pointer",lineHeight:1}}>☰</button>
          <span style={{fontWeight:800,fontSize:18}}>Crypt<span style={{color:"var(--green)"}}>X</span></span>
        </div>

        <main style={{flex:1,padding:"32px",maxWidth:1080,width:"100%",margin:"0 auto"}}>
          {children}
        </main>
      </div>

      <style>{`
        @media(max-width:767px){
          #sb-desktop{display:none!important}
          #topbar-mobile{display:flex!important}
          main{padding:18px!important}
        }
      `}</style>
    </div>
  );
}
