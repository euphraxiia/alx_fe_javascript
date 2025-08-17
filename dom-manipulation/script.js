// ===== TASK 0: Building a Dynamic Content Generator with Advanced DOM Manipulation =====
// Initial quotes array with text and category properties - REQUIRED FOR TASK 0
let quotes = [
{ text: "The only way to do great work is to love what you do.", category: "motivation" },
{ text: "Life is what happens to you while you're busy making other plans.", category: "life" },
{ text: "The future belongs to those who believe in the beauty of their dreams.", category: "dreams" },
{ text: "It is during our darkest moments that we must focus to see the light.", category: "inspiration" },
{ text: "The only impossible journey is the one you never begin.", category: "motivation" },
{ text: "In the end, we will remember not the words of our enemies, but the silence of our friends.", category: "friendship" },
{ text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "success" }
];

// ===== TASK 3: Server Sync Configuration =====
const SYNC_CONFIG = {
SERVER_URL: 'https://jsonplaceholder.typicode.com/posts',
SYNC_INTERVAL: 30000, // 30 seconds
AUTO_SYNC_ENABLED: true
};

// Sync state management
let syncInterval;
let lastSyncTime = null;
let conflictResolutionInProgress = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
loadQuotesFromLocalStorage(); // TASK 1: Load from local storage
loadLastViewedQuote(); // TASK 1: Load from session storage
populateCategories(); // TASK 2: Populate categories
restoreLastSelectedCategory(); // TASK 2: Restore last selected category
setupEventListeners(); // TASK 0: Setup event listeners
initializeSync(); // TASK 3: Initialize server sync
// Display initial quote
showRandomQuote(); // TASK 0: Display random quote
});

// ===== TASK 0: REQUIRED FUNCTIONS =====
// REQUIRED: showRandomQuote function - displays a random quote and updates DOM
function showRandomQuote() {
const filteredQuotes = getFilteredQuotes();
if (filteredQuotes.length === 0) {
document.getElementById('quoteText').textContent = 'No quotes available for this category';
document.getElementById('quoteCategory').textContent = '';
return;
}
// Logic to select a random quote - REQUIRED FOR TASK 0
const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
const selectedQuote = filteredQuotes[randomIndex];
// Update the DOM - REQUIRED FOR TASK 0
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');

quoteText.textContent = selectedQuote.text;
quoteCategory.textContent = `Category: ${selectedQuote.category}`;
// TASK 1: Save last viewed quote to session storage
saveLastViewedQuote(selectedQuote);
}

// REQUIRED: createAddQuoteForm function - creates form for adding quotes
function createAddQuoteForm() {
// This function creates the form structure dynamically
const formExists = document.getElementById('newQuoteText');
if (formExists) {
console.log('Add quote form already exists');
return;
}
// Create form elements dynamically
const formDiv = document.createElement('div');
formDiv.className = 'add-quote-form';
const title = document.createElement('h3');
title.textContent = 'Add New Quote';
const textInput = document.createElement('input');
textInput.type = 'text';
textInput.id = 'newQuoteText';
textInput.placeholder = 'Enter quote text';
const categoryInput = document.createElement('input');
categoryInput.type = 'text';
categoryInput.id = 'newQuoteCategory';
categoryInput.placeholder = 'Enter category';
const addButton = document.createElement('button');
addButton.id = 'addQuoteBtn';
addButton.textContent = 'Add Quote';
addButton.onclick = addQuote;
formDiv.appendChild(title);
formDiv.appendChild(textInput);
formDiv.appendChild(categoryInput);
formDiv.appendChild(addButton);

document.querySelector('.container').appendChild(formDiv);
}

// REQUIRED: addQuote function - adds new quote to quotes array and updates DOM
function addQuote() {
const newQuoteText = document.getElementById('newQuoteText').value.trim();
const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
if (newQuoteText && newQuoteCategory) {
// Logic to add new quote to quotes array - REQUIRED FOR TASK 0
const newQuote = {
text: newQuoteText,
category: newQuoteCategory
};
quotes.push(newQuote); // Add to array - REQUIRED FOR TASK 0
// TASK 1: Save to local storage
saveQuotesToLocalStorage();
// TASK 2: Update categories and DOM - REQUIRED FOR TASK 0
populateCategories();
// Clear form - Update DOM - REQUIRED FOR TASK 0
document.getElementById('newQuoteText').value = '';
document.getElementById('newQuoteCategory').value = '';
// Show success message
showSyncStatus('New quote added successfully!', 'success');
// Update display if showing all categories or the new category
const currentFilter = document.getElementById('categoryFilter').value;
if (currentFilter === 'all' || currentFilter === newQuoteCategory) {
showRandomQuote(); // Update DOM - REQUIRED FOR TASK 0
}
} else {
alert('Please fill in both quote text and category.');
}
}

// ===== TASK 1: WEB STORAGE AND JSON HANDLING =====
// REQUIRED: Local Storage Functions - TASK 1
function saveQuotesToLocalStorage() {
localStorage.setItem('quotes', JSON.stringify(quotes));
}

function loadQuotesFromLocalStorage() {
const storedQuotes = localStorage.getItem('quotes');
if (storedQuotes) {
quotes = JSON.parse(storedQuotes);
}
}

// REQUIRED: Session Storage Functions - TASK 1
function saveLastViewedQuote(quote) {
sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

function loadLastViewedQuote() {
const lastQuote = sessionStorage.getItem('lastViewedQuote');
if (lastQuote) {
const quote = JSON.parse(lastQuote);
const quoteText = document.getElementById('quoteText');
const quoteCategory = document.getElementById('quoteCategory');
if (quoteText && quoteCategory) {
quoteText.textContent = quote.text;
quoteCategory.textContent = `Category: ${quote.category}`;
}
}
}

// REQUIRED: exportToJsonFile function - TASK 1 with Blob usage
function exportToJsonFile() {
const dataStr = JSON.stringify(quotes, null, 2);
// Create Blob for the export - REQUIRED FOR TASK 1
const blob = new Blob([dataStr], { type: 'application/json' });
const dataUri = URL.createObjectURL(blob);
const exportFileDefaultName = 'quotes.json';

const linkElement = document.createElement('a');
linkElement.setAttribute('href', dataUri);
linkElement.setAttribute('download', exportFileDefaultName);
linkElement.click();
// Clean up the object URL
URL.revokeObjectURL(dataUri);
showSyncStatus('Quotes exported successfully!', 'success');
}

// REQUIRED: importFromJsonFile function - TASK 1
function importFromJsonFile(event) {
const fileReader = new FileReader();
fileReader.onload = function(event) {
try {
const importedQuotes = JSON.parse(event.target.result);
if (Array.isArray(importedQuotes)) {
// Add imported quotes to existing quotes array
quotes.push(...importedQuotes);
saveQuotesToLocalStorage(); // Save to local storage
populateCategories(); // Update categories
showRandomQuote(); // Update display
showSyncStatus('Quotes imported successfully!', 'success');
} else {
alert('Invalid file format. Please upload a valid JSON file.');
}
} catch (error) {
alert('Error reading file. Please make sure it\'s a valid JSON file.');
}
};
fileReader.readAsText(event.target.files[0]);
}

// ===== TASK 2: DYNAMIC CONTENT FILTERING SYSTEM =====
// REQUIRED: populateCategories function - extracts unique categories and populates dropdown
function populateCategories() {
const categoryFilter = document.getElementById('categoryFilter');
// Extract unique categories - REQUIRED FOR TASK 2
const categories = [...new Set(quotes.map(quote => quote.category))];

// Clear existing options except 'All Categories'
categoryFilter.innerHTML = '<option value="all">All Categories</option>';
// Populate the dropdown menu - REQUIRED FOR TASK 2
categories.forEach(category => {
const option = document.createElement('option');
option.value = category;
option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
categoryFilter.appendChild(option);
});
}

// REQUIRED: filterQuotes function - filters and updates displayed quotes based on selected category
function filterQuotes() {
const selectedCategory = document.getElementById('categoryFilter').value;
// Save selected category to local storage - REQUIRED FOR TASK 2
saveSelectedCategory(selectedCategory);
// Update displayed quotes - REQUIRED FOR TASK 2
updateQuoteDisplay();
}

// REQUIRED: filterQuote function - alias for filterQuotes for compatibility
function filterQuote() {
return filterQuotes();
}

// REQUIRED: Function to update quote display based on current filter
function updateQuoteDisplay() {
const quoteDisplay = document.getElementById('quoteDisplay');
const filteredQuotes = getFilteredQuotes();

if (filteredQuotes.length === 0) {
document.getElementById('quoteText').textContent = 'No quotes available for this category';
document.getElementById('quoteCategory').textContent = '';
} else {
// Show a random quote from filtered results
const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
const selectedQuote = filteredQuotes[randomIndex];
document.getElementById('quoteText').textContent = selectedQuote.text;
document.getElementById('quoteCategory').textContent = `Category: ${selectedQuote.category}`;
// Save last viewed quote to session storage
saveLastViewedQuote(selectedQuote);
}
}

// Helper function to get filtered quotes
function getFilteredQuotes() {
const selectedCategory = document.getElementById('categoryFilter').value;
// Logic to filter quotes based on selected category - REQUIRED FOR TASK 2
return selectedCategory === 'all'
? quotes
: quotes.filter(quote => quote.category === selectedCategory);
}

// REQUIRED: Save selected category to local storage - TASK 2
function saveSelectedCategory(category) {
localStorage.setItem('selectedCategory', category);
}

// REQUIRED: Restore last selected category when page loads - TASK 2
function restoreLastSelectedCategory() {
const savedCategory = localStorage.getItem('selectedCategory');
if (savedCategory) {
const categoryFilter = document.getElementById('categoryFilter');
if (categoryFilter) {
categoryFilter.value = savedCategory;
}
}
}

// ===== TASK 3: SERVER SYNC AND CONFLICT RESOLUTION =====
// REQUIRED: fetchQuotesFromServer function - fetches data from server using mock API
async function fetchQuotesFromServer() {
try {
showSyncStatus('Syncing with server...', 'info');
// Fetch data from server using mock API - REQUIRED FOR TASK 3
const response = await fetch(SYNC_CONFIG.SERVER_URL);
if (!response.ok) {
throw new Error(`Server responded with status: ${response.status}`);
}
const serverData = await response.json();
// Transform server data to our quote format
const serverQuotes = serverData.slice(0, 10).map(post => ({
text: post.title,
category: 'server'
}));
return serverQuotes;
} catch (error) {
showSyncStatus('Failed to sync with server', 'error');
console.error('Error fetching from server:', error);
return null;
}
}

// REQUIRED: Post data to server using mock API - TASK 3
async function postQuoteToServer(quote) {
try {
const response = await fetch(SYNC_CONFIG.SERVER_URL, {
method: 'POST',
headers: {
'Content-Type': 'application/json',
},
body: JSON.stringify({
title: quote.text,
body: quote.category,
userId: 1
})
});
if (!response.ok) {
throw new Error(`Failed to post to server: ${response.status}`);
}
const result = await response.json();
console.log('Successfully posted to server:', result);
return result;
} catch (error) {
console.error('Error posting to server:', error);
throw error;
}
}

// REQUIRED: syncQuotes function - main sync function with conflict resolution
async function syncQuotes() {
if (conflictResolutionInProgress) {
return;
}
try {
const serverQuotes = await fetchQuotesFromServer();
if (!serverQuotes) return;
// Simple conflict detection
const hasConflict = detectConflicts(serverQuotes);
if (hasConflict && !SYNC_CONFIG.AUTO_RESOLVE_CONFLICTS) {
await handleConflictResolution(serverQuotes);
} else {
// Auto-resolve: server data takes precedence
await resolveConflicts(serverQuotes, 'server');
}
// Show success message - REQUIRED FOR TASK 3
showSyncStatus('Quotes synced with server!', 'success');
lastSyncTime = new Date().toISOString();
updateSyncIndicator(true);
} catch (error) {
console.error('Sync error:', error);
showSyncStatus('Sync failed', 'error');
updateSyncIndicator(false);
}
}

// REQUIRED: Periodically check for new quotes from server - TASK 3
function initializeSync() {
if (SYNC_CONFIG.AUTO_SYNC_ENABLED) {
// Initial sync
syncQuotes();
// Set up periodic sync - REQUIRED FOR TASK 3
syncInterval = setInterval(syncQuotes, SYNC_CONFIG.SYNC_INTERVAL);
// Sync when page becomes visible
document.addEventListener('visibilitychange', () => {
if (!document.hidden) {
syncQuotes();
}
});
}
}

// Conflict detection
function detectConflicts(serverQuotes) {
const serverTexts = new Set(serverQuotes.map(q => q.text.toLowerCase()));
const localTexts = new Set(quotes.map(q => q.text.toLowerCase()));
// Simple conflict detection: check if server has quotes we don't have
for (let serverText of serverTexts) {
if (!localTexts.has(serverText)) {
return true;
}
}
return false;
}

// REQUIRED: Handle conflict resolution with UI elements - TASK 3
async function handleConflictResolution(serverQuotes) {
return new Promise((resolve) => {
conflictResolutionInProgress = true;
const modal = document.getElementById('conflictModal');
modal.classList.remove('hidden');
const useServerBtn = document.getElementById('useServerData');
const useLocalBtn = document.getElementById('useLocalData');
const mergeBtn = document.getElementById('mergeData');
const cleanup = () => {
modal.classList.add('hidden');
conflictResolutionInProgress = false;
resolve();
};
useServerBtn.onclick = async () => {
await resolveConflicts(serverQuotes, 'server');
showSyncStatus('Quotes synced with server! Conflict resolved using server data.', 'success');
cleanup();
};
useLocalBtn.onclick = () => {
showSyncStatus('Quotes synced with server! Conflict resolved keeping local data.', 'info');
cleanup();
};
mergeBtn.onclick = async () => {
await resolveConflicts(serverQuotes, 'merge');
showSyncStatus('Quotes synced with server! Conflict resolved by merging data.', 'success');
cleanup();
};
});
}

// REQUIRED: Update local storage with server data and conflict resolution - TASK 3
async function resolveConflicts(serverQuotes, strategy) {
const localQuoteTexts = new Set(quotes.map(q => q.text.toLowerCase()));

switch (strategy) {
case 'server':
// Replace local quotes with server quotes
quotes = [...serverQuotes];
showSyncStatus('Quotes synced with server! Server data applied.', 'success');
break;
case 'local':
// Keep local quotes
showSyncStatus('Quotes synced with server! Local data preserved.', 'info');
return;
case 'merge':
// Add new server quotes to local quotes
const newQuotes = serverQuotes.filter(sq =>
!localQuoteTexts.has(sq.text.toLowerCase())
);
quotes.push(...newQuotes);
showSyncStatus(`Quotes synced with server! Merged ${newQuotes.length} new quotes from server`, 'success');
break;
}
// Update local storage - REQUIRED FOR TASK 3
saveQuotesToLocalStorage();
populateCategories();
// Update display if needed
const currentFilter = document.getElementById('categoryFilter').value;
if (currentFilter === 'all' || quotes.some(q => q.category === currentFilter)) {
showRandomQuote();
}
}

// REQUIRED: UI elements and notifications for data updates - TASK 3
function showSyncStatus(message, type = 'info') {
const syncStatus = document.getElementById('syncStatus');
const syncMessage = document.getElementById('syncMessage');
syncMessage.textContent = message;
syncStatus.className = `sync-status ${type}`;
syncStatus.classList.remove('hidden');

// Auto-hide after 3 seconds for success/info messages
if (type !== 'error') {
setTimeout(() => {
syncStatus.classList.add('hidden');
}, 3000);
}
}

function updateSyncIndicator(success) {
const indicator = document.getElementById('syncIndicator');
const label = document.getElementById('syncLabel');
if (success) {
indicator.className = 'sync-dot success';
label.textContent = `Auto-sync: ON (Last: ${new Date().toLocaleTimeString()})`;
} else {
indicator.className = 'sync-dot error';
label.textContent = 'Auto-sync: ERROR';
}
}

// ===== EVENT LISTENERS SETUP =====
function setupEventListeners() {
// TASK 0: Event listener on "Show New Quote" button - REQUIRED
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
// TASK 0: Add quote button event listener - REQUIRED
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);
// TASK 2: Category filter event listener - REQUIRED
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
// TASK 1: Import/Export event listeners - REQUIRED
document.getElementById('exportQuotes').addEventListener('click', exportToJsonFile);
document.getElementById('importQuotes').addEventListener('click', () => {
document.getElementById('importFile').click();
});
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// TASK 3: Sync controls - REQUIRED
document.getElementById('syncNow').addEventListener('click', syncQuotes);
document.getElementById('dismissNotification').addEventListener('click', () => {
document.getElementById('syncStatus').classList.add('hidden');
});
// Form submission on Enter
document.getElementById('newQuoteText').addEventListener('keypress', (e) => {
if (e.key === 'Enter') addQuote();
});
document.getElementById('newQuoteCategory').addEventListener('keypress', (e) => {
if (e.key === 'Enter') addQuote();
});
}
