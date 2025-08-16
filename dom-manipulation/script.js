// Initial quotes array with different categories
let quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Motivation" },
    { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
    { text: "Life is what happens to you while you're busy making other plans.", category: "Life" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "It is during our darkest moments that we must focus to see the light.", category: "Motivation" },
    { text: "The way to get started is to quit talking and begin doing.", category: "Action" },
    { text: "Don't let yesterday take up too much of today.", category: "Life" },
    { text: "You learn more from failure than from success.", category: "Learning" },
    { text: "It's not whether you get knocked down, it's whether you get up.", category: "Motivation" },
    { text: "The only impossible journey is the one you never begin.", category: "Dreams" }
];

// DOM elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const addQuoteForm = document.getElementById('addQuoteForm');
const categorySelect = document.getElementById('categorySelect');
const quotesContainer = document.getElementById('quotesContainer');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    showRandomQuote();
    populateCategories();
    displayAllQuotes();
    
    // Event listeners
    newQuoteBtn.addEventListener('click', showRandomQuote);
    addQuoteBtn.addEventListener('click', createAddQuoteForm);
    categorySelect.addEventListener('change', filterQuotesByCategory);
});

// Function to show a random quote
function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    let filteredQuotes = quotes;
    
    // Filter quotes by category if not "all"
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    if (filteredQuotes.length === 0) {
        quoteDisplay.innerHTML = `
            <p class="quote-text">No quotes available for this category.</p>
            <p class="quote-category"></p>
        `;
        return;
    }
    
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    
    // Create and update quote display with animation
    quoteDisplay.style.opacity = '0';
    
    setTimeout(() => {
        quoteDisplay.innerHTML = `
            <p class="quote-text">"${randomQuote.text}"</p>
            <p class="quote-category">- ${randomQuote.category}</p>
        `;
        quoteDisplay.style.opacity = '1';
    }, 200);
}

// Function to show the add quote form
function createAddQuoteForm() {
    addQuoteForm.style.display = addQuoteForm.style.display === 'none' ? 'block' : 'none';
    
    if (addQuoteForm.style.display === 'block') {
        document.getElementById('newQuoteText').focus();
    }
}

// Function to add a new quote
function addQuote() {
    const newQuoteText = document.getElementById('newQuoteText').value.trim();
    const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
    
    // Validation
    if (!newQuoteText || !newQuoteCategory) {
        alert('Please fill in both the quote text and category.');
        return;
    }
    
    // Create new quote object
    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };
    
    // Add to quotes array
    quotes.push(newQuote);
    
    // Clear form inputs
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    
    // Hide form
    addQuoteForm.style.display = 'none';
    
    // Update categories and quotes display
    populateCategories();
    displayAllQuotes();
    
    // Show success message
    showSuccessMessage('Quote added successfully!');
    
    // Optionally show the new quote
    const quoteIndex = quotes.length - 1;
    displaySpecificQuote(quoteIndex);
}

// Function to cancel adding quote
function cancelAddQuote() {
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
    addQuoteForm.style.display = 'none';
}

// Function to populate category filter dropdown
function populateCategories() {
    const categories = [...new Set(quotes.map(quote => quote.category))].sort();
    
    // Clear existing options except "All Categories"
    categorySelect.innerHTML = '<option value="all">All Categories</option>';
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categorySelect.appendChild(option);
    });
}

// Function to filter quotes by category
function filterQuotesByCategory() {
    displayAllQuotes();
}

// Function to display all quotes
function displayAllQuotes() {
    const selectedCategory = categorySelect.value;
    let filteredQuotes = quotes;
    
    if (selectedCategory !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
    }
    
    quotesContainer.innerHTML = '';
    
    filteredQuotes.forEach((quote, index) => {
        const quoteElement = document.createElement('div');
        quoteElement.className = 'quote-item';
        quoteElement.innerHTML = `
            <p class="quote-text">"${quote.text}"</p>
            <p class="quote-category">Category: ${quote.category}</p>
            <button onclick="displaySpecificQuote(${quotes.indexOf(quote)})" class="btn btn-small">Show This Quote</button>
            <button onclick="deleteQuote(${quotes.indexOf(quote)})" class="btn btn-danger btn-small">Delete</button>
        `;
        quotesContainer.appendChild(quoteElement);
    });
}

// Function to display a specific quote
function displaySpecificQuote(index) {
    const quote = quotes[index];
    if (quote) {
        quoteDisplay.style.opacity = '0';
        setTimeout(() => {
            quoteDisplay.innerHTML = `
                <p class="quote-text">"${quote.text}"</p>
                <p class="quote-category">- ${quote.category}</p>
            `;
            quoteDisplay.style.opacity = '1';
        }, 200);
    }
}

// Function to delete a quote
function deleteQuote(index) {
    if (confirm('Are you sure you want to delete this quote?')) {
        quotes.splice(index, 1);
        populateCategories();
        displayAllQuotes();
        showSuccessMessage('Quote deleted successfully!');
    }
}

// Function to show success message
function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Function to export quotes (bonus feature)
function exportQuotes() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'quotes.json';
    link.click();
}

// Function to import quotes (bonus feature)
function importQuotes(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedQuotes = JSON.parse(e.target.result);
                quotes = [...quotes, ...importedQuotes];
                populateCategories();
                displayAllQuotes();
                showSuccessMessage('Quotes imported successfully!');
            } catch (error) {
                alert('Error importing quotes. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}
