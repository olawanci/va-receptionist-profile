// Render the uploaded knowledge-source documents.
const files = [
  { name: "Tech design requirements.pdf", size: "200 KB" },
  { name: "Company handbook.pdf",         size: "1.2 MB" },
  { name: "Pricing sheet 2026.pdf",       size: "340 KB" },
  { name: "FAQ – reception.pdf",          size: "88 KB"  },
  { name: "Opening hours.pdf",            size: "42 KB"  },
  { name: "Booking policy.pdf",           size: "156 KB" },
];

const pdfSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>`;
const checkSvg = `<svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.5-5"/></svg>`;

const list = document.querySelector(".file-list");
if (list) {
  list.innerHTML = files.map(f => `
    <div class="file-item">
      <div class="file-icon">${pdfSvg}<span class="lbl">PDF</span></div>
      <div class="file-meta">
        <div class="file-name">${f.name}</div>
        <div class="file-sub">
          <span>${f.size}</span>
          <span class="sep"></span>
          <span class="file-status">${checkSvg}Complete</span>
        </div>
      </div>
      <button class="icon-btn" aria-label="Remove file">
        <svg viewBox="0 0 24 24" class="ico"><circle cx="12" cy="5" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></svg>
      </button>
    </div>
  `).join("");
}
