// Storage Keys
const STORAGE_KEYS = {
    QUOTES: 'quotes',
    LAST_FILTER: 'lastSelectedCategory',
    USER_PREFERENCES: 'userPreferences',
    QUOTE_COUNTER: 'quoteCounter',
    LAST_VIEWED_QUOTE: 'lastViewedQuote',
    SESSION_ACTIVITY: 'sessionActivity'
};

// Default quotes array
const defaultQuotes = [
    { 
        id: 1, 
        text: "The only way to do great work is to love what you do.", 
        category: "Motivation", 
        author: "Steve Jobs",
        dateAdded: new Date().toISOString()
    },
    { 
        id: 2, 
        text: "Innovation distinguishes between a leader and a follower.", 
        category: "Leadership", 
        author: "Steve Jobs",
        dateAdded: new Date().toISOString()
    },
    { 
        id: 3, 
        text: "Life is what happens to you while you're busy making other plans.", 
        category: "Life", 
        author: "John Lennon",
        dateAdded: new Date().toISOString()
    },
    { 
        id: 4, 
        text: "The future belongs to those who believe in the beauty of their dreams.", 
        category: "Dreams", 
        author: "Eleanor Roosevelt",
        dateAdded: new Date().toISOString()
    },
    { 
        id: 5, 
        text: "It is during our darkest moments that we must focus to see the light.", 
        category: "Motivation", 
        author: "Aristotle",
        dateAdded: new Date().toISOString()
    }
];

// Global variables
let quotes = [];
let filteredQuotes = [];
let currentFilter = 'all';
let nextId = 6;
let sessionActivity = [];

// DOM Elements
const elements = {
    quoteDisplay: document.getElementById('quoteDisplay'),
    newQuoteBtn: document.getElementById('newQuote'),
    addQuoteBtn: document.getElementById('addQuoteBtn'),
    lastViewedBtn: document.getElementById('lastViewedQuote'),
    addQuoteForm: document.getElementById('addQuoteForm'),
    categoryFilter: document.getElementById('categoryFilter'),
    quotesContainer: document.getElementById('quotesContainer'),
    quotesListTitle: document.getElementById('quotesListTitle'),
    quotesCount: document.getElementById('quotesCount'),
    totalQuotes: document.getElementById('totalQuotes'),
    totalCategories: document.getElementById('totalCategories'),
    filteredQuotesCount: document.getElementById('filteredQuotes'),
    storageUsage: document.getElementById('storageUsage'),
    existingCategories: document.getElementById('existingCategories'),
    notificationContainer: document.getElementById('notificationContainer'),
    localStorageStatus: document.getElementById('localStorageStatus'),
    sessionStorageStatus: document.getElementById('sessionStorageStatus'),
    activityLog: document.getElementById('activityLog'),
    toggleListBtn: document.getElementById('toggleListBtn'),
    sortBy: document.getElementById('sortBy')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    try {
        checkStorageSupport();
        loadQuotes();
        loadUserPreferences();
        loadSessionData();
        populateCategories();
        filterQuotes();
        updateStatistics();
        updateStorageStatus();
        showExistingCategories();
        addEventListeners();
        logActivity('Application initialized');
        showNotification('Welcome! Your quotes are loaded from local storage.', 'success');
    } catch (error) {
        console.error('Initialization error:', error);
        showNotification('Error initializing application. Using default quotes.', 'error');
        quotes = [...defaultQuotes];
    }
}

// Event listeners
function addEventListeners() {
    elements.newQuoteBtn.addEventListener('click', showRandomQuote);
    elements.addQuoteBtn.addEventListener('click', createAddQuoteForm);
    elements.lastViewedBtn.addEventListener('click', showLastViewedQuote);
    
    // Auto-save on window close
    window.addEventListener('beforeunload', function() {
        saveQuotes();
        saveUserPreferences();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Storage Support Check
function checkStorageSupport() {
    const localStorageSupported = typeof(Storage) !== "undefined" && window.localStorage;
    const sessionStorageSupported = typeof(Storage) !== "undefined" && window.sessionStorage;
    
    elements.localStorageStatus.textContent = localStorageSupported ? 'Supported ✓' : 'Not Supported ✗';
    elements.sessionStorageStatus.textContent = sessionStorageSupported ? 'Supported ✓' : 'Not Supported ✗';
    
    if (!localStorageSupported) {
        showNotification('Local Storage not supported. Data will not persist.', 'warning');
    }
}

// Local Storage Functions
function saveQuotes() {
    try {
        const quotesData = {
            quotes: quotes,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotesData));
        localStorage.setItem(STORAGE_KEYS.QUOTE_COUNTER, nextId.toString());
        updateStorageStatus();
        logActivity(`Saved ${quotes.length} quotes to local storage`);
        return true;
    } catch (error) {
        console.error('Error saving quotes:', error);
        showNotification('Error saving quotes to storage', 'error');
        return false;
    }
}

function loadQuotes() {
    try {
        const quotesDataStr = localStorage.getItem(STORAGE_KEYS.QUOTES);
        const counterStr = localStorage.getItem(STORAGE_KEYS.QUOTE_COUNTER);
        
        if (quotesDataStr) {
            const quotesData = JSON.parse(quotesDataStr);
            quotes = quotesData.quotes || quotesData; // Handle both old and new formats
            nextId = counterStr ? parseInt(counterStr) : getMaxId() + 1;
            logActivity(`Loaded ${quotes.length} quotes from local storage`);
        } else {
            quotes = [...defaultQuotes];
            saveQuotes(); // Save default quotes
            logActivity('Initialized with default quotes');
        }
        
        // Ensure all quotes have required properties
        quotes = quotes.map(quote => ({
            id: quote.id || nextId++,
            text: quote.text,
            category: quote.category,
            author: quote.author || 'Unknown',
            dateAdded: quote.dateAdded || new Date().toISOString()
        }));
        
    } catch (error) {
        console.error('Error loading quotes:', error);
        quotes = [...defaultQuotes];
        showNotification('Error loading quotes. Using defaults.', 'warning');
    }
}

function getMaxId() {
    return quotes.length > 0 ? Math.max(...quotes.map(q => q.id || 0)) : 0;
}

// Session Storage Functions
function saveSessionData() {
    try {
        const sessionData = {
            currentFilter: currentFilter,
            sessionStartTime: Date.now(),
            activity: sessionActivity
        };
        sessionStorage.setItem(STORAGE_KEYS.SESSION_ACTIVITY, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Error saving session data:', error);
    }
}

function loadSessionData() {
    try {
        const sessionDataStr = sessionStorage.getItem(STORAGE_KEYS.SESSION_ACTIVITY);
        if (sessionDataStr) {
            const sessionData = JSON.parse(sessionDataStr);
            currentFilter = sessionData.currentFilter || 'all';
            sessionActivity = sessionData.activity || [];
            elements.categoryFilter.value = currentFilter;
        }
    } catch (error) {
        console.error('Error loading session data:', error);
    }
}

function saveLastViewedQuote(quote) {
    try {
        const lastViewed = {
            quote: quote,
            timestamp: new Date().toISOString()
        };
        sessionStorage.setItem(STORAGE_KEYS.LAST_VIEWED_QUOTE, JSON.stringify(lastViewed));
        logActivity(`Viewed quote: "${quote.text.substring(0, 50)}..."`);
    } catch (error) {
        console.error('Error saving last viewed quote:', error);
    }
}

function loadLastViewedQuote() {
    try {
        const lastViewedStr = sessionStorage.getItem(STORAGE_KEYS.LAST_VIEWED_QUOTE);
        if (lastViewedStr) {
            const lastViewed = JSON.parse(lastViewedStr);
            return lastViewed.quote;
        }
        return null;
    } catch (error) {
        console.error('Error loading last viewed quote:', error);
        return null;
    }
}

// User Preferences
function saveUserPreferences() {
    try {
        const preferences = {
            lastFilter: currentFilter,
            sortBy: elements.sortBy.value,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
    } catch (error) {
        console.error('Error saving preferences:', error);
    }
}

function loadUserPreferences() {
    try {
        const preferencesStr = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
        if (preferencesStr) {
            const preferences = JSON.parse(preferencesStr);
            currentFilter = preferences.lastFilter || 'all';
            elements.categoryFilter.value = currentFilter;
            elements.sortBy.value = preferences.sortBy || 'newest';
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Core Functions
function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))].sort();
    elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.categoryFilter.appendChild(option);
    });
    
    elements.categoryFilter.value = currentFilter;
}

function filterQuotes() {
    const selectedCategory = elements.categoryFilter.value;
    currentFilter = selectedCategory;
    saveUserPreferences();
    saveSessionData();
    
    if (selectedCategory === 'all') {
        filteredQuotes = [...quotes];
        elements.quotesListTitle.textContent = 'All Quotes';
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        elements.quotesListTitle.textContent = `${selectedCategory} Quotes`;
    }
    
    sortQuotes();
    displayFilteredQuotes();
    updateStatistics();
    logActivity(`Filtered quotes by category: ${selectedCategory}`);
}

function sortQuotes() {
    const sortBy = elements.sortBy.value;
    
    switch (sortBy) {
        case 'newest':
            filteredQuotes.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
            break;
        case 'oldest':
            filteredQuotes.sort((a, b) => new Date(a.dateAdded) - new Date(b.dateAdded));
            break;
        case 'category':
            filteredQuotes.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'author':
            filteredQuotes.sort((a, b) => (a.author || '').localeCompare(b.author || ''));
            break;
    }
    
    displayFilteredQuotes();
}

function displayFilteredQuotes() {
    elements.quotesCount.textContent = `(${filteredQuotes.length})`;
    elements.quotesContainer.innerHTML = '';
    
    if (filteredQuotes.length === 0) {
        elements.quotesContainer.innerHTML = `
            <div class="no-quotes-message">
                <p>No quotes found for this category.</p>
                <p>Try selecting a different category or add a new quote!</p>
            </div>
        `;
        return;
    }
    
    filteredQuotes.forEach(quote => {
        const quoteElement = createQuoteElement(quote);
        elements.quotesContainer.appendChild(quoteElement);
    });
}

function createQuoteElement(quote) {
    const quoteElement = document.createElement('div');
    quoteElement.className = 'quote-item';
    quoteElement.innerHTML = `
        <div class="quote-content">
            <p class="quote-text">"${escapeHtml(quote.text)}"</p>
            <p class="quote-meta">
                <span class="quote-category">Category: ${escapeHtml(quote.category)}</span>
                ${quote.author ? `<span class="quote-author">Author: ${escapeHtml(quote.author)}</span>` : ''}
                <span class="quote-date">Added: ${new Date(quote.dateAdded).toLocaleDateString()}</span>
            </p>
        </div>
        <div class="quote-actions">
            <button onclick="displaySpecificQuote(${quote.id})" class="btn btn-small btn-primary">Show Quote</button>
            <button onclick="deleteQuote(${quote.id})" class="btn btn-small btn-danger">Delete</button>
        </div>
    `;
    return quoteElement;
}

function showRandomQuote() {
    const quotesToShow = currentFilter === 'all' ? quotes : filteredQuotes;
    
    if (quotesToShow.length === 0) {
        elements.quoteDisplay.innerHTML = `
            <p class="quote-text">No quotes available for the selected category.</p>
            <p class="quote-category">Try selecting a different category or add new quotes!</p>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * quotesToShow.length);
    const randomQuote = quotesToShow[randomIndex];
    
    displayQuote(randomQuote);
    saveLastViewedQuote(randomQuote);
    logActivity(`Showed random quote from ${randomQuote.category}`);
}

function displayQuote(quote) {
    elements.quoteDisplay.style.opacity = '0';
    
    setTimeout(() => {
        elements.quoteDisplay.innerHTML = `
            <p class="quote-text">"${escapeHtml(quote.text)}"</p>
            <p class="quote-category">- ${escapeHtml(quote.category)}</p>
            ${quote.author ? `<p class="quote-author">by ${escapeHtml(quote.author)}</p>` : ''}
            <p class="quote-timestamp">Viewed: ${new Date().toLocaleString()}</p>
        `;
        elements.quoteDisplay.style.opacity = '1';
    }, 200);
}

function displaySpecificQuote(quoteId) {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
        displayQuote(quote);
        saveLastViewedQuote(quote);
    }
}

function showLastViewedQuote() {
    const lastViewed = loadLastViewedQuote();
    if (lastViewed) {
        displayQuote(lastViewed);
        showNotification('Showing last viewed quote from this session', 'info');
    } else {
        showNotification('No quote viewed in this session yet', 'warning');
    }
}

function createAddQuoteForm() {
    const isVisible = elements.addQuoteForm.style.display !== 'none';
    elements.addQuoteForm.style.display = isVisible ? 'none' : 'block';
    
    if (!isVisible) {
        document.getElementById('newQuoteText').focus();
        showExistingCategories();
    }
}

function addQuote(event) {
    event.preventDefault();
    
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
    const newQuoteAuthor = document.getElementById('newQuoteAuthor').value.trim();
    
    if (!newQuoteText || !newQuoteCategory) {
        showNotification('Please fill in both quote text and category', 'error');
        return;
    }
    
    // Check for duplicates
    const isDuplicate = quotes.some(quote => 
        quote.text.toLowerCase() === newQuoteText.toLowerCase()
    );
    
    if (isDuplicate) {
        showNotification('This quote already exists!', 'error');
        return;
    }
    
    const newQuote = {
        id: nextId++,
        text: newQuoteText,
        category: newQuoteCategory,
        author: newQuoteAuthor || 'Unknown',
        dateAdded: new Date().toISOString()
    };
    
    quotes.push(newQuote);
    saveQuotes();
    
    // Clear form
    document.getElementById('quoteForm').reset();
    elements.addQuoteForm.style.display = 'none';
    
    // Update UI
    populateCategories();
    filterQuotes();
    showExistingCategories();
    
    // Show the new quote
    displayQuote(newQuote);
    saveLastViewedQuote(newQuote);
    
    logActivity(`Added new quote in category: ${newQuoteCategory}`);
    showNotification('Quote added successfully!', 'success');
}

function deleteQuote(quoteId) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const quoteIndex = quotes.findIndex(quote => quote.id === quoteId);
        if (quoteIndex !== -1) {
            const deletedQuote = quotes[quoteIndex];
            quotes.splice(quoteIndex, 1);
            saveQuotes();
            populateCategories();
            filterQuotes();
            logActivity(`Deleted quote from category: ${deletedQuote.category}`);
            showNotification('Quote deleted successfully!', 'success');
        }
    }
}

// JSON Import/Export Functions
function exportToJson() {
    try {
        const exportData = {
            quotes: quotes,
            exportDate: new Date().toISOString(),
            totalQuotes: quotes.length,
            categories: [...new Set(quotes.map(q => q.category))],
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `quotes_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        logActivity(`Exported ${quotes.length} quotes to JSON`);
        showNotification(`Successfully exported ${quotes.length} quotes!`, 'success');
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Error exporting quotes', 'error');
    }
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Handle different import formats
            let importedQuotes = [];
            if (Array.isArray(importedData)) {
                importedQuotes = importedData;
            } else if (importedData.quotes && Array.isArray(importedData.quotes)) {
                importedQuotes = importedData.quotes;
            } else {
                throw new Error('Invalid file format');
            }
            
            // Validate and process quotes
            let addedCount = 0;
            let skippedCount = 0;
            
            importedQuotes.forEach(quote => {
                if (quote.text && quote.category) {
                    // Check for duplicates
                    const isDuplicate = quotes.some(existingQuote => 
                        existingQuote.text.toLowerCase() === quote.text.toLowerCase()
                    );
                    
                    if (!isDuplicate) {
                        quotes.push({
                            id: nextId++,
                            text: quote.text,
                            category: quote.category,
                            author: quote.author || 'Unknown',
                            dateAdded: quote.dateAdded || new Date().toISOString()
                        });
                        addedCount++;
                    } else {
                        skippedCount++;
                    }
                }
            });
            
            if (addedCount > 0) {
                saveQuotes();
                populateCategories();
                filterQuotes();
                logActivity(`Imported ${addedCount} quotes, skipped ${skippedCount} duplicates`);
                showNotification(`Successfully imported ${addedCount} quotes! (${skippedCount} duplicates skipped)`, 'success');
            } else {
                showNotification('No new quotes were imported', 'warning');
            }
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Error importing quotes. Please check the file format.', 'error');
        }
    };
    
    fileReader.readAsText(file);
    event.target.value = ''; // Reset file input
}

// Utility Functions
function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        try {
            localStorage.removeItem(STORAGE_KEYS.QUOTES);
            localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
            localStorage.removeItem(STORAGE_KEYS.QUOTE_COUNTER);
            sessionStorage.clear();
            
            quotes = [];
            filteredQuotes = [];
            sessionActivity = [];
            nextId = 1;
            currentFilter = 'all';
            
            populateCategories();
            filterQuotes();
            updateStatistics();
            updateStorageStatus();
            elements.activityLog.innerHTML = '';
            
            logActivity('Cleared all data');
           showNotification('All data cleared successfully!', 'success');
       } catch (error) {
           console.error('Error clearing data:', error);
           showNotification('Error clearing data', 'error');
       }
   }
}

function resetToDefaults() {
   if (confirm('Reset to default quotes? This will replace all current quotes.')) {
       quotes = [...defaultQuotes];
       nextId = 6;
       currentFilter = 'all';
       elements.categoryFilter.value = 'all';
       
       saveQuotes();
       saveUserPreferences();
       populateCategories();
       filterQuotes();
       
       logActivity('Reset to default quotes');
       showNotification('Reset to default quotes successfully!', 'success');
   }
}

function clearFilter() {
   elements.categoryFilter.value = 'all';
   filterQuotes();
}

function cancelAddQuote() {
   document.getElementById('quoteForm').reset();
   elements.addQuoteForm.style.display = 'none';
}

function clearSessionData() {
   if (confirm('Clear all session data?')) {
       try {
           sessionStorage.clear();
           sessionActivity = [];
           elements.activityLog.innerHTML = '';
           updateStorageStatus();
           showNotification('Session data cleared!', 'success');
       } catch (error) {
           showNotification('Error clearing session data', 'error');
       }
   }
}

function toggleQuotesList() {
   const isVisible = elements.quotesContainer.style.display !== 'none';
   elements.quotesContainer.style.display = isVisible ? 'none' : 'block';
   elements.toggleListBtn.textContent = isVisible ? 'Show All Quotes' : 'Hide All Quotes';
   
   if (!isVisible) {
       displayFilteredQuotes();
   }
}

// Activity Log Functions
function logActivity(message) {
   const activity = {
       message: message,
       timestamp: new Date().toLocaleString(),
       id: Date.now()
   };
   
   sessionActivity.unshift(activity);
   
   // Keep only last 50 activities
   if (sessionActivity.length > 50) {
       sessionActivity = sessionActivity.slice(0, 50);
   }
   
   updateActivityLog();
   saveSessionData();
}

function updateActivityLog() {
   const logHtml = sessionActivity.map(activity => `
       <div class="activity-item">
           <span class="activity-time">${activity.timestamp}</span>
           <span class="activity-message">${activity.message}</span>
       </div>
   `).join('');
   
   elements.activityLog.innerHTML = logHtml || '<p class="no-activity">No activity in this session</p>';
}

function clearActivityLog() {
   sessionActivity = [];
   updateActivityLog();
   saveSessionData();
   showNotification('Activity log cleared', 'info');
}

// Statistics and Status Functions
function updateStatistics() {
   elements.totalQuotes.textContent = quotes.length;
   elements.totalCategories.textContent = [...new Set(quotes.map(q => q.category))].length;
   elements.filteredQuotesCount.textContent = filteredQuotes.length;
   
   // Calculate storage usage
   try {
       const quotesStr = localStorage.getItem(STORAGE_KEYS.QUOTES) || '';
       const prefsStr = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '';
       const storageSize = (quotesStr.length + prefsStr.length) / 1024; // KB
       elements.storageUsage.textContent = storageSize.toFixed(2);
   } catch (error) {
       elements.storageUsage.textContent = 'N/A';
   }
}

function updateStorageStatus() {
   try {
       const quotesData = localStorage.getItem(STORAGE_KEYS.QUOTES);
       elements.localStorageStatus.textContent = quotesData ? `${quotes.length} quotes stored ✓` : 'No data stored';
       
       const sessionData = sessionStorage.getItem(STORAGE_KEYS.SESSION_ACTIVITY);
       elements.sessionStorageStatus.textContent = sessionData ? `${sessionActivity.length} activities logged ✓` : 'No session data';
   } catch (error) {
       elements.localStorageStatus.textContent = 'Storage error';
       elements.sessionStorageStatus.textContent = 'Storage error';
   }
}

function showExistingCategories() {
   const categories = [...new Set(quotes.map(quote => quote.category))].sort();
   elements.existingCategories.textContent = categories.join(', ') || 'None';
}

// Storage Information Modal
function showStorageInfo() {
   try {
       const quotesSize = (localStorage.getItem(STORAGE_KEYS.QUOTES) || '').length;
       const prefsSize = (localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES) || '').length;
       const sessionSize = (sessionStorage.getItem(STORAGE_KEYS.SESSION_ACTIVITY) || '').length;
       
       const storageInfo = `
           <div class="storage-details">
               <h4>Local Storage Usage:</h4>
               <ul>
                   <li>Quotes Data: ${(quotesSize / 1024).toFixed(2)} KB</li>
                   <li>User Preferences: ${(prefsSize / 1024).toFixed(2)} KB</li>
                   <li>Total Local Storage: ${((quotesSize + prefsSize) / 1024).toFixed(2)} KB</li>
               </ul>
               
               <h4>Session Storage Usage:</h4>
               <ul>
                   <li>Session Activity: ${(sessionSize / 1024).toFixed(2)} KB</li>
                   <li>Activities Logged: ${sessionActivity.length}</li>
               </ul>
               
               <h4>Data Summary:</h4>
               <ul>
                   <li>Total Quotes: ${quotes.length}</li>
                   <li>Categories: ${[...new Set(quotes.map(q => q.category))].length}</li>
                   <li>Last Saved: ${localStorage.getItem(STORAGE_KEYS.QUOTES) ? new Date(JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTES)).timestamp || Date.now()).toLocaleString() : 'Never'}</li>
               </ul>
               
               <h4>Browser Support:</h4>
               <ul>
                   <li>Local Storage: ${typeof(Storage) !== "undefined" && window.localStorage ? '✓ Supported' : '✗ Not Supported'}</li>
                   <li>Session Storage: ${typeof(Storage) !== "undefined" && window.sessionStorage ? '✓ Supported' : '✗ Not Supported'}</li>
               </ul>
           </div>
       `;
       
       document.getElementById('storageModalBody').innerHTML = storageInfo;
       document.getElementById('storageModal').style.display = 'block';
       
   } catch (error) {
       showNotification('Error retrieving storage information', 'error');
   }
}

function closeStorageModal() {
   document.getElementById('storageModal').style.display = 'none';
}

// Notification System
function showNotification(message, type = 'info') {
   const notification = document.createElement('div');
   notification.className = `notification notification-${type}`;
   notification.innerHTML = `
       <div class="notification-content">
           <span class="notification-message">${escapeHtml(message)}</span>
           <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
       </div>
   `;
   
   elements.notificationContainer.appendChild(notification);
   
   // Auto remove after 5 seconds
   setTimeout(() => {
       if (notification.parentElement) {
           notification.remove();
       }
   }, 5000);
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
   // Ctrl/Cmd + S to save
   if ((event.ctrlKey || event.metaKey) && event.key === 's') {
       event.preventDefault();
       saveQuotes();
       showNotification('Quotes saved to local storage!', 'success');
   }
   
   // Ctrl/Cmd + Enter to add quote when form is visible
   if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
       if (elements.addQuoteForm.style.display !== 'none') {
           document.getElementById('quoteForm').dispatchEvent(new Event('submit'));
       }
   }
   
   // Space bar for random quote (when not typing)
   if (event.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
       event.preventDefault();
       showRandomQuote();
   }
   
   // Escape to close forms/modals
   if (event.key === 'Escape') {
       if (elements.addQuoteForm.style.display !== 'none') {
           cancelAddQuote();
       }
       if (document.getElementById('storageModal').style.display !== 'none') {
           closeStorageModal();
       }
   }
}

// Utility Functions
function escapeHtml(text) {
   const map = {
       '&': '&amp;',
       '<': '&lt;',
       '>': '&gt;',
       '"': '&quot;',
       "'": '&#039;'
   };
   return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Auto-save functionality
setInterval(function() {
   if (quotes.length > 0) {
       saveQuotes();
       saveUserPreferences();
   }
}, 30000); // Auto-save every 30 seconds

// Handle storage events (when storage is modified in another tab)
window.addEventListener('storage', function(event) {
   if (event.key === STORAGE_KEYS.QUOTES) {
       if (confirm('Quotes have been updated in another tab. Reload data?')) {
           loadQuotes();
           populateCategories();
           filterQuotes();
           showNotification('Data reloaded from storage', 'info');
       }
   }
});

// Export functions to global scope for onclick handlers
window.exportToJson = exportToJson;
window.importFromJsonFile = importFromJsonFile;
window.clearAllData = clearAllData;
window.resetToDefaults = resetToDefaults;
window.clearFilter = clearFilter;
window.cancelAddQuote = cancelAddQuote;
window.clearSessionData = clearSessionData;
window.showStorageInfo = showStorageInfo;
window.closeStorageModal = closeStorageModal;
window.toggleQuotesList = toggleQuotesList;
window.sortQuotes = sortQuotes;
window.clearActivityLog = clearActivityLog;
window.displaySpecificQuote = displaySpecificQuote;
window.deleteQuote = deleteQuote;
window.filterQuotes = filterQuotes;
window.addQuote = addQuote;
