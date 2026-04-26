/* ═══════════════════════════
   DOM REFS
═══════════════════════════ */
const sendBtn      = document.getElementById('send-btn');
const inputEl      = document.getElementById('user-input');
const chatBox      = document.getElementById('chat-box');
const emptyState   = document.getElementById('empty-state');
const newChatBtn   = document.getElementById('new-chat-btn');
const historyList  = document.getElementById('history-list');
const noHistory    = document.getElementById('no-history');
const statusDot    = document.getElementById('status-dot');
const statusText   = document.getElementById('status-text');
const menuToggle   = document.getElementById('menu-toggle');
const sidebar      = document.getElementById('sidebar');
const resetChk     = document.getElementById('reset-checklist');
const chatWrapper  = document.getElementById('chat-wrapper');

/* ═══════════════════════════
   STATE
═══════════════════════════ */
const STORAGE_KEY = 'explorebuddy_sessions';
const CHECK_KEY   = 'explorebuddy_checklist';

let sessions     = loadSessions();   // [{ id, title, conversation }]
let activeId     = null;             // current session id
let conversation = [];

/* ═══════════════════════════
   INIT
═══════════════════════════ */
renderHistoryList();
loadChecklistState();
checkApiStatus();
setInterval(checkApiStatus, 30000);

/* ═══════════════════════════
   API STATUS
═══════════════════════════ */
async function checkApiStatus() {
  try {
    const r = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation: [{ role: 'user', text: 'ping' }] })
    });
    if (r.ok) {
      statusDot.className  = 'status-dot online';
      statusText.textContent = 'API Status: Online';
    } else throw new Error();
  } catch {
    statusDot.className  = 'status-dot offline';
    statusText.textContent = 'API Status: Offline';
  }
}

/* ═══════════════════════════
   TEXTAREA AUTO-RESIZE
═══════════════════════════ */
inputEl.addEventListener('input', () => {
  inputEl.style.height = 'auto';
  inputEl.style.height = Math.min(inputEl.scrollHeight, 180) + 'px';
  sendBtn.disabled = inputEl.value.trim() === '';
});

inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!sendBtn.disabled) handleSend(); }
});
sendBtn.addEventListener('click', handleSend);

/* ═══════════════════════════
   SUGGESTION CARDS
═══════════════════════════ */
document.querySelectorAll('.sug-card').forEach(c => {
  c.addEventListener('click', () => { inputEl.value = c.dataset.text; triggerInput(); handleSend(); });
});

/* ═══════════════════════════
   DESTINATION BADGES
═══════════════════════════ */
document.querySelectorAll('.dest-badge').forEach(b => {
  b.addEventListener('click', () => {
    const city = b.dataset.city;
    inputEl.value = `Apa saja wisata terbaik di ${city}?`;
    triggerInput();
    handleSend();
    // Close sidebar on mobile
    sidebar.classList.remove('open');
  });
});

/* ═══════════════════════════
   NEW CHAT
═══════════════════════════ */
newChatBtn.addEventListener('click', startNewChat);

function startNewChat() {
  activeId     = null;
  conversation = [];
  chatBox.innerHTML = '';
  document.querySelectorAll('.history-item').forEach(i => i.classList.remove('active'));
  showEmpty();
  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;
}

/* ═══════════════════════════
   MOBILE MENU
═══════════════════════════ */
menuToggle?.addEventListener('click', () => sidebar.classList.toggle('open'));

/* ═══════════════════════════
   CHECKLIST PERSISTENCE
═══════════════════════════ */
document.querySelectorAll('.check-item input').forEach((cb, i) => {
  cb.addEventListener('change', saveChecklistState);
});

function saveChecklistState() {
  const states = [...document.querySelectorAll('.check-item input')].map(cb => cb.checked);
  localStorage.setItem(CHECK_KEY, JSON.stringify(states));
}
function loadChecklistState() {
  const saved = JSON.parse(localStorage.getItem(CHECK_KEY) || '[]');
  document.querySelectorAll('.check-item input').forEach((cb, i) => {
    if (saved[i] !== undefined) cb.checked = saved[i];
  });
}
resetChk?.addEventListener('click', () => {
  document.querySelectorAll('.check-item input').forEach(cb => cb.checked = false);
  saveChecklistState();
});

/* ═══════════════════════════
   SEND MESSAGE
═══════════════════════════ */
async function handleSend() {
  const text = inputEl.value.trim();
  if (!text) return;

  // First message in session → create session
  if (!activeId) {
    activeId = Date.now().toString();
    const title = text.slice(0, 48) + (text.length > 48 ? '…' : '');
    sessions.unshift({ id: activeId, title, conversation: [] });
    saveSessions();
    renderHistoryList();
    highlightActive(activeId);
  }

  hideEmpty();
  appendUserMsg(text);
  conversation.push({ role: 'user', text });

  inputEl.value = '';
  inputEl.style.height = 'auto';
  sendBtn.disabled = true;

  const typingRow = appendTyping();

  try {
    const res  = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation })
    });
    const data = await res.json();
    typingRow.remove();

    if (res.ok && data.result) {
      appendBotMsg(data.result);
      conversation.push({ role: 'model', text: data.result });
      // Persist updated conversation
      const sess = sessions.find(s => s.id === activeId);
      if (sess) { sess.conversation = [...conversation]; saveSessions(); }
    } else throw new Error(data.error || 'Server error');
  } catch (err) {
    typingRow.remove();
    appendBotMsg('⚠️ Terjadi kesalahan: ' + err.message);
  }
}

/* ═══════════════════════════
   SESSION STORAGE
═══════════════════════════ */
function loadSessions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveSessions() { localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions)); }

function renderHistoryList() {
  historyList.innerHTML = '';
  if (!sessions.length) {
    historyList.appendChild(noHistory);
    noHistory.style.display = '';
    return;
  }
  sessions.forEach(sess => {
    const item = document.createElement('div');
    item.className = 'history-item' + (sess.id === activeId ? ' active' : '');
    item.dataset.id = sess.id;
    item.innerHTML = `
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span class="history-item-text">${escHtml(sess.title)}</span>
      <button class="history-item-del" data-id="${sess.id}" title="Hapus">✕</button>
    `;
    item.addEventListener('click', e => {
      if (e.target.closest('.history-item-del')) return;
      loadSession(sess.id);
    });
    item.querySelector('.history-item-del').addEventListener('click', e => {
      e.stopPropagation();
      deleteSession(sess.id);
    });
    historyList.appendChild(item);
  });
}

function loadSession(id) {
  const sess = sessions.find(s => s.id === id);
  if (!sess) return;
  activeId     = id;
  conversation = [...sess.conversation];
  chatBox.innerHTML = '';

  if (conversation.length === 0) { showEmpty(); return; }
  hideEmpty();

  conversation.forEach(msg => {
    if (msg.role === 'user') appendUserMsg(msg.text, false);
    else appendBotMsg(msg.text, false);
  });
  highlightActive(id);
  scrollBottom();
}

function deleteSession(id) {
  sessions = sessions.filter(s => s.id !== id);
  saveSessions();
  if (activeId === id) startNewChat();
  else renderHistoryList();
}

function highlightActive(id) {
  document.querySelectorAll('.history-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === id);
  });
}

/* ═══════════════════════════
   UI HELPERS
═══════════════════════════ */
function showEmpty() { emptyState.style.display = 'flex'; chatBox.style.display = 'none'; }
function hideEmpty() { emptyState.style.display = 'none'; chatBox.style.display = 'flex'; }
function triggerInput() { inputEl.dispatchEvent(new Event('input')); }
function scrollBottom() { chatWrapper.scrollTop = chatWrapper.scrollHeight; }

function appendUserMsg(text, scroll = true) {
  const row = document.createElement('div');
  row.className = 'message-row user';
  row.innerHTML = `
    <div class="bubble user">${escHtml(text).replace(/\n/g, '<br>')}</div>
    <div class="avatar user-av">C</div>
  `;
  chatBox.appendChild(row);
  if (scroll) scrollBottom();
}

function appendTyping() {
  const row = document.createElement('div');
  row.className = 'message-row bot';
  row.innerHTML = `
    <div class="avatar bot-av">🧭</div>
    <div class="bubble bot"><div class="typing-indicator"><span></span><span></span><span></span></div></div>
  `;
  chatBox.appendChild(row);
  scrollBottom();
  return row;
}

function appendBotMsg(text, scroll = true) {
  const row = document.createElement('div');
  row.className = 'message-row bot';
  const bubble = document.createElement('div');
  bubble.className = 'bubble bot';
  bubble.innerHTML = formatResponse(text);
  row.appendChild(Object.assign(document.createElement('div'), { className: 'avatar bot-av', textContent: '🧭' }));
  row.appendChild(bubble);
  chatBox.appendChild(row);
  if (scroll) scrollBottom();
}

/* ═══════════════════════════
   RESPONSE FORMATTER
═══════════════════════════ */
function formatResponse(raw) {
  raw = raw.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();

  const lines = raw.split('\n');
  let html = '', inList = false, inCat = false, tipLines = [];

  const closeList = () => { if (inList) { html += '</ul></div>'; inList = false; inCat = false; } };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) { closeList(); continue; }

    // Heading ## or bold-only line
    if (/^#{1,3}\s/.test(line) || /^\*\*[^*]+\*\*$/.test(line)) {
      closeList();
      const title = line.replace(/^#{1,3}\s*/, '').replace(/^\*\*|\*\*$/g, '');
      html += `<div class="cat-block"><div class="cat-title">${escHtml(title)}</div>`;
      html += `<ul class="place-list">`;
      inCat = true; inList = true;
      continue;
    }

    // HR
    if (/^---+$/.test(line)) { closeList(); html += '<hr>'; continue; }

    // Bullet point
    if (/^[\*\-]\s+/.test(line)) {
      const content = line.replace(/^[\*\-]\s+/, '');

      if (!inList) {
        html += `<div class="cat-block"><ul class="place-list">`;
        inList = true; inCat = true;
      }

      // Bold name + description: **Name** - desc  OR  **Name**: desc
      const nameMatch = content.match(/^\*\*(.*?)\*\*[:\-–]?\s*(.*)/);
      if (nameMatch) {
        const desc = nameMatch[2] || (lines[i+1] && !/^[\*\-\#]/.test(lines[i+1].trim()) ? lines[++i].trim() : '');
        html += `<li class="place-card"><div class="place-name">${escHtml(nameMatch[1])}</div>${desc ? `<div class="place-desc">${escHtml(desc)}</div>` : ''}</li>`;
      } else {
        html += `<li class="place-card"><div class="place-desc">${inlineFmt(content)}</div></li>`;
      }
      continue;
    }

    closeList();

    // Detect tips section: lines starting with 💡 or "Tips"
    if (/^(💡|✅|🔔|Tips|Tip\b)/i.test(line)) {
      html += `<div class="tips-block"><div class="tips-label">💡 Tips Perjalanan</div><div class="tips-text">${inlineFmt(line.replace(/^(💡|✅|🔔|Tips?:?\s*)/i,''))}</div></div>`;
      continue;
    }

    // Regular paragraph
    html += `<p>${inlineFmt(line)}</p>`;
  }

  closeList();
  return html || `<p>${inlineFmt(raw)}</p>`;
}

function inlineFmt(str) {
  return escHtml(str)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}