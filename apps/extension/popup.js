const BASE_URL = 'https://gradifyhub.com';

const $ = (id) => document.getElementById(id);

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;' }[c])
  );
}

function setStatus(text, visible = true) {
  $('status').style.display = visible ? 'flex' : 'none';
  $('status-text').textContent = text;
}

function showContent(html) {
  $('content').innerHTML = html;
}

async function getSelectedText() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return '';
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelectedText' });
    return (response?.text ?? '').trim();
  } catch {
    return '';
  }
}

async function analyzeText(text) {
  const res = await fetch(`${BASE_URL}/api/english/analyze-text`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return { status: res.status, data: await res.json().catch(() => ({})) };
}

async function saveItem(item) {
  const res = await fetch(`${BASE_URL}/api/english/vocab/save`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  return res.ok;
}

function renderItems(items) {
  if (items.length === 0) {
    showContent('<p class="hint">No useful phrases found. Try selecting more content.</p>');
    return;
  }

  $('item-count').textContent = `${items.length} phrase${items.length !== 1 ? 's' : ''}`;

  showContent(`<div class="items-list">${items.map((item, i) => `
    <div class="item" id="item-${i}">
      <div class="item-row1">
        <span class="item-phrase">${escapeHtml(item.phrase)}</span>
        <span class="badge badge-category">${escapeHtml(item.category)}</span>
        <span class="badge badge-difficulty-${escapeHtml(item.difficulty)}">${escapeHtml(item.difficulty)}</span>
      </div>
      <p class="item-meaning">${escapeHtml(item.meaning)}</p>
      ${item.example ? `<p class="item-example">"${escapeHtml(item.example)}"</p>` : ''}
      <div class="item-footer">
        <button class="btn-save" data-index="${i}">Save to Vault</button>
      </div>
    </div>
  `).join('')}</div>`);

  document.querySelectorAll('.btn-save').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const idx = parseInt(e.currentTarget.dataset.index, 10);
      const item = items[idx];
      if (!item) return;

      e.currentTarget.textContent = 'Saving...';
      e.currentTarget.disabled = true;

      const ok = await saveItem({
        phrase: item.phrase,
        meaning: item.meaning,
        difficulty: item.difficulty,
        category: item.category,
        example: item.example || undefined,
      });

      if (ok) {
        e.currentTarget.textContent = '✓ Saved';
        e.currentTarget.classList.add('saved');
      } else {
        e.currentTarget.textContent = 'Error — retry';
        e.currentTarget.disabled = false;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  $('open-vault').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${BASE_URL}/english/vocab` });
  });
  $('open-mining').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: `${BASE_URL}/english/vocab/mine` });
  });

  const text = await getSelectedText();

  if (!text || text.length < 50) {
    showContent(`<div class="center">
      <p class="hint">Select at least 50 characters of text on any webpage, then click this button.</p>
      <button class="btn btn-outline" id="try-mining">Open Mining Page</button>
    </div>`);
    $('try-mining')?.addEventListener('click', () => {
      chrome.tabs.create({ url: `${BASE_URL}/english/vocab/mine` });
    });
    return;
  }

  setStatus(`Analyzing ${text.length} characters...`);

  const { status, data } = await analyzeText(text);

  setStatus('', false);

  if (status === 401) {
    showContent(`<div class="center">
      <p class="hint">Log in to GradifyHub to use the extension.</p>
      <button class="btn btn-primary" id="login-btn">Log in to GradifyHub</button>
    </div>`);
    $('login-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: `${BASE_URL}/sign-in` });
    });
    return;
  }

  if (status === 403) {
    showContent(`<div class="center">
      <p class="hint">Vocabulary mining requires a GradifyHub Pro plan.</p>
      <button class="btn btn-primary" id="upgrade-btn">Upgrade to Pro</button>
    </div>`);
    $('upgrade-btn').addEventListener('click', () => {
      chrome.tabs.create({ url: `${BASE_URL}/pricing` });
    });
    return;
  }

  if (status !== 200) {
    showContent(`<p class="hint">Something went wrong. Please try again.</p>`);
    return;
  }

  renderItems(data.items ?? []);
});
