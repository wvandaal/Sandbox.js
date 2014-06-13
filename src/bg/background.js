window.settings = {};

function getSettings( callback ) {
  chrome.storage.sync.get('settings', function(items) {
    if (items.settings) 
      settings = items.settings;
    else {
      settings = {
        aliases: {},
        tracking: true
      };

      chrome.storage.sync.set({settings: settings});
    }

    if (callback && typeof callback === 'function')
      callback();
  });
}

getSettings();

chrome.storage.onChanged.addListener(function(changes) {
  settings = changes.settings;
});


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
  if (request.retrieve === 'settings') {
    if (!settings.aliases) {
      getSettings(function() {
        sendResponse({'settings': settings});
      });
    } else {
      sendResponse({'settings': settings});
    }
  }
});

