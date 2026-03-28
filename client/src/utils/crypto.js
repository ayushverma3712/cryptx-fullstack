// client/src/utils/crypto.js
import CryptoJS from "crypto-js";

export const formatSize = (b = 0) => {
  if (b < 1024)           return b + " B";
  if (b < 1024 ** 2)      return (b / 1024).toFixed(1) + " KB";
  if (b < 1024 ** 3)      return (b / 1024 ** 2).toFixed(2) + " MB";
  return (b / 1024 ** 3).toFixed(2) + " GB";
};

export const getFileIcon = (type = "", name = "") => {
  if (name.endsWith(".enc"))        return "🔒";
  if (type.startsWith("image/"))    return "🖼️";
  if (type.startsWith("audio/"))    return "🎵";
  if (type.startsWith("video/"))    return "🎬";
  return "📄";
};

export const getMime = name => {
  const ext = name.split(".").pop().toLowerCase();
  const map = {
    jpg:"image/jpeg", jpeg:"image/jpeg", png:"image/png", gif:"image/gif",
    webp:"image/webp", bmp:"image/bmp", svg:"image/svg+xml", tiff:"image/tiff",
    mp3:"audio/mpeg", wav:"audio/wav", ogg:"audio/ogg", aac:"audio/aac",
    flac:"audio/flac", m4a:"audio/mp4",
    mp4:"video/mp4", avi:"video/x-msvideo", mov:"video/quicktime",
    mkv:"video/x-matroska", webm:"video/webm", flv:"video/x-flv",
  };
  return map[ext] || "application/octet-stream";
};

export const generateKey = (len = 32) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_";
  const arr   = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr).map(b => chars[b % chars.length]).join("");
};

export const keyStrength = pwd => {
  let s = 0;
  if (pwd.length >= 8)  s++;
  if (pwd.length >= 14) s++;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) s++;
  if (/[0-9]/.test(pwd)) s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  const labels = ["","Very Weak","Weak","Fair","Good","Strong"];
  const colors = ["","#ff4d6d","#ff6b35","#ffcc00","#7ed321","#00e5b0"];
  return { score: s, label: labels[Math.min(s, 5)], color: colors[Math.min(s, 5)] };
};

const readBuffer = f => new Promise((res, rej) => {
  const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsArrayBuffer(f);
});
const readText   = f => new Promise((res, rej) => {
  const r = new FileReader(); r.onload = e => res(e.target.result); r.onerror = rej; r.readAsText(f);
});
const wa2u8 = wa => {
  const { words, sigBytes } = wa;
  const u8 = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) u8[i] = (words[i>>>2] >>> (24 - (i % 4) * 8)) & 0xff;
  return u8;
};
const tick = () => new Promise(r => setTimeout(r, 30));

export async function encryptFile(file, password, onProgress) {
  onProgress?.(10, "Reading file...");
  const buf = await readBuffer(file);
  await tick();

  onProgress?.(30, "Deriving key with PBKDF2...");
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key  = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 1000 });
  const iv   = CryptoJS.lib.WordArray.random(128 / 8);
  await tick();

  onProgress?.(60, "Applying AES-256-CBC cipher...");
  const wa        = CryptoJS.lib.WordArray.create(buf);
  const encrypted = CryptoJS.AES.encrypt(wa, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
  await tick();

  onProgress?.(85, "Building encrypted package...");
  const payload = JSON.stringify({
    v: 2,
    salt: salt.toString(),
    iv: iv.toString(),
    ct: encrypted.toString(),
    origName: file.name,
    origType: file.type,
    origSize: file.size,
    encryptedAt: new Date().toISOString(),
  });
  const blob = new Blob([payload], { type: "application/octet-stream" });

  onProgress?.(100, "Done!");
  return { blob, outputName: file.name + ".enc", size: blob.size };
}

export async function decryptFile(file, password, onProgress) {
  onProgress?.(10, "Reading encrypted file...");
  const text = await readText(file);
  await tick();

  onProgress?.(30, "Parsing metadata...");
  let payload;
  try { payload = JSON.parse(text); }
  catch { throw new Error("Invalid .enc file. File may be corrupted."); }

  if (!payload.v || !payload.salt || !payload.iv || !payload.ct) {
    throw new Error("Unrecognized encryption format.");
  }

  onProgress?.(50, "Deriving decryption key...");
  const salt = CryptoJS.enc.Hex.parse(payload.salt);
  const iv   = CryptoJS.enc.Hex.parse(payload.iv);
  const key  = CryptoJS.PBKDF2(password, salt, { keySize: 256 / 32, iterations: 1000 });
  await tick();

  onProgress?.(70, "Decrypting data...");
  let dec;
  try { dec = CryptoJS.AES.decrypt(payload.ct, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }); }
  catch { throw new Error("Decryption error. Wrong password or corrupted file."); }

  if (!dec || dec.sigBytes <= 0) throw new Error("Wrong password. Decryption produced empty output.");

  onProgress?.(90, "Reconstructing original file...");
  const u8   = wa2u8(dec);
  const mime = payload.origType || getMime(payload.origName || "file");
  const blob = new Blob([u8], { type: mime });

  onProgress?.(100, "Done!");
  return { blob, outputName: payload.origName || file.name.replace(".enc",""), size: blob.size, meta: payload };
}

export const downloadBlob = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a   = Object.assign(document.createElement("a"), { href: url, download: name });
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
};
