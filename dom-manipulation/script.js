// Initial quotes array with different categories
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation", id: 1 },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership", id: 2 },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life", id: 3 },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams", id: 4 },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Motivation", id: 5 },
    { text: "The way to get started is to quit talking and begin doing.", category: "Action", id: 6 },
    { text: "Don't let yesterday take up too much of today.", category: "Life", id: 7 },
    { text: "You learn more from failure than from success.", category: "Learning", id: 8 },
    { text: "It's not whether you get knocked down, it's whether you get up.", category: "Motivation", id: 9 },
    { text: "The only impossible journey is the one you never begin.", category: "Dreams", id: 10 },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Success", id: 11 },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", category: "Action", id: 12 },
    { text: "Your limitation—it's only your imagination.", category: "Motivation", id: 13 },
    { text: "Great things never come from comfort zones.", category: "Growth", id: 14 },
    { text: "Dream it. Wish it. Do it.", category: "Dreams", id: 15 }
];

// Global variables
let quotes = [];
let currentFilter = 'all';
let filteredQuotes = [];
let nextId = 16;

// Local Storage Keys
const STORAGE_KEYS = {
    QUOTES: 'dynamicQuotes',
    LAST_FILTER: 'lastSelectedCategory',
    NEXT_ID: 'nextQuoteId'
};

// DOM Elements
const elements = {
    quoteDisplay: document.getElementById('quoteDisplay'),
    newQuoteBtn: document.getElementById('newQuote'),
    addQuoteBtn: document.getElementById('addQuoteBtn'),
    addQuoteForm: document.getElementById('addQuoteForm'),
    categoryFilter: document.getElementById('categoryFilter'),
    quotesContainer: document.getElementById('quotesContainer'),
    quotesListTitle: document.getElementById('quotesListTitle'),
    quotesCount: document.getElementById('quotesCount'),
    totalQuotes: document.getElementById('totalQuotes'),
    totalCategories: document.getElementById('totalCategories'),
    filteredQuotesCount: document.getElementById('filteredQuotes'),
    existingCategories: document.getElementById('existingCategories'),
    notificationContainer: document.getElementById('notificationContainer')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadQuotesFromStorage();
    loadLastFilter();
    populateCategories();
    filterQuotes();
    updateStatistics();
    showExistingCategories();
    
    // Event listeners
    elements.newQuoteBtn.addEventListener('click', showRandomQuote);
    elements.addQuoteBtn.addEventListener('click', createAddQuoteForm);
    
    // Show initial random quote
    showRandomQuote();
});

// Local Storage Functions
function saveQuotesToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        localStorage.setItem(STORAGE_KEYS.NEXT_ID, nextId.toString());
    } catch (error) {
        showNotification('Error saving quotes to storage', 'error');
    }
}

function loadQuotesFromStorage() {
    try {
        const storedQuotes = localStorage.getItem(STORAGE_KEYS.QUOTES);
        const storedNextId = localStorage.getItem(STORAGE_KEYS.NEXT_ID);
        
        if (storedQuotes) {
            quotes = JSON.parse(storedQuotes);
            nextId = storedNextId ? parseInt(storedNextId) : nextId;
        } else {
            quotes = [...defaultQuotes];
            saveQuotesToStorage();
        }
    } catch (error) {
        quotes = [...defaultQuotes];
        showNotification('Error loading quotes from storage, using defaults', 'warning');
    }
}

function saveLastFilter(category) {
    try {
        localStorage.setItem(STORAGE_KEYS.LAST_FILTER, category);
    } catch (error) {
        console.error('Error saving filter to storage');
    }
}

function loadLastFilter() {
    try {
        const lastFilter = localStorage.getItem(STORAGE_KEYS.LAST_FILTER);
        if (lastFilter) {
            currentFilter = lastFilter;
            elements.categoryFilter.value = lastFilter;
        }
    } catch (error) {
        console.error('Error loading filter from storage');
    }
}

// Core Functions
function populateCategories() {
    const categories = getUniqueCategories();
    
    // Clear existing options except "All Categories"
    elements.categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        elements.categoryFilter.appendChild(option);
    });
    
    // Restore last selected filter
    elements.categoryFilter.value = currentFilter;
}

function getUniqueCategories() {
    return [...new Set(quotes.map(quote => quote.category))].sort();
}

function filterQuotes() {
    const selectedCategory = elements.categoryFilter.value;
    currentFilter = selectedCategory;
    
    // Save the selected filter to localStorage
    saveLastFilter(selectedCategory);
    
    // Filter quotes based on selected category
    if (selectedCategory === 'all') {
        filteredQuotes = [...quotes];
        elements.quotesListTitle.textContent = 'All Quotes';
    } else {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
        elements.quotesListTitle.textContent = `${selectedCategory} Quotes`;
    }
    
    // Update display
    displayFilteredQuotes();
    updateStatistics();
    
    // Show notification
    showNotification(`Filtered to ${filteredQuotes.length} quote(s)`, 'info');
}

function displayFilteredQuotes() {
    elements.quotesContainer.innerHTML = '';
    elements.quotesCount.textContent = `(${filteredQuotes.length})`;
    
    if (filteredQuotes.length === 0) {
        elements.quotesContainer.innerHTML = `
            <div class="no-quotes-message">
                <p>No quotes found for this category.</p>
                <p>Try selecting a different category or add a new quote!</p>
            </div>
        `;
        return;
    }
    
    filteredQuotes.forEach((quote, index) => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-item';
        quoteElement.innerHTML = `
            <div class="quote-content">
                <p class="quote-text">"${escapeHtml(quote.text)}"</p>
                <p class="quote-category">Category: ${escapeHtml(quote.category)}</p>
            </div>
            <div class="quote-actions">
                <button onclick="displaySpecificQuote(${quote.id})" class="btn btn-small btn-primary">Show Quote</button>
                <button onclick="deleteQuote(${quote.id})" class="btn btn-small btn-danger">Delete</button>
            </div>
        `;
        elements.quotesContainer.appendChild(quoteElement);
    });
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
    
    // Animate quote display
    elements.quoteDisplay.style.opacity = '0';
    
    setTimeout(() => {
        elements.quoteDisplay.innerHTML = `
            <p class="quote-text">"${escapeHtml(randomQuote.text)}"</p>
            <p class="quote-category">- ${escapeHtml(randomQuote.category)}</p>
        `;
        elements.quoteDisplay.style.opacity = '1';
    }, 200);
}

function displaySpecificQuote(quoteId) {
    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
        elements.quoteDisplay.style.opacity = '0';
        setTimeout(() => {
            elements.quoteDisplay.innerHTML = `
                <p class="quote-text">"${escapeHtml(quote.text)}"</p>
                <p class="quote-category">- ${escapeHtml(quote.category)}</p>
            `;
            elements.quoteDisplay.style.opacity = '1';
        }, 200);
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

function showExistingCategories() {
    const categories = getUniqueCategories();
    elements.existingCategories.textContent = categories.join(', ') || 'None';
}

function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    // Validation
    if (!newQuoteText) {
        showNotification('Please enter the quote text', 'error');
        return;
    }
    
    if (!newQuoteCategory) {
        showNotification('Please enter a category', 'error');
        return;
    }
    
    // Check for duplicate quotes
    const isDuplicate = quotes.some(quote => 
        quote.text.toLowerCase() === newQuoteText.toLowerCase()
    );
    
    if (isDuplicate) {
        showNotification('This quote already exists!', 'error');
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory,
        id: nextId++
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Save to storage
    saveQuotesToStorage();
    
    // Clear form inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Hide form
    elements.addQuoteForm.style.display = 'none';
    
    // Update UI
    populateCategories();
    filterQuotes();
    showExistingCategories();
    
    // Show success message and display the new quote
    showNotification('Quote added successfully!', 'success');
    displaySpecificQuote(newQuote.id);
}

function deleteQuote(quoteId) {
    if (confirm('Are you sure you want to delete this quote?')) {
        const quoteIndex = quotes.findIndex(quote => quote.id === quoteId);
        if (quoteIndex !== -1) {
            quotes.splice(quoteIndex, 1);
            saveQuotesToStorage();
            populateCategories();
            filterQuotes();
            showNotification('Quote deleted successfully!', 'success');
        }
    }
}

function clearFilter() {
    elements.categoryFilter.value = 'all';
    filterQuotes();
}

function cancelAddQuote() {
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    elements.addQuoteForm.style.display = 'none';
}

function updateStatistics() {
    elements.totalQuotes.textContent = quotes.length;
    elements.totalCategories.textContent = getUniqueCategories().length;
    elements.filteredQuotesCount.textContent = filteredQuotes.length;
}

// Import/Export Functions
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `quotes_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showNotification('Quotes exported successfully!', 'success');
}

function importQuotes(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                
                // Validate imported quotes
                if (!Array.isArray(importedQuotes)) {
                    throw new Error('Invalid file format');
                }
                
                // Add unique IDs to imported quotes if they don't have them
                let addedCount = 0;
                importedQuotes.forEach(quote => {
                    if (quote.text && quote.category) {
                        // Check for duplicates
                        const isDuplicate = quotes.some(existingQuote => 
                            existingQuote.text.toLowerCase() === quote.text.toLowerCase()
                        );
                        
                        if (!isDuplicate) {
                            quotes.push({
                                text: quote.text,
                                category: quote.category,
                                id: nextId++
                            });
                            addedCount++;
                        }
                    }
                });
                
                if (addedCount > 0) {
                    saveQuotesToStorage();
                    populateCategories();
                    filterQuotes();
                    showNotification(`${addedCount} quotes imported successfully!`, 'success');
                } else {
                    showNotification('No new quotes were imported (duplicates found)', 'warning');
                }
            } catch (error) {
                showNotification('Error importing quotes. Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }
    
    // Reset file input
    event.target.value = '';
}

function resetToDefaults() {
    if (confirm('Are you sure you want to reset to default quotes? This will delete all your custom quotes.')) {
        quotes = [...defaultQuotes];
        nextId = 16;
        currentFilter = 'all';
        elements.categoryFilter.value = 'all';
        
        saveQuotesToStorage();
        saveLastFilter('all');
        
        populateCategories();
        filterQuotes();
        showNotification('Reset to default quotes successfully!', 'success');
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

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    elements.notificationContainer.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to add quote when form is visible
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (elements.addQuoteForm.style.display !== 'none') {
            addQuote();
        }
    }
    
    // Space bar for random quote (when not typing in inputs)
    if (event.code === 'Space' && event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
        event.preventDefault();
        showRandomQuote();
    }
});
