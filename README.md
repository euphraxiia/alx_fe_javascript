Dynamic Quote Generator with Server Synchronisation
Overview
This project implements a Dynamic Quote Generator with real-time server synchronisation and conflict resolution. The application showcases advanced web development concepts, including data storage, API integration, and conflict handling.
Features Implemented
1. Server Simulation
•	API Integration: Uses JSONPlaceholder (https://jsonplaceholder.typicode.com/posts) as a mock server.
•	Data Transformation: Converts blog posts into quote format for a realistic server environment.
•	Periodic Sync: Automatically synchronises every 30 seconds.
•	Manual Sync: Users can manually trigger synchronisation through a button.
2. Data Synchronisation
•	Local Storage: Stores quotes locally using localStorage.
•	Server Integration: Fetches data from the external API.
•	Merge Logic: Intelligently combines local and server data.
•	Data Validation: Ensures integrity during the synchronisation process.
3. Conflict Resolution
•	Conflict Detection: Identifies mismatches between local and server data.
•	User Choice: Offers three resolution options:
o	Keep the local version
o	Use the server version
o	Merge both versions
•	Visual Feedback: Displays conflicting data side by side in the interface.
•	Automatic Handling: Resolves simple conflicts without user input.
4. User Interface Features
•	Real Time Status: Colour indicators show sync status:
o	Green: Successfully synced
o	Yellow: Currently syncing
o	Red: Error or offline
o	Orange: Conflict detected
•	Notifications: Pop-up messages for all synchronisation activities.
•	Statistics Dashboard: Displays:
o	Total quotes count
o	Last sync time
o	Number of syncs completed
o	Conflicts resolved
5. Offline Capability
•	Network Detection: Monitors online and offline status.
•	Graceful Degradation: Operates fully offline with local data.
•	Auto Resume: Automatically synchronises once the connection is restored.
Technical Implementation
Core Components
1. Sync Manager
async function performSync() {
    // Main synchronisation logic
    // Fetches server data
    // Detects conflicts
    // Handles merge operations
}
2. Conflict Resolution
function detectConflicts(serverData) {
    // Compares local and server data
    // Returns an array of conflicts
}

function resolveConflict(resolution) {
    // Applies user’s choice for resolving conflicts
    // Updates data accordingly
}
3. Data Management
function saveLocalData() {
    // Saves data to localStorage
    // Updates dashboard statistics
}

function mergeServerData(serverData) {
    // Merges new server data with local quotes
    // Avoids duplicates
}
API Integration
•	Endpoint: https://jsonplaceholder.typicode.com/posts?_limit=3
•	Method: GET request to fetch mock data.
•	Transformation: Converts posts into quote objects with:
o	Unique ID (prefixed with “server_”)
o	Text content from post title
o	Category marked as “server”
o	Timestamp and source details

Local Storage Schema
{
    quotes: [
        {
            id: "unique_identifier",
            text: "Quote content",
            category: "category_name",
            source: "local | server | imported",
            timestamp: "ISO_date_string"
        }
    ],
    syncCount: number,
    conflictsResolved: number,
    lastSyncTime: "ISO_date_string"
}

Testing Instructions
1. Basic Functionality
•	Open the application in a browser.
•	Confirm quotes are displayed correctly.
•	Test the “New Quote” button.
•	Add custom quotes and confirm they are saved.
2. Sync Testing
•	Manual Sync:
o	Click the “Manual Sync” button.
o	The status indicator turns yellow while syncing.
o	Turns green once complete.
o	New quotes from the server should appear.
•	Automatic Sync:
o	Wait 30 seconds.
o	Sync occurs automatically.
o	Statistics update to show increased sync count.
•	Offline Testing:
o	Disable the internet connection.
o	Status shows “Offline”.
o	Add local quotes (still works).
o	Reconnect.
o	Sync resumes automatically.
3. Conflict Resolution
•	Simulating a Conflict:
o	The app creates conflicts when the server and local data differ.
o	A resolution interface appears.
•	Resolution Options:
o	Keep Local: Retains original version.
o	Use Server: Replaces the local version with the server version.
o	Merge Both: Keeps both versions.
•	Verification:
o	Conflict counter increases.
o	The selected option is applied correctly.
o	No data loss occurs.

4. Import and Export
•	Export:
o	Click the Export button.
o	JSON file with all the quotes downloads.
•	Import:
o	Click Import and choose JSON file.
o	Quotes are added.
o	Duplicates avoided.
o	Success message shown.
Error Handling
•	Network errors are handled gracefully.
•	Invalid data prevented from being stored.
•	Storage limit errors managed.
•	JSON parsing includes error recovery.
Browser Compatibility
Works in modern browsers that support:
•	ES6+ JavaScript features
•	localStorage API
•	Fetch API
•	CSS Grid and Flexbox
Performance Considerations
•	Efficient sync only updates changed data.
•	Proper cleanup prevents memory leaks.
•	Non-blocking operations keep UI responsive.
•	Storage limits ensure a manageable data size.
Future Enhancements
•	User login for personal collections.
•	Real backend integration with a live quote API.
•	Dynamic category management.
•	Social media sharing for quotes.
•	Advanced conflict resolution strategies.
File Structure
dom-manipulation/
├── index.html        # Main application file
├── README.md         # Project documentation
└── (optional files)  # Additional modules or assets
Usage Instructions
1.	Clone the repository.
2.	Open the DOM-manipulation folder.
3.	Launch index.html in a web browser.
4.	The app will start automatically with sync enabled.
Troubleshooting
•	Sync Issues: Check the browser console for errors.
•	Storage Issues: Clear localStorage if corrupted.
•	UI Problems: Refresh the page to reset the state.
•	Conflicts: Use developer tools to inspect data.

![Uploading image.png…]()
