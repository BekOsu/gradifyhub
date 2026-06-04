# GradifyHub English Chrome Extension

A Chrome Extension (Manifest V3) that extracts vocabulary from any webpage and saves it directly to your GradifyHub English vault.

## Setup & Testing

### Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Toggle **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `apps/extension/` directory
5. The extension will appear in your Chrome toolbar

### Using the Extension

1. Navigate to any webpage with content you want to learn from
2. Select text (at least 50 characters)
3. Click the GradifyHub extension icon in the toolbar
4. A popup will appear with extracted vocabulary phrases
5. Click "Save to Vault" on any phrase to add it to your GradifyHub vault

### Features

- **Text Selection**: Automatically captures the selected text from the active tab
- **Vocabulary Analysis**: Sends text to GradifyHub API for intelligent phrase extraction
- **Save to Vault**: Each phrase includes meaning, difficulty level, category, and optional example
- **Authentication**: Handles 401 responses by prompting users to log in
- **Plan Restrictions**: Handles 403 responses for users on free plans
- **Lightweight UI**: Minimal, clean popup interface (360px wide) with GradifyHub branding

## File Structure

- `manifest.json` — MV3 manifest with content script, host permissions, and action configuration
- `popup.html` — Popup UI layout (header, content area, footer with links)
- `popup.js` — Vanilla JavaScript popup logic (text retrieval, API calls, rendering)
- `popup.css` — Popup styles (360px width, green accent color #16a34a)
- `content.js` — Content script that extracts selected text from the webpage
- `background.js` — Service worker (minimal, for future expansion)

## API Integration

The extension calls two GradifyHub API endpoints:

### 1. Analyze Text
```
POST https://gradifyhub.com/api/english/analyze-text
Request: { text: string }
Response: { items: VocabItem[] }
```

### 2. Save Item
```
POST https://gradifyhub.com/api/english/vocab/save
Request: {
  phrase: string,
  meaning: string,
  difficulty: "beginner" | "intermediate" | "advanced",
  category: string,
  example?: string
}
Response: 200 OK on success
```

Both endpoints use `credentials: 'include'` to send the user's session cookie.

## Testing Locally

For local development pointing to `http://localhost:3000`:
1. The manifest already includes `http://localhost:3000/*` in host_permissions
2. Modify `popup.js` line 1 to use `const BASE_URL = 'http://localhost:3000'`
3. Reload the extension in Chrome

## Notes

- Pure vanilla JavaScript (no npm, no bundler)
- No external dependencies
- Runs in Chrome developer mode (no Web Store submission needed)
- Respects user privacy (no data collection, all requests to gradifyhub.com are encrypted)
