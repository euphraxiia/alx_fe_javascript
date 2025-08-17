/**
 * Main Application Script with Server Synchronization
 * Handles UI interactions, server sync, and conflict resolution
 */

// Application State
let currentQuote = null;
let syncCount = 0;
let conflictsResolved = 0;
let lastSyncTime = null;
let syncInterval = null;
let isOnline = navigator.onLine;
let pendingConflicts = [];
let isSyncing = false;

// Configuration
const CONFIG = {
    SERVER_URL: 'https://jsonplaceholder.typicode.com/posts',
    SYNC_INTERVAL: 30000, // 30 seconds
    STORAGE_KEYS: {
        SYNC_COUNT: 'syncCount',
        CONFLICTS_RESOLVED: 'conflictsResolved',
        LAST_SYNC: 'lastSyncTime'
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', initializeApp);

async function initializeApp() {
    console.log('🚀 Initializing Dynamic Quote Generator...');
    
    try {
        loadSyncData();
        setupEventListeners();
        updateUI();
        populateCategories();
        
        // Show initial quote
        showRandomQuote();
        
        // Start sync process
        await startSyncProcess();
        
        console.log('✅ App initialized successfully');
        showNotification('Application loaded successfully!', 'success');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showNotification('Error initializing application', 'error');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Network status listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + N for new quote
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        showRandomQuote();
    }
    
    // Ctrl/Cmd + S for sync
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        manualSync();
    }
}

// Load sync-related data
function loadSyncData() {
    try {
        syncCount = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.SYNC_COUNT) || '0');
        conflictsResolved = parseInt(localStorage.getItem(CONFIG.STORAGE_KEYS.CONFLICTS_RESOLVED) || '0');
        
        const savedSyncTime = localStorage.getItem(CONFIG.STORAGE_KEYS.LAST_SYNC);
        lastSyncTime = savedSyncTime ? new Date(savedSyncTime) : null;
        
        console.log(`📊 Loaded sync data - Count: ${syncCount}, Conflicts: ${conflictsResolved}`);
    } catch (error) {
        console.error('Error loading sync data:', error);
    }
}

// Save sync data
function saveSyncData() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEYS.SYNC_COUNT, syncCount.toString());
        localStorage.setItem(CONFIG.STORAGE_KEYS.CONFLICTS_RESOLVED, conflictsResolved.toString());
        localStorage.setItem(CONFIG.STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
    } catch (error) {
        console.error('Error saving sync data:', error);
    }
}

// Start Sync Process
async function startSyncProcess() {
    console.log('🔄 Starting sync process...');
    updateSyncStatus('syncing', 'Starting sync...');
    
    try {
        // Initial sync
        await performSync();
        
        // Setup periodic sync
        syncInterval = setInterval(() => {
            if (!isSyncing) {
                performSync();
            }
        }, CONFIG.SYNC_INTERVAL);
        
        console.log('✅ Sync process started successfully');
    } catch (error) {
        console.error('❌ Error starting sync process:', error);
        updateSyncStatus('error', 'Sync startup failed');
    }
}

// Manual Sync Trigger
async function manualSync() {
    console.log('🔧 Manual sync triggered');
    showNotification('Manual sync started...', 'success');
    await performSync();
}

// Main Sync Function
async function performSync() {
    if (!isOnline) {
        updateSyncStatus('error', 'Offline - Cannot sync');
        return false;
    }

    if (isSyncing) {
        console.log('⏳ Sync already in progress...');
        return false;
    }

    isSyncing = true;
    updateSyncStatus('syncing', 'Syncing with server...');
    
    try {
        console.log('📡 Fetching server data...');
        const serverData = await fetchServerData();
        
        if (!serverData || serverData.length === 0) {
            updateSyncStatus('success', 'No new server data');
            return true;
        }

        console.log(`📥 Received ${serverData.length} server quotes`);
        
        // Check for conflicts
        const conflicts = detectConflicts(serverData);
        
        if (conflicts.length > 0) {
            console.log(`⚠️ Found ${conflicts.length} conflicts`);
            handleConflicts(conflicts, serverData);
            return false; // Sync paused for conflict resolution
        } else {
            // No conflicts, proceed with merge
            const addedCount = quoteManager.mergeQuotes(serverData);
            
            syncCount++;
            lastSyncTime = new Date();
            saveSyncData();
            updateUI();
            populateCategories();
            
            updateSyncStatus('success', 'Synced successfully');
            showNotification(`Sync completed! Added ${addedCount} new quotes.`, 'success');
            
            console.log(`✅ Sync completed successfully - Added ${addedCount} quotes`);
            return true;
        }
        
    } catch (error) {
        console.error('❌ Sync error:', error);
        updateSyncStatus('error', 'Sync failed');
        showNotification(`Sync failed: ${error.message}`, 'error');
        return false;
    } finally {
        isSyncing = false;
    }
}

// Fetch Server Data
async function fetchServerData() {
    try {
        const response = await fetch(`${CONFIG.SERVER_URL}?_limit=3`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const posts = await response.json();
        
        // Transform posts to quote format
        return posts.map(post => ({
            id: `server_${post.id}`,
            text: formatQuoteText(post.title),
            category: 'server',
            source: 'server',
            timestamp: new Date().toISOString(),
            serverId: post.id,
            userId: post.userId
        }));
        
    } catch (error) {
        console.error('❌ Error fetching server data:', error);
        throw new Error(`Unable to fetch server data: ${error.message}`);
    }
}

// Format quote text from server posts
function formatQuoteText(title) {
    // Clean up and format the title as a quote
    let text = title.trim();
    
    // Capitalize first letter
    text = text.charAt(0).toUpperCase() + text.slice(1);
    
    // Add period if not present
    if (!text.endsWith('.') && !text.endsWith('!') && !text.endsWith('?')) {
        text += '.';
    }
    
    // Ensure reasonable length
    if (text.length > 150) {
        text = text.substring(0, 147) + '...';
    }
    
    return text;
}

// Detect Conflicts
function detectConflicts(serverData) {
    const conflicts = [];
    const localQuotes = quoteManager.getAllQuotes();
    
    serverData.forEach(serverQuote => {
        // Check for ID conflicts
        const existingQuote = localQuotes.find(q => 
            q.id === serverQuote.id || 
            (q.serverId && q.serverId === serverQuote.serverId)
        );
        
        if (existingQuote) {
            // Check if content differs
            if (existingQuote.text !== serverQuote.text || 
                existingQuote.category !== serverQuote.category) {
                conflicts.push({
                    id: existingQuote.id,
                    local: existingQuote,
                    server: serverQuote,
                    type: 'content_mismatch'
                });
            }
        }
    });
    
    return conflicts;
}

// Handle Conflicts
function handleConflicts(conflicts, serverData) {
    pendingConflicts = conflicts;
    const conflict = conflicts[0]; // Handle first conflict
    
    updateSyncStatus('conflict', 'Conflict detected - Requires resolution');
    
    // Display conflict information
    document.getElementById('localVersion').innerHTML = `
        <strong>Text:</strong> "${conflict.local.text}"<br>
        <strong>Category:</strong> ${conflict.local.category}<br>
        <strong>Source:</strong> ${conflict.local.source}<br>
        <strong>Last Modified:</strong> ${new Date(conflict.local.timestamp).toLocaleString()}
    `;
    
    document.getElementById('serverVersion').innerHTML = `
        <strong>Text:</strong> "${conflict.server.text}"<br>
        <strong>Category:</strong> ${conflict.server.category}<br>
        <strong>Source:</strong> ${conflict.server.source}<br>
        <strong>Server ID:</strong> ${conflict.server.serverId}
    `;
    
    // Show conflict resolution UI
    document.getElementById('conflictResolution').classList.add('show');
    showNotification('Data conflict detected! Please choose resolution method.', 'conflict');
    
    console.log('⚠️ Conflict resolution UI displayed');
}

// Resolve Conflict
function resolveConflict(resolution) {
    if (pendingConflicts.length === 0) {
        console.log('⚠️ No pending conflicts to resolve');
        return;
    }
    
    const conflict = pendingConflicts[0];
    console.log(`🔧 Resolving conflict with strategy: ${resolution}`);
    
    switch (resolution) {
        case 'local':
            // Keep local version - no action needed
            showNotification('Conflict resolved: Keeping local version', 'success');
            console.log('✅ Kept local version');
            break;
            
        case 'server':
            // Use server version
            quoteManager.updateQuote(conflict.local.id, conflict.server);
            showNotification('Conflict resolved: Using server version', 'success');
            console.log('✅ Used server version');
            break;
            
        case 'merge':
            // Keep both versions
            const mergedQuote = {
                ...conflict.server,
                id: quoteManager.generateId(),
                category: 'merged',
                text: conflict.server.text + ' (Server version)'
            };
            quoteManager.addQuote(mergedQuote.text, mergedQuote.category, 'server');
            showNotification('Conflict resolved: Both versions kept', 'success');
            console.log('✅ Merged both versions');
            break;
            
        default:
            console.error('❌ Invalid resolution strategy:', resolution);
            return;
    }
    
    conflictsResolved++;
    pendingConflicts.shift(); // Remove resolved conflict
    
    // Hide conflict UI
    document.getElementById('conflictResolution').classList.remove('show');
    
    // Continue with remaining conflicts or complete sync
    if (pendingConflicts.length > 0) {
        handleConflicts(pendingConflicts);
    } else {
        syncCount++;
        lastSyncTime = new Date();
        saveSyncData();
        updateUI();
        populateCategories();
        updateSyncStatus('success', 'All conflicts resolved');
        console.log('✅ All conflicts resolved successfully');
    }
}

// Update Sync Status
function updateSyncStatus(status, message) {
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    // Remove all status classes
    statusDot.className = 'status-dot';
    statusDot.classList.add(status);
    statusText.textContent = message;
    
    console.log(`📊 Sync status: ${status} - ${message}`);
}

// Network Event Handlers
function handleOnline() {
    isOnline = true;
    updateSyncStatus('success', 'Back online');
    showNotification('Connection restored - Syncing...', 'success');
    console.log('🌐 Network connection restored');
    
    // Perform sync after coming back online
    setTimeout(() => {
        performSync();
    }, 1000);
}

function handleOffline() {
    isOnline = false;
    updateSyncStatus('error', 'Offline');
    showNotification('Working offline - Sync paused', 'error');
    console.log('📵 Network connection lost');
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    
    // Clear any existing timeout
    if (notification.hideTimeout) {
        clearTimeout(notification.hideTimeout);
    }
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    // Auto-hide after 5 seconds
    notification.hideTimeout = setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
    
    console.log(`📢 Notification (${type}): ${message}`);
}

// Show Random Quote
function showRandomQuote() {
    const quote = quoteManager.getRandomQuote();
    
    if (!quote) {
        document.getElementById('quoteDisplay').innerHTML = `
            <div>
                <div class="quote-text">No quotes available in this category.</div>
            </div>
        `;
        return;
    }
    
    currentQuote = quote;
    
    document.getElementById('quoteDisplay').innerHTML = `
        <div>
            <div class="quote-text">"${quote.text}"</div>
            <div class="quote-category">${quote.category}</div>
            ${quote.source ? `<div class="quote-source">Source: ${quote.source}</div>` : ''}
        </div>
    `;
    
    console.log(`📝 Displayed quote: ${quote.id}`);
}

// Toggle Add Quote Form
function toggleAddForm() {
    const form = document.getElementById('addQuoteForm');
    const isVisible = form.classList.contains('show');
    
    if (isVisible) {
        form.classList.remove('show');
        clearAddForm();
    } else {
        form.classList.add('show');
        document.getElementById('newQuoteText').focus();
    }
}

// Clear Add Quote Form
function clearAddForm() {
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';
}

// Save New Quote
function saveQuote() {
    const text = document.getElementById('newQuoteText').value.trim();
    const category = document.getElementById('newQuoteCategory').value.trim().toLowerCase();
    
    if (!text || !category) {
        showNotification('Please fill in both text and category fields', 'error');
        return;
    }
    
    try {
        const newQuote = quoteManager.addQuote(text, category, 'local');
        toggleAddForm();
        populateCategories();
        updateUI();
        
        showNotification('Quote added successfully!', 'success');
        console.log(`✅ Added new quote: ${newQuote.id}`);
    } catch (error) {
        showNotification(`Error adding quote: ${error.message}`, 'error');
        console.error('❌ Error adding quote:', error);
    }
}

// Populate Categories
function populateCategories() {
    const categoryFilter = document.getElementById('categoryFilter');
    const categories = quoteManager.getCategories();
    
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">All Categories</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });
    
    // Restore previous selection if valid
    if (categories.includes(currentValue) || currentValue === 'all') {
        categoryFilter.value = currentValue;
    }
}

// Filter Quotes
function filterQuotes() {
    const selectedCategory = document.getElementById('categoryFilter').value;
    quoteManager.filterByCategory(selectedCategory);
    updateUI();
    
    console.log(`🔍 Filtered by category: ${selectedCategory}`);
}

// Export Quotes
function exportQuotes() {
    try {
        const exportData = quoteManager.exportQuotes();
        const blob = new Blob([exportData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `quotes-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        showNotification('Quotes exported successfully!', 'success');
        console.log('📤 Quotes exported successfully');
    } catch (error) {
        showNotification('Export failed', 'error');
        console.error('❌ Export error:', error);
    }
}

// Import Quotes
function importQuotes() {
    document.getElementById('fileInput').click();
}

// Handle File Import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedCount = quoteManager.importQuotes(e.target.result);
            
            if (importedCount > 0) {
                populateCategories();
                updateUI();
                showNotification(`Successfully imported ${importedCount} new quotes!`, 'success');
                console.log(`📥 Imported ${importedCount} quotes`);
            } else {
                showNotification('No new quotes found to import', 'error');
            }
            
        } catch (error) {
            showNotification(`Import failed: ${error.message}`, 'error');
            console.error('❌ Import error:', error);
        }
        
        // Reset file input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// Update UI
function updateUI() {
    // Update stats
    const stats = quoteManager.getStats();
    document.getElementById('totalQuotes').textContent = stats.totalQuotes;
    document.getElementById('syncCount').textContent = syncCount;
    document.getElementById('conflictsResolved').textContent = conflictsResolved;
    document.getElementById('lastSync').textContent = lastSyncTime ? 
        lastSyncTime.toLocaleTimeString() : 'Never';
}

// Cleanup
function cleanup() {
    if (syncInterval) {
        clearInterval(syncInterval);
        console.log('🧹 Sync interval cleared');
    }
    
    // Save any pending data
    saveSyncData();
}
