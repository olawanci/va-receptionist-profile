/* ============================================================
   VoiceAgent · Tessa — prototype interactions
   - Knowledge sources list
   - Profile kebab menu
   - AI Composer: New / Regular demo modes + mocked LLM + diff component
   ============================================================ */

/* ---------- icons ---------- */
const ICONS = {
  sparkle: `<svg viewBox="0 0 24 24" class="ico"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.4L12 15l-1.9-4.6L5.5 9l4.6-1.4z"/></svg>`,
  check:   `<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>`,
  pdf:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>`,
  kebab:   `<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></svg>`,
  edit:    `<svg viewBox="0 0 24 24" class="ico"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>`,
  diff:    `<svg viewBox="0 0 24 24" class="ico"><path d="M12 3v6M9 6h6"/><path d="M9 18h6"/><circle cx="12" cy="18" r="0"/></svg>`,
};

/* ---------- knowledge sources ---------- */
const files = [
  { name: "Tech design requirements.pdf", size: "200 KB" },
  { name: "Company handbook.pdf",         size: "1.2 MB" },
  { name: "Pricing sheet 2026.pdf",       size: "340 KB" },
  { name: "FAQ – reception.pdf",          size: "88 KB"  },
  { name: "Opening hours.pdf",            size: "42 KB"  },
  { name: "Booking policy.pdf",           size: "156 KB" },
];
const fileList = document.querySelector(".file-list");
if (fileList) {
  fileList.innerHTML = files.map(f => `
    <div class="file-item">
      <div class="file-icon">${ICONS.pdf}<span class="lbl">PDF</span></div>
      <div class="file-meta">
        <div class="file-name">${f.name}</div>
        <div class="file-sub"><span>${f.size}</span><span class="sep"></span><span class="file-status">${ICONS.check}Complete</span></div>
      </div>
      <button class="icon-btn" aria-label="Remove file">${ICONS.kebab}</button>
    </div>`).join("");
}

/* ---------- profile kebab menu ---------- */
const menuBtn = document.getElementById("profile-menu-btn");
const menu = document.getElementById("profile-menu");
if (menuBtn && menu) {
  menuBtn.addEventListener("click", (e) => { e.stopPropagation(); menu.hidden = !menu.hidden; });
  document.addEventListener("click", (e) => {
    if (!menu.hidden && !menu.contains(e.target) && e.target !== menuBtn) menu.hidden = true;
  });
}

/* ============================================================
   Form helpers — changes surface directly in the components
   ============================================================ */
function flash(el) {
  if (!el) return;
  el.classList.add("field-flash");
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => el.classList.remove("field-flash"), 1400);
}
function addChip(containerId, flag, label) {
  const c = document.getElementById(containerId);
  if (!c) return;
  // avoid duplicates
  if ([...c.querySelectorAll(".chip")].some(ch => ch.textContent.includes(label))) return;
  const chip = document.createElement("span");
  chip.className = "chip chip-new";
  chip.innerHTML = `<span class="flag">${flag}</span>${label}<button class="chip-x">✕</button>`;
  const chevron = c.querySelector(".chev-input");
  c.insertBefore(chip, chevron || null);
}
function addSkill(title, desc) {
  const list = document.getElementById("skills-list");
  if (!list) return;
  const row = document.createElement("div");
  row.className = "skill";
  row.innerHTML = `
    <div class="skill-text">
      <div class="skill-title">${title} <span class="tag tag-added">Added</span></div>
      <div class="skill-desc">${desc}</div>
    </div>
    <button class="btn btn-ghost">${ICONS.edit}Edit</button>`;
  list.appendChild(row);
  flash(row);
}

/* ============================================================
   Unsaved-changes state (badge per section + floating save bar)
   ============================================================ */
const SECTION_LABELS = {
  personality: "Personality",
  knowledge:   "Knowledge sources",
  skills:      "Skills",
  scenarios:   "Scenarios",
};
const unsaved = new Set();

function syncUnsaved() {
  Object.keys(SECTION_LABELS).forEach(k => {
    const h = document.getElementById("sec-" + k);
    if (!h) return;
    const badge = h.querySelector(".badge-unsaved");
    if (unsaved.has(k) && !badge) {
      h.insertAdjacentHTML("beforeend",
        `<span class="badge badge-unsaved"><span class="dot"></span>Unsaved changes</span>`);
    } else if (!unsaved.has(k) && badge) {
      badge.remove();
    }
  });
  const bar = document.getElementById("save-bar");
  if (unsaved.size) {
    document.getElementById("save-bar-sections").textContent =
      [...unsaved].map(k => SECTION_LABELS[k]).join(", ");
    bar.hidden = false;
  } else {
    bar.hidden = true;
  }
}
function markUnsaved(sections) { (sections || []).forEach(s => unsaved.add(s)); syncUnsaved(); }

function showToast(text) {
  const t = document.createElement("div");
  t.className = "save-toast";
  t.innerHTML = `${ICONS.check}${text}`;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("out"), 1800);
  setTimeout(() => t.remove(), 2200);
}

document.getElementById("save-apply").addEventListener("click", () => {
  unsaved.clear(); syncUnsaved();
  showToast("Changes saved — Tessa is up to date");
});
document.getElementById("save-discard").addEventListener("click", () => {
  unsaved.clear(); syncUnsaved();
  showToast("Changes discarded");
});

// manual edits in the form also flag their section as unsaved
document.querySelectorAll("[data-section]").forEach(sec => {
  sec.addEventListener("input", () => markUnsaved([sec.dataset.section]));
});

/* ============================================================
   Applied-changes component (visual diff, no JSON)
   ============================================================ */
function renderApplied(changes) {
  const rows = changes.map(c => `
    <div class="applied-row">
      ${ICONS.check}
      <span class="applied-field">${c.field}</span>
      <span class="applied-arrow">→</span>
      <span class="applied-value">${c.value}</span>
    </div>`).join("");
  const n = changes.length;
  return `
    <div class="applied-card">
      <div class="applied-head">${ICONS.edit}<span>Applied to the agent</span><span class="applied-count">${n} change${n > 1 ? "s" : ""}</span></div>
      <div class="applied-body">${rows}</div>
    </div>
    <div class="applied-note">Nothing is live yet — remember to <b>Save changes</b>, otherwise they won't reach callers. Discard anytime to undo.</div>`;
}

/* ============================================================
   Mocked LLM
   ============================================================ */
const CONVOS = {
  new: {
    intro: `👋 Hi! I'm the <b>AI Composer</b>. I see Tessa is set up but hasn't gone live yet — want a hand finishing the essentials?<br><br>I can write a warmer greeting, add languages, or wire up a booking skill. Tell me what you'd like to do, or pick a nudge below.`,
    suggests: ["Where do I start?", "Write a warmer greeting", "Add Polish as a language", "Add a booking skill"],
  },
  regular: {
    intro: `Welcome back 👋 Tessa's been live and handling calls. I can run a quick <b>configuration audit</b>, tidy your scenarios, or make any change you describe.<br><br>What would you like to do?`,
    suggests: ["Run a configuration audit", "Change language to Polish", "Improve the greeting", "Review scenarios"],
  },
};

let mode = "new";

/* keyword-driven mock responder → returns { text, apply?, changes?, sections?, suggests? } */
function respond(text) {
  const t = text.toLowerCase();

  // change language → change lands on the Language + Voice components
  if (/(polish|polski)/.test(t) || (/language|lang/.test(t) && /add|change|set|switch/.test(t))) {
    return {
      text: `Done — I've added <b>Polish (Poland)</b> to Tessa's languages and gave her a matching Polish voice. You can see it in the form:`,
      apply: () => {
        addChip("field-language", "🇵🇱", "Polish (Poland)");
        addChip("field-voice", "🇵🇱", "Polish (Poland)");
        flash(document.getElementById("field-language"));
      },
      changes: [
        { field: "Language", value: "+ Polish (Poland)" },
        { field: "Voice",    value: "+ Polish (Poland)" },
      ],
      sections: ["personality"],
      suggests: ["Also set Polish as default", "Improve the greeting", "Run a configuration audit"],
    };
  }

  // greeting rewrite
  if (/greeting|welcome|hello message|intro/.test(t)) {
    const next = "Hi, thanks for calling [Company Name]! I'm Tessa — how can I help you today?";
    return {
      text: `Done — here's a warmer, more natural greeting that still keeps your company name:`,
      apply: () => {
        const inp = document.getElementById("input-greeting");
        if (inp) inp.value = next;
        flash(inp && inp.closest(".input"));
      },
      changes: [{ field: "Greeting", value: "warmer, introduces Tessa" }],
      sections: ["personality"],
      suggests: ["Add Polish as a language", "Add a booking skill"],
    };
  }

  // booking skill
  if (/booking|calendar|appointment|schedul/.test(t)) {
    return {
      text: `Done — I've added a <b>Booking</b> skill so Tessa can share your scheduling link and book appointments over SMS:`,
      apply: () => addSkill("Book an appointment", "Shares your scheduling link and books via SMS"),
      changes: [{ field: "Skills", value: "+ Book an appointment" }],
      sections: ["skills"],
      suggests: ["Add Transfer to Human", "Run a configuration audit"],
    };
  }

  // transfer to human
  if (/transfer|human|agent|escalat|front desk/.test(t)) {
    return {
      text: `Good call — right now urgent callers can't reach a person. I've added a <b>Transfer to Human</b> skill:`,
      apply: () => addSkill("Transfer to Human", "Routes urgent callers to the front desk"),
      changes: [{ field: "Skills", value: "+ Transfer to Human" }],
      sections: ["skills"],
      suggests: ["Add an after-hours scenario", "Run a configuration audit"],
    };
  }

  // configuration audit (routine action for Regular)
  if (/audit|review config|check|health|optimi/.test(t)) {
    return {
      text: `Here's a quick <b>configuration audit</b> for Tessa:<br><br>
        ✅ Greeting set &nbsp;·&nbsp; 2 languages &nbsp;·&nbsp; 6 knowledge docs<br>
        ✅ 2 active scenarios (booking link)<br>
        ⚠️ <b>No “Transfer to Human” skill</b> — urgent callers can't reach a person<br>
        ⚠️ <b>Greeting</b> is a bit generic and doesn't introduce Tessa<br><br>
        Want me to fix either of these?`,
      suggests: ["Add Transfer to Human", "Improve the greeting", "Add Polish as a language"],
    };
  }

  // review scenarios
  if (/scenario|rule|workflow/.test(t)) {
    return {
      text: `You have <b>2 scenarios</b>, both from the “booking link” template. They overlap — I'd keep one and add an <b>after-hours</b> scenario so callers outside business hours still get a useful reply. Want me to draft it?`,
      suggests: ["Draft an after-hours scenario", "Run a configuration audit"],
    };
  }

  // "where do I start" (New onboarding nudge)
  if (/start|first|begin|guide|help me|what.*do/.test(t)) {
    return {
      text: `Let's get Tessa live in 3 quick steps:<br><br>
        <b>1.</b> Polish the greeting so she introduces herself<br>
        <b>2.</b> Add the languages your callers speak<br>
        <b>3.</b> Add a booking or transfer skill so she can act<br><br>
        Want to start with the greeting?`,
      suggests: ["Write a warmer greeting", "Add Polish as a language", "Add a booking skill"],
    };
  }

  // generic fallback (mock "adjusting")
  return {
    text: `Sure — I've noted that. Tell me a bit more and I'll make the change directly in the form. For example, try <i>“change the language to Polish”</i>, <i>“make the greeting friendlier”</i>, or <i>“add a booking skill”</i>.`,
    suggests: mode === "new" ? CONVOS.new.suggests : CONVOS.regular.suggests,
  };
}

/* ============================================================
   Composer UI wiring
   ============================================================ */
const msgs = document.getElementById("composer-msgs");
const suggestsEl = document.getElementById("composer-suggests");
const input = document.getElementById("composer-text");
const sendBtn = document.getElementById("composer-send");

function scrollMsgs() { msgs.scrollTop = msgs.scrollHeight; }

function appendMessage(role, html, changes) {
  const el = document.createElement("div");
  el.className = "msg " + role;
  const avatar = role === "assistant" ? `<div class="msg-avatar">${ICONS.sparkle}</div>` : "";
  const appliedHtml = changes && changes.length ? renderApplied(changes) : "";
  el.innerHTML = `${avatar}<div class="msg-col"><div class="bubble">${html}</div>${appliedHtml}</div>`;
  msgs.appendChild(el);
  scrollMsgs();
}

function renderSuggests(list) {
  suggestsEl.innerHTML = (list || []).map(s => `<button class="suggest">${s}</button>`).join("");
}

function botReply(userText) {
  // small "thinking" delay to feel like an LLM
  const thinking = document.createElement("div");
  thinking.className = "msg assistant";
  thinking.innerHTML = `<div class="msg-avatar">${ICONS.sparkle}</div><div class="msg-col"><div class="bubble">…</div></div>`;
  msgs.appendChild(thinking);
  scrollMsgs();
  setTimeout(() => {
    thinking.remove();
    const r = respond(userText);
    if (r.apply) r.apply();                    // change lands in the form right away
    appendMessage("assistant", r.text, r.changes);
    if (r.sections) markUnsaved(r.sections);   // badge + save bar
    if (r.suggests) renderSuggests(r.suggests);
  }, 480);
}

function send(text) {
  const val = (text != null ? text : input.value).trim();
  if (!val) return;
  appendMessage("user", val);
  input.value = "";
  renderSuggests([]);      // clear nudges while replying
  botReply(val);
}

sendBtn.addEventListener("click", () => send());
input.addEventListener("keydown", (e) => { if (e.key === "Enter") send(); });

// suggestion chips
suggestsEl.addEventListener("click", (e) => {
  const b = e.target.closest(".suggest");
  if (b) send(b.textContent);
});

/* ---------- demo mode toggle (prototype only) ---------- */
function loadMode(m) {
  mode = m;
  document.querySelectorAll(".demo-seg").forEach(b => b.classList.toggle("active", b.dataset.mode === m));
  // live-agent banner only makes sense for an agent that's already live
  document.getElementById("live-banner").hidden = m !== "regular";
  unsaved.clear(); syncUnsaved();
  msgs.innerHTML = "";
  appendMessage("assistant", CONVOS[m].intro);
  renderSuggests(CONVOS[m].suggests);
}
document.querySelectorAll(".demo-seg").forEach(b => {
  b.addEventListener("click", () => loadMode(b.dataset.mode));
});

// boot
loadMode("new");
