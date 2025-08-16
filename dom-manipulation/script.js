// Initial quotes array with some default quotes
let quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Life is what happens to you while you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "Be yourself; everyone else is already taken.", author: "Oscar Wilde" }
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteAuthor = document.getElementById('newQuoteAuthor');
const totalQuotesSpan = document.getElementById('totalQuotes');
const lastViewedSpan = document.getElementById('lastViewed');
const quotesList = document.getElementById('quotesList');
const toggleBtn = document.getElementById('toggleBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadQuotes();
    loadLastViewed();
    updateStatistics();
    displayAllQuotes();
});

// Local Storage Functions
function saveQuotes() {
    try {
        localStorage.setItem('quotes', JSON.stringify(quotes));
        updateStatistics();
        displayAllQuotes();
    } catch (error) {
        console.error('Error saving quotes to localStorage:', error);
        alert('Error saving quotes. Storage might be full.');
    }
}

function loadQuotes() {
    try {
        const savedQuotes = localStorage.getItem('quotes');
        if (savedQuotes) {
            const parsedQuotes = JSON.parse(savedQuotes);
            if (Array.isArray(parsedQuotes) && parsedQuotes.length > 0) {
                quotes = parsedQuotes;
            }
        }
    } catch (error) {
        console.error('Error loading quotes from localStorage:', error);
        // Keep default quotes if loading fails
    }
}

// Session Storage Functions
function saveLastViewed(quote) {
    try {
        const lastViewedData = {
            quote: quote,
            timestamp: new Date().toLocaleString()
        };
        sessionStorage.setItem('lastViewed', JSON.stringify(lastViewedData));
        updateLastViewedDisplay();
    } catch (error) {
        console.error('Error saving last viewed to sessionStorage:', error);
    }
}

function loadLastViewed() {
    try {
        const lastViewed = sessionStorage.getItem('lastViewed');
        if (lastViewed) {
            const data = JSON.parse(lastViewed);
            lastViewedSpan.textContent = `"${data.quote.text}" at ${data.timestamp}`;
        }
    } catch (error) {
        console.error('Error loading last viewed from sessionStorage:', error);
    }
}

function updateLastViewedDisplay() {
    const lastViewed = sessionStorage.getItem('lastViewed');
    if (lastViewed) {
        const data = JSON.parse(lastViewed);
        lastViewedSpan.textContent = `"${data.quote.text}" at ${data.timestamp}`;
    }
}

// Quote Display Functions
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteText.textContent = "No quotes available. Please add some quotes first.";
        quoteAuthor.textContent = "";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    
    quoteText.textContent = randomQuote.text;
    quoteAuthor.textContent = `- ${randomQuote.author}`;
    
    // Save to session storage
    saveLastViewed(randomQuote);
    
    // Add animation effect
    quoteDisplay.style.opacity = '0';
    setTimeout(() => {
        quoteDisplay.style.opacity = '1';
    }, 100);
}

function addQuote() {
    const text = newQuoteText.value.trim();
    const author = newQuoteAuthor.value.trim();
    
    // Validation
    if (!text || !author) {
        alert('Please enter both quote text and author name.');
        return;
    }
    
    // Check for duplicates
    const isDuplicate = quotes.some(quote => 
        quote.text.toLowerCase() === text.toLowerCase() && 
        quote.author.toLowerCase() === author.toLowerCase()
    );
    
    if (isDuplicate) {
        alert('This quote already exists!');
        return;
    }
    
    // Add new quote
    const newQuote = { text: text, author: author };
    quotes.push(newQuote);
    
    // Save to localStorage
    saveQuotes();
    
    // Clear input fields
    newQuoteText.value = '';
    newQuoteAuthor.value = '';
    
    // Show success message
    alert('Quote added successfully!');
    
    // Update display
    updateStatistics();
    displayAllQuotes();
}

// JSON Import/Export Functions
function exportToJsonFile() {
    try {
        if (quotes.length === 0) {
            alert('No quotes to export!');
            return;
        }

        const dataStr = JSON.stringify(quotes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `quotes_${new Date().getTime()}.json`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(url);
        
        alert('Quotes exported successfully!');
    } catch (error) {
        console.error('Error exporting quotes:', error);
        alert('Error exporting quotes. Please try again.');
    }
}

function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
        alert('Please select a valid JSON file.');
        return;
    }

    const fileReader = new FileReader();
    
    fileReader.onload = function(event) {
        try {
            const importedData = JSON.parse(event.target.result);
            
            // Validate imported data
            if (!Array.isArray(importedData)) {
                alert('Invalid file format. Expected an array of quotes.');
                return;
            }
            
            // Validate each quote object
            const validQuotes = importedData.filter(quote => {
                return quote && 
                       typeof quote === 'object' && 
                       typeof quote.text === 'string' && 
                       typeof quote.author === 'string' &&
                       quote.text.trim() !== '' && 
                       quote.author.trim() !== '';
            });
            
            if (validQuotes.length === 0) {
                alert('No valid quotes found in the imported file.');
                return;
            }
            
            // Remove duplicates
            let addedCount = 0;
            validQuotes.forEach(importedQuote => {
                const isDuplicate = quotes.some(existingQuote => 
                    existingQuote.text.toLowerCase() === importedQuote.text.toLowerCase() && 
                    existingQuote.author.toLowerCase() === importedQuote.author.toLowerCase()
                );
                
                if (!isDuplicate) {
                    quotes.push({
                        text: importedQuote.text.trim(),
                        author: importedQuote.author.trim()
                    });
                    addedCount++;
                }
            });
            
            // Save to localStorage
            saveQuotes();
            
            // Update display
            updateStatistics();
            displayAllQuotes();
            
            // Show result message
            if (addedCount === 0) {
                alert('All quotes from the file already exist in your collection.');
            } else {
                alert(`Successfully imported ${addedCount} new quote(s)!`);
            }
            
        } catch (error) {
            console.error('Error importing quotes:', error);
            alert('Error reading the file. Please ensure it\'s a valid JSON file.');
        }
    };
    
    fileReader.onerror = function() {
        alert('Error reading the file. Please try again.');
    };
    
    fileReader.readAsText(file);
    
    // Clear the file input
    event.target.value = '';
}

// Statistics and Display Functions
function updateStatistics() {
    totalQuotesSpan.textContent = quotes.length;
}

function displayAllQuotes() {
    quotesList.innerHTML = '';
    
    if (quotes.length === 0) {
        quotesList.innerHTML = '<p>No quotes available.</p>';
        return;
    }
    
    quotes.forEach((quote, index) => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-item';
        quoteElement.innerHTML = `
            <div class="quote-content">
                <p>"${quote.text}"</p>
                <cite>- ${quote.author}</cite>
            </div>
            <button class="delete-btn" onclick="deleteQuote(${index})" title="Delete Quote">🗑️</button>
        `;
        quotesList.appendChild(quoteElement);
    });
}

function toggleQuotesList() {
    const isHidden = quotesList.classList.contains('hidden');
    
    if (isHidden) {
        quotesList.classList.remove('hidden');
        toggleBtn.textContent = 'Hide All Quotes';
    } else {
        quotesList.classList.add('hidden');
        toggleBtn.textContent = 'Show All Quotes';
    }
}

function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes.splice(index, 1);
        saveQuotes();
        updateStatistics();
        displayAllQuotes();
        alert('Quote deleted successfully!');
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.ctrlKey && event.key === ' ') {
        event.preventDefault();
        showRandomQuote();
    }
});

// Auto-save functionality
setInterval(function() {
    saveQuotes();
}, 30000); // Auto-save every 30 seconds
