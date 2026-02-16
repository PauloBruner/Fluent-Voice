chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    chrome.tabs.sendMessage(tab.id, { toggleFluentVoice: true });

  } catch (err) {
    console.error("Injection failed:", err);
  }
});
