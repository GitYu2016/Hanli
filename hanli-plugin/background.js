chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "scrapeTemu",
    title: "采集",
    contexts: ["page"]
  });
});


chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "scrapeTemu") {
    // 由于现在使用content_scripts，插件会自动注入
    // 这里只需要触发采集即可
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        // 直接调用content.js中的采集函数
        if (typeof window.scrapeRawData === 'function') {
          console.log('通过右键菜单触发采集');
          window.scrapeRawData();
        } else {
          console.log('采集函数未找到，请确保页面已完全加载');
          alert('采集功能未就绪，请刷新页面后重试');
        }
      }
    });
  }
});
