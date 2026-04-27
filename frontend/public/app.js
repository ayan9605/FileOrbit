// frontend/public/app.js
const API_BASE = '/api';

let authToken = null;

function setToken(token) {
  authToken = token;
  if (token) {
    localStorage.setItem('jwt', token);
  } else {
    localStorage.removeItem('jwt');
  }
}

function getToken() {
  if (authToken) return authToken;
  const stored = localStorage.getItem('jwt');
  if (stored) authToken = stored;
  return authToken;
}

function showAppSection() {
  document.getElementById('auth-section').classList.add('hidden');
  document.getElementById('app-section').classList.remove('hidden');
}

function showAuthSection() {
  document.getElementById('auth-section').classList.remove('hidden');
  document.getElementById('app-section').classList.add('hidden');
}

// Simple helper for auth fetch
async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = options.headers || {};
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return fetch(url, { ...options, headers });
}

// Auth handlers
document.getElementById('signup-btn').addEventListener('click', async () => {
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert('Signup failed');
    return;
  }

  const data = await res.json();
  setToken(data.token);
  showAppSection();
  loadFiles();
});

document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert('Login failed');
    return;
  }

  const data = await res.json();
  setToken(data.token);
  showAppSection();
  loadFiles();
});

document.getElementById('logout-btn').addEventListener('click', () => {
  setToken(null);
  showAuthSection();
});

// Upload handler
document.getElementById('upload-btn').addEventListener('click', async () => {
  const input = document.getElementById('file-input');
  const statusEl = document.getElementById('upload-status');
  if (!input.files.length) {
    alert('Choose a file first');
    return;
  }

  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  statusEl.textContent = 'Uploading...';

  const res = await authFetch(`${API_BASE}/files`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    statusEl.textContent = 'Upload failed';
    return;
  }

  statusEl.textContent = 'Uploaded!';
  input.value = '';
  loadFiles();
});

// Load and render file list
async function loadFiles() {
  const res = await authFetch(`${API_BASE}/files`);
  if (!res.ok) {
    console.error('Failed to load files');
    return;
  }

  const files = await res.json();
  const list = document.getElementById('file-list');
  list.innerHTML = '';

  files.forEach((file) => {
    const li = document.createElement('li');
    li.className = 'file-item';

    const info = document.createElement('div');
    info.className = 'file-info';
    info.innerHTML = `
      <span>${file.originalName}</span>
      <small>${file.mimeType} • ${(file.size / 1024).toFixed(1)} KB</small>
    `;

    const actions = document.createElement('div');
    actions.className = 'file-actions';

    // Preview link
    const previewBtn = document.createElement('button');
    previewBtn.textContent = 'Preview';
    previewBtn.addEventListener('click', () => previewFile(file));

    // Download link
    const downloadBtn = document.createElement('button');
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => {
      const url = `${API_BASE}/files/${file.id}/stream`;
      // Open in new tab with auth header is tricky; simplest: create hidden link
      window.open(url + `?token=${getToken()}`, '_blank');
    });

    // Delete
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', async () => {
      const res = await authFetch(`${API_BASE}/files/${file.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        loadFiles();
      } else {
        alert('Delete failed');
      }
    });

    actions.appendChild(previewBtn);
    actions.appendChild(downloadBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(info);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

// Simple preview modal using new window and token query param
function previewFile(file) {
  const mime = file.mimeType;
  const token = getToken();
  const url = `${API_BASE}/files/${file.id}/stream?token=${token}`;

  // For simplicity open as new tab; you can embed in <img>, <video>, <audio> in same page.
  window.open(url, '_blank');
}

// On load, if token exists, go directly to app
if (getToken()) {
  showAppSection();
  loadFiles();
}
