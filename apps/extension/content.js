chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'getSelectedText') {
    const text = (window.getSelection()?.toString() ?? '').trim();
    sendResponse({ text });
  }
  return true;
});
