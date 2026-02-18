chrome.action.onClicked.addListener(async (tab) => {

  if (!tab.url ||
      tab.url.startsWith("chrome://") ||
      tab.url.startsWith("chrome-extension://") ||
      tab.url.startsWith("edge://") ||
      tab.url.startsWith("about:")
  ) {
    return;
  }

  try {

    // Apenas envia mensagem
    chrome.tabs.sendMessage(tab.id, {
      toggleFluentVoice: true
    });

  } catch (err) {

    // Se ainda não injetado, injeta UMA vez
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });

    chrome.tabs.sendMessage(tab.id, {
      toggleFluentVoice: true
    });
  }

});
