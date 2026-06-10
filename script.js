/* ═══════════════════════════════════════
   PANKAJ NEGI — PORTFOLIO SCRIPTS
═══════════════════════════════════════ */

// ── Custom Cursor ────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});
(function animateRing() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();




// ── Scroll Reveal (Intersection Observer) ─
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left');
const observer  = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => observer.observe(el));

// ── Hero text reveal on load ─────────────
window.addEventListener('load', () => {
  document.querySelectorAll('#hero .reveal-up').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), 200 + i * 150);
  });
});

// ── Counter animation ────────────────────
function animateCounter(el) {
  const target  = parseFloat(el.dataset.target);
  const decimal = parseInt(el.dataset.decimal);
  const duration = 1500;
  const start    = performance.now();
  const raf = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    const val      = (target * eased).toFixed(decimal);
    el.textContent = val;
    if (progress < 1) requestAnimationFrame(raf);
    else el.textContent = target.toFixed(decimal);
  };
  requestAnimationFrame(raf);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      counterObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

// ── Project Tabs ─────────────────────────
const tabs   = document.querySelectorAll('.proj-tab');
const panels = document.querySelectorAll('.proj-panel');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
    // init spotify chart when switching to it
    if (tab.dataset.tab === 'spotify') renderSpotifyChart('danceability');
  });
});

// ── DEMO 1: Healthcare Symptom Checker ───
const SYMPTOM_RESPONSES = {
  default: (s) => `**Analyzing symptoms:** "${s}"\n\n🔍 **Possible Conditions Detected:**\n• Viral Syndrome (confidence: 84%)\n• Common Cold (confidence: 71%)\n• Seasonal Flu (confidence: 63%)\n\n⚠️ **Recommendation:** Rest, stay hydrated. Consult a physician if symptoms worsen.\n\n_(Powered by DeepSeek R1 + Llama 3.3 — 92% accuracy on 800+ conditions)_`,
  fever:    `**Symptom: Fever detected**\n\n🔍 **Differential Diagnosis:**\n• Viral Infection (confidence: 89%)\n• Bacterial Infection (confidence: 67%)\n• Dengue Fever (confidence: 34%)\n\n⚠️ **Recommendation:** Monitor temperature. Seek immediate care if > 103°F.`,
  headache: `**Symptom: Headache analysis**\n\n🔍 **Possible Causes:**\n• Tension Headache (confidence: 91%)\n• Migraine (confidence: 58%)\n• Dehydration (confidence: 72%)\n\n⚠️ **Recommendation:** Rest in a dark room. Drink water. Avoid screens.`,
  chest:    `**⚠️ ALERT: Chest pain detected**\n\n🚨 This symptom requires immediate attention.\n\n🔍 **Urgent Differentials:**\n• Musculoskeletal strain (confidence: 52%)\n• Cardiac concern (confidence: 31%)\n\n⛑️ **Action:** Please consult a doctor immediately or call emergency services.`,
  fatigue:  `**Symptom: Fatigue analysis**\n\n🔍 **Possible Conditions:**\n• Anemia (confidence: 78%)\n• Sleep Disorder (confidence: 81%)\n• Thyroid Dysfunction (confidence: 55%)\n\n⚠️ **Recommendation:** Blood tests recommended. Improve sleep hygiene.`,
};

function addHealthMsg(text, cls) {
  const chat = document.getElementById('healthChat');
  const div  = document.createElement('div');
  div.className = 'chat-msg ' + cls;
  div.innerHTML = text.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>');
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
function handleSymptom() {
  const input = document.getElementById('symptomInput');
  const val   = input.value.trim();
  if (!val) return;
  addHealthMsg(val, 'user');
  input.value = '';
  const key = Object.keys(SYMPTOM_RESPONSES).find(k => k !== 'default' && val.toLowerCase().includes(k));
  const resp = key ? SYMPTOM_RESPONSES[key] : SYMPTOM_RESPONSES.default(val);
  setTimeout(() => addHealthMsg('🤖 Analyzing...', 'ai'), 400);
  setTimeout(() => {
    const msgs = document.getElementById('healthChat').querySelectorAll('.chat-msg');
    msgs[msgs.length - 1].remove();
    addHealthMsg(resp, 'ai');
  }, 1500);
}
document.getElementById('symptomSend').addEventListener('click', handleSymptom);
document.getElementById('symptomInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleSymptom(); });

// ── DEMO 2: EduRAG ReAct Chain ───────────
const REACT_CHAINS = {
  default: (q) => [
    { icon: '🧠', label: 'THOUGHT', cls: 'step-thought',  text: `Query received: "${q}". I need to search across multiple knowledge sources to answer this accurately.` },
    { icon: '🔧', label: 'ACTION',  cls: 'step-action',   text: 'Tool: vector_search(query="' + q + '", db=ChromaDB, top_k=10)' },
    { icon: '📄', label: 'OBSERVE', cls: 'step-result',   text: 'Retrieved 10 chunks. Relevance scores: [0.94, 0.91, 0.88, 0.85, 0.82...]. Applying CRAG filter...' },
    { icon: '🔧', label: 'ACTION',  cls: 'step-action',   text: 'Tool: web_search(query="' + q + ' latest research 2025")' },
    { icon: '📄', label: 'OBSERVE', cls: 'step-result',   text: 'Found 3 relevant web sources. Merging with vector results using HyDE embeddings...' },
    { icon: '🧠', label: 'THOUGHT', cls: 'step-thought',  text: 'I have enough context from 13 sources. Generating final answer with Llama 3.3...' },
    { icon: '✅', label: 'ANSWER',  cls: 'step-result',   text: 'Answer generated in 0.87s across 129k+ knowledge chunks. Confidence: 96.3%' },
  ]
};
function renderReactSteps(steps) {
  const container = document.getElementById('reactSteps');
  container.innerHTML = '';
  steps.forEach((s, i) => {
    setTimeout(() => {
      const div = document.createElement('div');
      div.className = 'react-step';
      div.style.animationDelay = i * 0.1 + 's';
      div.innerHTML = `<span class="step-icon">${s.icon}</span><div class="step-text"><div class="step-label ${s.cls}">${s.label}</div>${s.text}</div>`;
      container.appendChild(div);
    }, i * 600);
  });
}
function handleReact() {
  const input = document.getElementById('reactQuery');
  const val   = input.value.trim();
  if (!val) return;
  input.value = '';
  const chain = REACT_CHAINS.default(val);
  renderReactSteps(chain);
}
document.getElementById('reactSend').addEventListener('click', handleReact);
document.getElementById('reactQuery').addEventListener('keydown', e => { if (e.key === 'Enter') handleReact(); });

// ── DEMO 3: Stock Chatbot ─────────────────
const STOCK_DATA = {
  infosys: { verdict:'BUY', price:'₹1,842', change:'+2.4%', pe:'27.3', sector:'IT Services', reason:'Strong Q3 results, AI-driven deal wins, solid dividend yield. Digital transformation pipeline expanding in US & Europe.' },
  tcs: { verdict:'HOLD', price:'₹3,967', change:'+0.8%', pe:'31.2', sector:'IT Services', reason:'Premium valuation limits upside. Stable large deal momentum but margin pressures from wage hikes. Good for long-term SIP.' },
  hdfc: { verdict:'BUY', price:'₹1,723', change:'+1.9%', pe:'19.4', sector:'Banking', reason:'Best-in-class asset quality. Strong credit growth in retail & MSME. Merger synergies with HDFC Ltd playing out well.' },
  reliance: { verdict:'HOLD', price:'₹2,891', change:'-0.3%', pe:'28.7', sector:'Conglomerate', reason:'Jio and retail verticals growing but O2C margins subdued. New energy bets long-term positive. Near-term consolidation likely.' },
  wipro: { verdict:'HOLD', price:'₹512', change:'+1.1%', pe:'22.1', sector:'IT Services', reason:'Revenue recovery gradual. Strategic acquisitions adding capabilities. Valuation reasonable but execution risks remain.' },
};
function getStockKey(input) {
  const i = input.toLowerCase();
  if (i.includes('infosys') || i.includes('infy')) return 'infosys';
  if (i.includes('tcs')) return 'tcs';
  if (i.includes('hdfc')) return 'hdfc';
  if (i.includes('reliance') || i.includes('ril')) return 'reliance';
  if (i.includes('wipro')) return 'wipro';
  return null;
}
function addStockMsg(html, cls) {
  const chat = document.getElementById('stockChat');
  const div  = document.createElement('div');
  div.className = 'chat-msg ' + cls;
  div.innerHTML  = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}
function handleStock() {
  const input = document.getElementById('stockInput');
  const val   = input.value.trim();
  if (!val) return;
  addStockMsg(val, 'user');
  input.value = '';
  const key  = getStockKey(val);
  setTimeout(() => addStockMsg('🔍 Retrieving live data from Screener & Yahoo Finance...', 'ai'), 400);
  setTimeout(() => {
    const msgs = document.getElementById('stockChat').querySelectorAll('.chat-msg');
    msgs[msgs.length - 1].remove();
    if (key) {
      const d = STOCK_DATA[key];
      const vc = d.verdict === 'BUY' ? 'verdict-buy' : d.verdict === 'SELL' ? 'verdict-sell' : 'verdict-hold';
      addStockMsg(
        `<strong>${key.toUpperCase()} Analysis</strong><br>
         Price: ${d.price} <span style="color:var(--accent-2)">${d.change}</span><br>
         P/E: ${d.pe} | Sector: ${d.sector}<br><br>
         ${d.reason}<br><br>
         <strong>Verdict: ${d.verdict}</strong>`, vc
      );
    } else {
      addStockMsg(`I don't have live data for that ticker in this demo. Try: Infosys, TCS, HDFC Bank, Reliance, or Wipro.`, 'ai');
    }
  }, 1800);
}
document.getElementById('stockSend').addEventListener('click', handleStock);
document.getElementById('stockInput').addEventListener('keydown', e => { if (e.key === 'Enter') handleStock(); });

// ── DEMO 4: Spotify Bar Chart ─────────────
const SPOTIFY_DATA = {
  danceability: { labels: ['Pop', 'Hip-Hop', 'EDM', 'Rock', 'Jazz', 'Classical'], values: [82, 79, 74, 52, 58, 28] },
  energy:       { labels: ['Pop', 'Hip-Hop', 'EDM', 'Rock', 'Jazz', 'Classical'], values: [72, 68, 91, 84, 55, 32] },
  valence:      { labels: ['Pop', 'Hip-Hop', 'EDM', 'Rock', 'Jazz', 'Classical'], values: [64, 52, 71, 48, 66, 43] },
  acousticness: { labels: ['Pop', 'Hip-Hop', 'EDM', 'Rock', 'Jazz', 'Classical'], values: [18, 12, 5, 22, 71, 89] },
};
function renderSpotifyChart(feature) {
  const chart = document.getElementById('spotifyChart');
  const data  = SPOTIFY_DATA[feature];
  const max   = Math.max(...data.values);
  chart.innerHTML = '';
  data.labels.forEach((lbl, i) => {
    const pct = (data.values[i] / max) * 100;
    const item = document.createElement('div');
    item.className = 'bar-item';
    item.innerHTML = `<div class="bar" style="height:0px" data-h="${pct}"></div><div class="bar-label">${lbl}</div>`;
    chart.appendChild(item);
  });
  requestAnimationFrame(() => {
    chart.querySelectorAll('.bar').forEach(bar => {
      bar.style.height = bar.dataset.h + 'px';
    });
  });
}
document.querySelectorAll('.chart-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderSpotifyChart(btn.dataset.feature);
  });
});
// Init chart when spotify panel first becomes visible
const spotifyTab = document.getElementById('tab-spotify');
if (spotifyTab) {
  // render on first click handled in tab click above
}
// If spotify is initial active, render it
if (document.getElementById('panel-spotify').classList.contains('active')) {
  renderSpotifyChart('danceability');
}

// ── Smooth nav scroll ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const el = document.querySelector(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Active nav link highlight on scroll ──
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active-nav'));
      const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
      if (active) active.classList.add('active-nav');
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => sectionObserver.observe(s));
