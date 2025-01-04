// Listen for settings changes from storage
chrome.storage.sync.onChanged.addListener((changes) => {
  // Update character display based on new settings
  updateCharacterDisplay(changes);
});

// Initial setup when content script loads
chrome.storage.sync.get(null, (settings) => {
  // Initialize character display with stored settings
  initializeCharacterDisplay(settings);
});

function updateCharacterDisplay(changes: { [key: string]: chrome.storage.StorageChange }) {
  // Update character display based on changed settings
  console.log('Settings changed:', changes);
  // TODO: Implement character display updates
}

function initializeCharacterDisplay(settings: any) {
  // Initialize character display with stored settings
  console.log('Initializing with settings:', settings);
  // TODO: Implement initial character display
} 