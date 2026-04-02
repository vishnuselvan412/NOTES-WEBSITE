let notes = JSON.parse(localStorage.getItem('notes-app') || '[]');
let editingId = null;
let deletingId = null;
let selectedColor = 'purple';

// ── Render ──
function renderNotes() {
  const grid = document.getElementById('notes-grid');
  const q = document.getElementById('search-input').value.toLowerCase();

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
  );

  document.getElementById('note-count').textContent =
    notes.length + ' note' + (notes.length !== 1 ? 's' : '');

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📭</div>
        <p>${q ? 'No notes match your search.' : 'No notes yet. Click "+ New Note" to get started!'}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(n => `
    <div class="note-card ${n.color}">
      <div class="note-header">
        <div class="note-title">${escHtml(n.title) || '<span style="color:var(--dim);font-weight:400;">Untitled</span>'}</div>
        <div class="note-actions">
          <button class="action-btn" onclick="openEdit('${n.id}')" title="Edit">✏️</button>
          <button class="action-btn del" onclick="openConfirm('${n.id}')" title="Delete">🗑</button>
        </div>
      </div>
      ${n.body ? `<div class="note-body">${escHtml(n.body)}</div>` : ''}
      <div class="note-footer">
        <span class="note-date">${formatDate(n.updatedAt)}</span>
        <span class="note-color-dot dot-${n.color}"></span>
      </div>
    </div>
  `).join('');
}

// ── Save ──
function saveNote() {
  const title = document.getElementById('note-title-input').value.trim();
  const body  = document.getElementById('note-body-input').value.trim();

  if (!title && !body) { showToast('Please add a title or content!'); return; }

  if (editingId) {
    const idx = notes.findIndex(n => n.id === editingId);
    if (idx > -1) {
      notes[idx] = { ...notes[idx], title, body, color: selectedColor, updatedAt: Date.now() };
    }
    showToast('Note updated!');
  } else {
    notes.unshift({
      id: uid(),
      title,
      body,
      color: selectedColor,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    showToast('Note saved!');
  }

  persist();
  closeModal();
  renderNotes();
}

// ── Edit ──
function openEdit(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Note';
  document.getElementById('note-title-input').value = note.title;
  document.getElementById('note-body-input').value  = note.body;
  selectedColor = note.color;
  document.querySelectorAll('.color-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.color === selectedColor);
  });
  document.getElementById('modal-overlay').classList.remove('hidden');
}

// ── Delete ──
function openConfirm(id) {
  deletingId = id;
  document.getElementById('confirm-overlay').classList.remove('hidden');
}

function closeConfirm() {
  deletingId = null;
  document.getElementById('confirm-overlay').classList.add('hidden');
}

function confirmDelete() {
  notes = notes.filter(n => n.id !== deletingId);
  persist();
  closeConfirm();
  renderNotes();
  showToast('Note deleted.');
}

// ── Modal ──
function openModal() {
  editingId = null;
  selectedColor = 'purple';
  document.getElementById('modal-title').textContent = 'New Note';
  document.getElementById('note-title-input').value = '';
  document.getElementById('note-body-input').value  = '';
  document.querySelectorAll('.color-opt').forEach(el => {
    el.classList.toggle('selected', el.dataset.color === 'purple');
  });
  document.getElementById('modal-overlay').classList.remove('hidden');
  setTimeout(() => document.getElementById('note-title-input').focus(), 100);
}

function closeModal() {
  editingId = null;
  document.getElementById('modal-overlay').classList.add('hidden');
}

// Close modal on overlay click
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ── Color ──
function selectColor(el) {
  selectedColor = el.dataset.color;
  document.querySelectorAll('.color-opt').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

// ── Keyboard shortcuts ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeConfirm(); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); openModal(); }
});

// ── Helpers ──
function persist() {
  localStorage.setItem('notes-app', JSON.stringify(notes));
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Init ──
renderNotes();