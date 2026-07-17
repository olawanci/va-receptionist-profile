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
  plusCircle:  `<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M12 8.5v7M8.5 12h7"/></svg>`,
  refreshCw:   `<svg viewBox="0 0 24 24" class="ico"><path d="M21 8a9 9 0 0 0-15.5-2.4L3 8"/><path d="M3 3v5h5"/><path d="M3 16a9 9 0 0 0 15.5 2.4L21 16"/><path d="M21 21v-5h-5"/></svg>`,
  trash:       `<svg viewBox="0 0 24 24" class="ico"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`,
  spinner:     `<svg viewBox="0 0 24 24" class="ico"><path d="M12 3a9 9 0 1 0 9 9" /></svg>`,
  alert:       `<svg viewBox="0 0 24 24" class="ico"><path d="M12 3l9.5 16.5a1 1 0 0 1-.9 1.5H3.4a1 1 0 0 1-.9-1.5L12 3z"/><path d="M12 9v5M12 17h.01"/></svg>`,
  info:        `<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/></svg>`,
};

const USER_AVATAR = "https://i.pravatar.cc/64?img=47";

/* ---------- knowledge sources ---------- */
const files = [
  { name: "Tech design requirements.pdf", size: "200 KB" },
  { name: "Company handbook.pdf",         size: "1.2 MB" },
  { name: "Pricing sheet 2026.pdf",       size: "340 KB" },
  { name: "FAQ – reception.pdf",          size: "88 KB"  },
  { name: "Opening hours.pdf",            size: "42 KB"  },
  { name: "Booking policy.pdf",           size: "156 KB" },
];

/* shared file-item component — used by Knowledge sources AND composer attachments */
function fileStatusHTML(status) {
  return status === "processing"
    ? `<span class="file-status processing"><span class="spin">${ICONS.spinner}</span>Processing…</span>`
    : `<span class="file-status">${ICONS.check}Complete</span>`;
}
function fileItemHTML(f, status) {
  return `
    <div class="file-item" data-file="${f.name}">
      <div class="file-icon">${ICONS.pdf}<span class="lbl">PDF</span></div>
      <div class="file-meta">
        <div class="file-name">${f.name}</div>
        <div class="file-sub"><span>${f.size}</span><span class="sep"></span>${fileStatusHTML(status || "complete")}</div>
      </div>
      <button class="icon-btn" aria-label="Remove file">${ICONS.kebab}</button>
    </div>`;
}

const fileList = document.querySelector(".file-list");
if (fileList) fileList.innerHTML = files.map(f => fileItemHTML(f)).join("");

let docCount = files.length;
function bumpDocCount(delta) {
  docCount += delta;
  const line = document.querySelector(".helper-line");
  if (line) line.textContent = `${docCount} documents uploaded — used by this agent to answer questions`;
}

/* add a file to Knowledge sources with an async processing → complete transition */
function addKnowledgeFile(name, size) {
  const list = document.querySelector(".file-list");
  if (!list) return;
  list.insertAdjacentHTML("beforeend", fileItemHTML({ name, size }, "processing"));
  const row = list.lastElementChild;
  bumpDocCount(1);
  flash(row);
  setTimeout(() => {
    const s = row.querySelector(".file-status");
    if (s) s.outerHTML = fileStatusHTML("complete");
  }, 1600);
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
function removeChip(containerId, label) {
  const c = document.getElementById(containerId);
  if (!c) return;
  const chip = [...c.querySelectorAll(".chip")].find(ch => ch.textContent.includes(label));
  if (chip) chip.remove();
}
function removeSkillRow(title) {
  const list = document.getElementById("skills-list");
  if (!list) return;
  const row = [...list.querySelectorAll(".skill")]
    .find(s => (s.querySelector(".skill-title")?.textContent || "").trim().startsWith(title));
  if (row) row.remove();
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
/* each change: { field, action: 'added' | 'removed' | 'changed', value?, from?, to? }
   Icon encodes the action (Figma 17502-29636): ⊕ added · ⟳ changed · 🗑 removed */
const undoRegistry = {};
let undoSeq = 0;

function renderApplied(changes, undoId) {
  const rows = changes.map(c => {
    let icon, valueHtml;
    if (c.action === "removed") {
      icon = `<span class="applied-ico removed">${ICONS.trash}</span>`;
      valueHtml = `<span class="applied-value remove">${c.value}</span>`;
    } else if (c.action === "changed") {
      icon = `<span class="applied-ico changed">${ICONS.refreshCw}</span>`;
      valueHtml = `<span class="applied-value">${c.to}</span>` +
        (c.from ? `<span class="applied-was">was “${c.from}”</span>` : "");
    } else {
      icon = `<span class="applied-ico added">${ICONS.plusCircle}</span>`;
      valueHtml = `<span class="applied-value">${c.value}</span>`;
    }
    return `
    <div class="applied-row">
      ${icon}
      <span class="applied-field">${c.field}</span>
      <span class="applied-arrow">→</span>
      ${valueHtml}
    </div>`;
  }).join("");
  const n = changes.length;
  return `
    <div class="applied-card">
      <div class="applied-head"><span>Applied to the agent</span><span class="applied-count">${n} change${n > 1 ? "s" : ""}</span></div>
      <div class="applied-body">${rows}</div>
    </div>
    <div class="applied-footer">
      <span class="applied-note">To accept the change click on <b>“Save changes”</b> — nothing reaches callers until you do.</span>
      ${undoId ? `<button class="undo-btn" data-undo="${undoId}">Undo</button>` : ""}
    </div>`;
}

/* ============================================================
   Mocked LLM
   ============================================================ */
const CONVOS = {
  new: {
    intro: `👋 Hi! I'm the <b>AI Composer</b>. I see Tessa is set up but hasn't gone live yet — want a hand finishing the essentials?<br><br>I can write a warmer greeting, add languages, or wire up a booking skill. Tell me what you'd like to do, or pick a nudge below.`,
    suggests: ["Where do I start?", "Write a warmer greeting", "Add a booking skill", "Add a Knowledge Base file"],
  },
  regular: {
    intro: `Welcome back 👋 Tessa's been live and handling calls. I can run a quick <b>configuration audit</b>, tidy your scenarios, or make any change you describe — add, remove, or change anything in the form.<br><br>What would you like to do?`,
    suggests: ["Run a configuration audit", "Add Polish as a language", "Remove Spanish", "Rename Tessa to Emma"],
  },
};

let mode = "new";

const LANG_FLAGS = { "Spanish (Spain)": "🇪🇸", "English (British)": "🇬🇧", "Polish (Poland)": "🇵🇱" };

/* keyword-driven mock responder → returns { text, apply?, revert?, changes?, sections?, suggests? } */
function respond(text) {
  const t = text.toLowerCase();

  // pasted setup prompt / big ask → multi-change combo (Figma flow: 4 changes at once)
  if (text.length > 140 || /set ?up|inbound agent|receptionist for|configure (her|the agent)/.test(t)) {
    const greetNext = "Hi, thanks for calling [Company Name]! I'm Tessa — how can I help you today?";
    const greetInp = document.getElementById("input-greeting");
    const greetPrev = greetInp ? greetInp.value : "";
    return {
      text: `Here's a warmer, more natural setup that still keeps your company name — I've tuned the languages, voice, and greeting in one go:`,
      apply: () => {
        addChip("field-language", "🇵🇱", "Polish (Poland)");
        addChip("field-voice", "🇵🇱", "Polish (Poland)");
        if (greetInp) greetInp.value = greetNext;
        removeChip("field-language", "Spanish (Spain)");
        removeChip("field-voice", "Spanish (Spain)");
        flash(document.getElementById("field-language"));
      },
      revert: () => {
        removeChip("field-language", "Polish (Poland)");
        removeChip("field-voice", "Polish (Poland)");
        if (greetInp) greetInp.value = greetPrev;
        addChip("field-language", "🇪🇸", "Spanish (Spain)");
        addChip("field-voice", "🇪🇸", "Spanish (Spain)");
        flash(document.getElementById("field-language"));
      },
      changes: [
        { field: "Language", action: "added",   value: "Polish (Poland)" },
        { field: "Greeting", action: "changed", to: "“Hi, thanks for calling…”" },
        { field: "Voice",    action: "changed", to: "Amelia, warm female" },
        { field: "Language", action: "removed", value: "Spanish (Spain)" },
      ],
      sections: ["personality"],
      suggests: ["Add a booking skill", "Add a Knowledge Base file"],
    };
  }

  // GUARDRAIL — out of scope for the composer (checked early; no dead end: point elsewhere)
  if (/delete (the )?agent|remove (the )?agent|billing|invoice|refund|my plan|upgrade|cancel (my )?subscription|password/.test(t)) {
    return {
      notice: {
        type: "warning",
        text: `I can only edit this agent's setup. Deleting the agent lives in the <b>⋯</b> menu next to “Test VoiceAgent”, and billing is under <b>Account → Billing</b>.`,
      },
      text: `Want to keep working on Tessa instead?`,
      suggests: ["Improve the greeting", "Add a booking skill", "Run a configuration audit"],
    };
  }

  // ERROR + retry — an action that depends on an external service (needs a connect verb)
  if (/integrat|connect|hubspot|salesforce|\bcrm\b|sync/.test(t)) {
    return {
      notice: {
        type: "error",
        text: `I couldn't reach the calendar service just now, so the booking integration wasn't connected.`,
        action: "Try again",
      },
      text: `Nothing was changed. You can retry, or set it up manually under <b>Integrations</b>.`,
      suggests: ["Add a booking skill", "Run a configuration audit"],
    };
  }

  // ADD a Knowledge Base file → inline file card + adds to Knowledge sources (Figma 17628-8769)
  if (/knowledge|\bfile\b|\bfiles\b|document|upload|\bpdf\b|\bdoc\b/.test(t)) {
    return {
      text: `Done — I've added the following file to Tessa's knowledge base. She'll use it to answer questions once processing finishes:`,
      attachment: { files: [{ name: "Return & refund policy.pdf", size: "184 KB" }] },
      sections: ["knowledge"],
      suggests: ["Add a booking skill", "Run a configuration audit", "Improve the greeting"],
    };
  }

  // REMOVE a language (checked before add so "remove Spanish" doesn't fall through)
  if (/remove|delete|drop/.test(t) && /spanish|english|polish/.test(t)) {
    const lang = /spanish/.test(t) ? "Spanish (Spain)" : /english/.test(t) ? "English (British)" : "Polish (Poland)";
    return {
      text: `Done — I've removed <b>${lang}</b> from Tessa's languages and voices. Callers can no longer be answered in it:`,
      apply: () => {
        removeChip("field-language", lang);
        removeChip("field-voice", lang);
        flash(document.getElementById("field-language"));
      },
      revert: () => {
        addChip("field-language", LANG_FLAGS[lang], lang);
        addChip("field-voice", LANG_FLAGS[lang], lang);
        flash(document.getElementById("field-language"));
      },
      changes: [
        { field: "Language", action: "removed", value: lang },
        { field: "Voice",    action: "removed", value: lang },
      ],
      sections: ["personality"],
      suggests: ["Add Polish as a language", "Rename Tessa to Emma", "Run a configuration audit"],
    };
  }

  // REMOVE a skill
  if (/remove|delete|drop/.test(t) && /skill|message|extract|data/.test(t)) {
    const skill = /extract|data/.test(t) ? "Extract Data" : "Take a message";
    const desc = skill === "Extract Data" ? "Pull data from the conversation" : "Allows the caller to leave a message";
    return {
      text: `Done — I've removed the <b>${skill}</b> skill. Tessa will no longer use it on calls:`,
      apply: () => {
        removeSkillRow(skill);
        flash(document.getElementById("skills-list"));
      },
      revert: () => addSkill(skill, desc),
      changes: [{ field: "Skills", action: "removed", value: skill }],
      sections: ["skills"],
      suggests: ["Add a booking skill", "Run a configuration audit"],
    };
  }

  // CHANGE the agent's name
  if (/rename|change (the )?name|call (her|him|it)/.test(t)) {
    const m = t.match(/(?:to|as) ([a-z]+)\b/);
    const next = m ? m[1][0].toUpperCase() + m[1].slice(1) : "Emma";
    const inp = document.getElementById("input-name");
    const prev = inp ? inp.value : "Tessa";
    return {
      text: `Done — I've renamed the agent to <b>${next}</b>. She'll introduce herself with the new name on every call:`,
      apply: () => {
        if (inp) inp.value = next;
        flash(inp && inp.closest(".input"));
      },
      revert: () => {
        if (inp) inp.value = prev;
        flash(inp && inp.closest(".input"));
      },
      changes: [{ field: "Name", action: "changed", from: prev, to: next }],
      sections: ["personality"],
      suggests: ["Update the greeting to match", "Run a configuration audit"],
    };
  }

  // ADD a language → change lands on the Language + Voice components
  if (/(polish|polski)/.test(t) || (/language|lang/.test(t) && /add|change|set|switch/.test(t))) {
    return {
      text: `Done — I've added <b>Polish (Poland)</b> to Tessa's languages and gave her a matching Polish voice. You can see it in the form:`,
      apply: () => {
        addChip("field-language", "🇵🇱", "Polish (Poland)");
        addChip("field-voice", "🇵🇱", "Polish (Poland)");
        flash(document.getElementById("field-language"));
      },
      revert: () => {
        removeChip("field-language", "Polish (Poland)");
        removeChip("field-voice", "Polish (Poland)");
        flash(document.getElementById("field-language"));
      },
      changes: [
        { field: "Language", action: "added", value: "Polish (Poland)" },
        { field: "Voice",    action: "added", value: "Polish (Poland)" },
      ],
      sections: ["personality"],
      suggests: ["Remove Spanish", "Improve the greeting", "Run a configuration audit"],
    };
  }

  // CHANGE the greeting
  if (/greeting|welcome|hello message|intro/.test(t)) {
    const next = "Hi, thanks for calling [Company Name]! I'm Tessa — how can I help you today?";
    const inp = document.getElementById("input-greeting");
    const prev = inp ? inp.value : "";
    return {
      text: `Done — here's a warmer, more natural greeting that still keeps your company name:`,
      apply: () => {
        if (inp) inp.value = next;
        flash(inp && inp.closest(".input"));
      },
      revert: () => {
        if (inp) inp.value = prev;
        flash(inp && inp.closest(".input"));
      },
      changes: [{ field: "Greeting", action: "changed", from: prev, to: next }],
      sections: ["personality"],
      suggests: ["Add Polish as a language", "Add a booking skill"],
    };
  }

  // ADD a booking skill
  if (/booking|calendar|appointment|schedul/.test(t)) {
    return {
      text: `Done — I've added a <b>Booking</b> skill so Tessa can share your scheduling link and book appointments over SMS:`,
      apply: () => addSkill("Book an appointment", "Shares your scheduling link and books via SMS"),
      revert: () => removeSkillRow("Book an appointment"),
      changes: [{ field: "Skills", action: "added", value: "Book an appointment" }],
      sections: ["skills"],
      suggests: ["Add Transfer to Human", "Remove Take a message", "Run a configuration audit"],
    };
  }

  // ADD transfer to human
  if (/transfer|human|agent|escalat|front desk/.test(t)) {
    return {
      text: `Good call — right now urgent callers can't reach a person. I've added a <b>Transfer to Human</b> skill:`,
      apply: () => addSkill("Transfer to Human", "Routes urgent callers to the front desk"),
      revert: () => removeSkillRow("Transfer to Human"),
      changes: [{ field: "Skills", action: "added", value: "Transfer to Human" }],
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
    text: `Sure — I've noted that. Tell me a bit more and I'll make the change directly in the form. For example, try <i>“add Polish as a language”</i>, <i>“remove Spanish”</i>, or <i>“add a knowledge base file”</i>.`,
    suggests: mode === "new" ? CONVOS.new.suggests : CONVOS.regular.suggests,
  };
}

/* system-notification component — inline banner in the conversation */
function renderNotice(notice) {
  const ico = notice.type === "error" || notice.type === "warning" ? ICONS.alert : ICONS.info;
  const action = notice.action ? `<button class="notice-action" data-retry="1">${notice.action}</button>` : "";
  return `<div class="sys-notice ${notice.type}">${ico}<div class="notice-body"><span>${notice.text}</span>${action}</div></div>`;
}

/* ============================================================
   Composer UI wiring
   ============================================================ */
const msgs = document.getElementById("composer-msgs");
const suggestsEl = document.getElementById("composer-suggests");
const input = document.getElementById("composer-text");
const sendBtn = document.getElementById("composer-send");

function scrollMsgs() { msgs.scrollTop = msgs.scrollHeight; }

function appendMessage(role, html, opts) {
  opts = opts || {};
  const el = document.createElement("div");
  el.className = "msg " + role;
  const avatar = role === "assistant"
    ? ""
    : `<img class="msg-user-avatar" alt="" src="${USER_AVATAR}" />`;
  const noticeHtml = opts.notice ? renderNotice(opts.notice) : "";
  const attachHtml = opts.attachment
    ? `<div class="msg-attachment">${opts.attachment.files.map(f => fileItemHTML(f, "processing")).join("")}</div>`
    : "";
  const appliedHtml = opts.changes && opts.changes.length ? renderApplied(opts.changes, opts.undoId) : "";
  const bubble = html ? `<div class="bubble">${html}</div>` : "";
  el.innerHTML = `${avatar}<div class="msg-col">${noticeHtml}${bubble}${attachHtml}${appliedHtml}</div>`;
  msgs.appendChild(el);
  scrollMsgs();
  return el;
}

function renderSuggests(list) {
  suggestsEl.innerHTML = (list || [])
    .map((s, i) => `<button class="suggest" style="animation-delay:${i * 70}ms">${s}</button>`)
    .join("");
}

function botReply(userText) {
  // animated "Thinking..." state while the mock LLM works
  const thinking = document.createElement("div");
  thinking.className = "msg assistant";
  thinking.innerHTML = `<div class="msg-col"><div class="thinking">Thinking<span class="td">.</span><span class="td">.</span><span class="td">.</span></div></div>`;
  msgs.appendChild(thinking);
  scrollMsgs();
  const delay = 900 + Math.random() * 600;
  setTimeout(() => {
    thinking.remove();
    const r = respond(userText);
    if (r.apply) r.apply();                    // change lands in the form right away
    let undoId = null;
    if (r.revert) { undoId = "u" + (++undoSeq); undoRegistry[undoId] = r.revert; }
    const msgEl = appendMessage("assistant", r.text, {
      changes: r.changes, undoId, attachment: r.attachment, notice: r.notice,
    });
    if (r.attachment) {
      // mirror the file into Knowledge sources, then flip both cards to Complete
      r.attachment.files.forEach(f => addKnowledgeFile(f.name, f.size));
      setTimeout(() => {
        msgEl.querySelectorAll(".msg-attachment .file-status").forEach(s => { s.outerHTML = fileStatusHTML("complete"); });
      }, 1600);
    }
    if (r.sections) markUnsaved(r.sections);   // badge + save bar
    if (r.suggests) renderSuggests(r.suggests); // always re-offer nudges — no dead ends
  }, delay);
}

// Delegated composer actions: Undo a change, or Retry a failed action
msgs.addEventListener("click", (e) => {
  const undo = e.target.closest("[data-undo]");
  if (undo) {
    const id = undo.dataset.undo;
    if (undoRegistry[id]) { undoRegistry[id](); delete undoRegistry[id]; }
    undo.outerHTML = `<span class="undo-done">${ICONS.check}Undone</span>`;
    showToast("Change undone");
    return;
  }
  const retry = e.target.closest("[data-retry]");
  if (retry) {
    // mock a successful retry: connect the booking skill this time
    retry.disabled = true;
    retry.textContent = "Retrying…";
    setTimeout(() => {
      addSkill("Book an appointment", "Shares your scheduling link and books via SMS");
      markUnsaved(["skills"]);
      appendMessage("assistant", `Reconnected on the second try — I've added the <b>Booking</b> skill.`, {
        changes: [{ field: "Skills", action: "added", value: "Book an appointment" }],
      });
      renderSuggests(["Add Transfer to Human", "Run a configuration audit"]);
    }, 900);
  }
});

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

/* ---------- animated input placeholder (typewriter nudges) ---------- */
const PLACEHOLDERS = [
  "Ask the composer to change anything",
  "Try “add Polish as a language”",
  "Try “make the greeting warmer”",
  "Try “remove the Extract Data skill”",
  "Try “rename Tessa to Emma”",
  "Try “run a configuration audit”",
];
let phIndex = 0, phTick = 0;
const PH_HOLD = 28; // ticks to hold the full text before moving on
setInterval(() => {
  if (input.value) return;                    // never animate over the user's text
  const cur = PLACEHOLDERS[phIndex];
  phTick++;
  if (phTick >= cur.length + PH_HOLD) {
    phIndex = (phIndex + 1) % PLACEHOLDERS.length;
    phTick = 0;
  }
  const shown = cur.slice(0, Math.min(phTick, cur.length));
  input.placeholder = shown + (phTick < cur.length ? "▏" : "");
}, 45);

// boot
loadMode("new");
