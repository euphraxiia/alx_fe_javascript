/**
 * Quote Data Management Module
 * Handles quote storage, retrieval, and basic operations
 */

// Default quotes collection
const DEFAULT_QUOTES = [
    {
        id: 1,
        text: "The only way to do great work is to love what you do.",
        category: "motivation",
        source: "local",
        timestamp: new Date().toISOString()
    },
    {
        id: 2,
        text: "Innovation distinguishes between a leader and a follower.",
        category: "innovation",
        source: "local",
        timestamp: new Date().toISOString()
    },
    {
        id: 3,
        text: "Life is what happens to you while you're busy making other plans.",
        category: "life",
        source: "local",
        timestamp: new Date().toISOString()
    },
    {
        id: 4,
        text: "The future belongs to those who believe in the beauty of their dreams.",
        category: "dreams",
        source: "local",
        timestamp: new Date().toISOString()
    },
    {
        id: 5,
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        category: "success",
        source: "local",
        timestamp: new Date().toISOString()
    }
];

// Quote Management Class
class QuoteManager {
    constructor() {
        this.quotes = [];
        this.filteredQuotes = [];
        this.currentFilter = 'all';
        this.init();
    }

    // Initialize quote manager
    init() {
        this.loadQuotes();
        this.updateFilteredQuotes();
    }

    // Load quotes from localStorage or use defaults
    loadQuotes() {
        try {
            const savedQuotes = localStorage.getItem('dynamicQuotes');
            if (savedQuotes) {
                this.quotes = JSON.parse(savedQuotes);
                console.log(`Loaded ${this.quotes.length} quotes from storage`);
            } else {
                this.quotes = [...DEFAULT_QUOTES];
                this.saveQuotes();
                console.log('Initialized with default quotes');
            }
        } catch (error) {
            console.error('Error loading quotes:', error);
            this.quotes = [...DEFAULT_QUOTES];
        }
    }

    // Save quotes to localStorage
    saveQuotes() {
        try {
            localStorage.setItem('dynamicQuotes', JSON.stringify(this.quotes));
            console.log('Quotes saved successfully');
        } catch (error) {
            console.error('Error saving quotes:', error);
            throw new Error('Failed to save quotes to local storage');
        }
    }

    // Get all quotes
    getAllQuotes() {
        return [...this.quotes];
    }

    // Get filtered quotes
    getFilteredQuotes() {
        return [...this.filteredQuotes];
    }

    // Add a new quote
    addQuote(text, category, source = 'local') {
        if (!text || !category) {
            throw new Error('Quote text and category are required');
        }

        const newQuote = {
            id: this.generateId(),
            text: text.trim(),
            category: category.trim().toLowerCase(),
            source: source,
            timestamp: new Date().toISOString()
        };

        this.quotes.push(newQuote);
        this.saveQuotes();
        this.updateFilteredQuotes();
        
        return newQuote;
    }

    // Remove a quote by ID
    removeQuote(id) {
        const initialLength = this.quotes.length;
        this.quotes = this.quotes.filter(quote => quote.id !== id);
        
        if (this.quotes.length < initialLength) {
            this.saveQuotes();
            this.updateFilteredQuotes();
            return true;
        }
        return false;
    }

    // Update an existing quote
    updateQuote(id, updates) {
        const quoteIndex = this.quotes.findIndex(quote => quote.id === id);
        
        if (quoteIndex === -1) {
            return false;
        }

        this.quotes[quoteIndex] = {
            ...this.quotes[quoteIndex],
            ...updates,
            timestamp: new Date().toISOString()
        };

        this.saveQuotes();
        this.updateFilteredQuotes();
        return true;
    }

    // Get a random quote from filtered collection
    getRandomQuote() {
        if (this.filteredQuotes.length === 0) {
            return null;
        }

        const randomIndex = Math.floor(Math.random() * this.filteredQuotes.length);
        return this.filteredQuotes[randomIndex];
    }

    // Get quote by ID
    getQuoteById(id) {
        return this.quotes.find(quote => quote.id === id) || null;
    }

    // Get all unique categories
    getCategories() {
        const categories = [...new Set(this.quotes.map(quote => quote.category))];
        return categories.sort();
    }

    // Filter quotes by category
    filterByCategory(category) {
        this.currentFilter = category;
        this.updateFilteredQuotes();
    }

    // Update filtered quotes based on current filter
    updateFilteredQuotes() {
        if (this.currentFilter === 'all') {
            this.filteredQuotes = [...this.quotes];
        } else {
            this.filteredQuotes = this.quotes.filter(
                quote => quote.category === this.currentFilter
            );
        }
    }

    // Search quotes by text
    searchQuotes(searchTerm) {
        if (!searchTerm) {
            return [...this.quotes];
        }

        const term = searchTerm.toLowerCase();
        return this.quotes.filter(quote =>
            quote.text.toLowerCase().includes(term) ||
            quote.category.toLowerCase().includes(term)
        );
    }

    // Get quotes by source
    getQuotesBySource(source) {
        return this.quotes.filter(quote => quote.source === source);
    }

    // Merge new quotes (used for server sync)
    mergeQuotes(newQuotes) {
        let addedCount = 0;
        const existingIds = this.quotes.map(q => q.id);

        newQuotes.forEach(quote => {
            if (!existingIds.includes(quote.id)) {
                this.quotes.push({
                    ...quote,
                    timestamp: quote.timestamp || new Date().toISOString()
                });
                addedCount++;
            }
        });

        if (addedCount > 0) {
            this.saveQuotes();
            this.updateFilteredQuotes();
        }

        return addedCount;
    }

    // Replace quotes (used for conflict resolution)
    replaceQuotes(quotesToReplace) {
        quotesToReplace.forEach(newQuote => {
            const existingIndex = this.quotes.findIndex(q => q.id === newQuote.id);
            if (existingIndex >= 0) {
                this.quotes[existingIndex] = { ...newQuote };
            } else {
                this.quotes.push({ ...newQuote });
            }
        });

        this.saveQuotes();
        this.updateFilteredQuotes();
    }

    // Export quotes to JSON
    exportQuotes() {
        const exportData = {
            quotes: this.quotes,
            exportDate: new Date().toISOString(),
            totalQuotes: this.quotes.length,
            categories: this.getCategories()
        };

        return JSON.stringify(exportData, null, 2);
    }

    // Import quotes from JSON
    importQuotes(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            const quotesToImport = data.quotes || data;

            if (!Array.isArray(quotesToImport)) {
                throw new Error('Invalid format: Expected array of quotes');
            }

            let importedCount = 0;
            const existingIds = this.quotes.map(q => q.id);

            quotesToImport.forEach(quote => {
                if (this.isValidQuote(quote) && !existingIds.includes(quote.id)) {
                    this.quotes.push({
                        ...quote,
                        id: quote.id || this.generateId(),
                        source: quote.source || 'imported',
                        timestamp: quote.timestamp || new Date().toISOString()
                    });
                    importedCount++;
                }
            });

            if (importedCount > 0) {
                this.saveQuotes();
                this.updateFilteredQuotes();
            }

            return importedCount;
        } catch (error) {
            console.error('Import error:', error);
            throw new Error('Failed to import quotes: Invalid format');
        }
    }

    // Validate quote object
    isValidQuote(quote) {
        return quote &&
               typeof quote.text === 'string' &&
               quote.text.trim() !== '' &&
               typeof quote.category === 'string' &&
               quote.category.trim() !== '';
    }

    // Generate unique ID
    generateId() {
        return `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get statistics
    getStats() {
        const categories = this.getCategories();
        const sources = [...new Set(this.quotes.map(q => q.source))];
        
        return {
            totalQuotes: this.quotes.length,
            totalCategories: categories.length,
            totalSources: sources.length,
            categories: categories,
            sources: sources,
            oldestQuote: this.getOldestQuote(),
            newestQuote: this.getNewestQuote()
        };
    }

    // Get oldest quote
    getOldestQuote() {
        if (this.quotes.length === 0) return null;
        
        return this.quotes.reduce((oldest, quote) => {
            return new Date(quote.timestamp) < new Date(oldest.timestamp) ? quote : oldest;
        });
    }

    // Get newest quote
    getNewestQuote() {
        if (this.quotes.length === 0) return null;
        
        return this.quotes.reduce((newest, quote) => {
            return new Date(quote.timestamp) > new Date(newest.timestamp) ? quote : newest;
        });
    }

    // Clear all quotes
    clearAllQuotes() {
        this.quotes = [];
        this.filteredQuotes = [];
        this.saveQuotes();
    }

    // Reset to default quotes
    resetToDefaults() {
