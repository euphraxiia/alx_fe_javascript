// Default quotes data with categories and metadata
const defaultQuotes = [
    {
        id: 1,
        text: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
        category: "motivational",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 2,
        text: "Life is what happens to you while you're busy making other plans.",
        author: "John Lennon",
        category: "life",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 3,
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt",
        category: "motivational",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 4,
        text: "In the middle of difficulty lies opportunity.",
        author: "Albert Einstein",
        category: "wisdom",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 5,
        text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
        author: "Winston Churchill",
        category: "motivational",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 6,
        text: "The only impossible journey is the one you never begin.",
        author: "Tony Robbins",
        category: "motivational",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 7,
        text: "Wisdom is not a product of schooling but of the lifelong attempt to acquire it.",
        author: "Albert Einstein",
        category: "wisdom",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 8,
        text: "I have not failed. I've just found 10,000 ways that won't work.",
        author: "Thomas Edison",
        category: "humor",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 9,
        text: "Be yourself; everyone else is already taken.",
        author: "Oscar Wilde",
        category: "life",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    },
    {
        id: 10,
        text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
        author: "Albert Einstein",
        category: "humor",
        dateAdded: "2024-01-01",
        source: "local",
        lastModified: Date.now()
    }
];

// Server simulation - this simulates quotes that might come from a server
const serverQuotes = [
    {
        id: 11,
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb",
        category: "wisdom",
        dateAdded: "2024-02-01",
        source: "server",
        lastModified: Date.now() + 1000
    },
    {
        id: 12,
        text: "Your limitation—it's only your imagination.",
        author: "Unknown",
        category: "motivational",
        dateAdded: "2024-02-01",
        source: "server",
        lastModified: Date.now() + 2000
    },
    {
        id: 1,
        text: "The only way to do great work is to love what you do and never give up.",
        author: "Steve Jobs",
        category: "motivational",
        dateAdded: "2024-01-01",
        source: "server",
        lastModified: Date.now() + 5000 // This creates a conflict with local version
    }
];

// Categories for filtering
const categories = [
    'motivational',
    'wisdom', 
    'humor',
    'life'
];
