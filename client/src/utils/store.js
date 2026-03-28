// client/src/utils/store.js
// Simple localStorage-based stats & history store (no server needed)

const STATS_KEY = "cx_stats";
const HISTORY_KEY = "cx_history";

export function getStats() {
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY)) || { totalEncryptions: 0, totalDecryptions: 0, totalBytesProcessed: 0 };
  } catch {
    return { totalEncryptions: 0, totalDecryptions: 0, totalBytesProcessed: 0 };
  }
}

export function bumpStats(type, bytes) {
  const stats = getStats();
  if (type === "encrypt") stats.totalEncryptions++;
  else stats.totalDecryptions++;
  stats.totalBytesProcessed += bytes || 0;
  localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  return stats;
}

export function getHistory(filter) {
  try {
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    if (filter === "encrypt" || filter === "decrypt") {
      history = history.filter(h => h.operation === filter);
    }
    return history;
  } catch {
    return [];
  }
}

export function addHistory(entry) {
  const history = getHistory();
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const newEntry = { id, ...entry, createdAt: new Date().toISOString() };
  history.unshift(newEntry);
  // Keep max 200 entries
  if (history.length > 200) history.length = 200;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return newEntry;
}

export function deleteHistory(id) {
  let history = getHistory();
  history = history.filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

export function clearHistory() {
  localStorage.setItem(HISTORY_KEY, "[]");
}
