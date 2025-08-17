/**
 * Testing Module for Dynamic Quote Generator with Server Sync
 * Run this in browser console to test sync functionality
 */

class SyncTester {
    constructor() {
        this.testResults = [];
        this.testCount = 0;
    }

    // Main test runner
    async runAllTests() {
        console.log('🚀 Starting Sync Tests...');
        console.log('================================');

        await this.testLocalStorage();
        await this.testServerFetch();
        await this.testConflictDetection();
        await this.testMergeLogic();
        await this.testErrorHandling();
        
        this.displayResults();
    }

    // Test local storage functionality
    async testLocalStorage() {
        console.log('📦 Testing Local Storage...');
        
        const testData = [
            { id: 'test1', text: 'Test quote 1', category: 'test' },
            { id: 'test2', text: 'Test quote 2', category: 'test' }
        ];

        try {
            // Save test data
            localStorage.setItem('testQuotes', JSON.stringify(testData));
            
            // Retrieve and verify
            const retrieved = JSON.parse(localStorage.getItem('testQuotes'));
            
            if (retrieved.length === 2 && retrieved[0].id === 'test1') {
                this.logTest('Local Storage Save/Load', true);
            } else {
                this.logTest('Local Storage Save/Load', false, 'Data mismatch');
            }

            // Cleanup
            localStorage.removeItem('testQuotes');
            
        } catch (error) {
            this.logTest('Local Storage Save/Load', false, error.message);
        }
    }

    // Test server data fetching
    async testServerFetch() {
        console.log('🌐 Testing Server Fetch...');
        
        try {
            const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=2');
            
            if (response.ok) {
                const data = await response.json();
                
                if (Array.isArray(data) && data.length > 0) {
                    this.logTest('Server Data Fetch', true);
                } else {
                    this.logTest('Server Data Fetch', false, 'Invalid data format');
                }
            } else {
                this.logTest('Server Data Fetch', false, `HTTP ${response.status}`);
            }
            
        } catch (error) {
            this.logTest('Server Data Fetch', false, error.message);
        }
    }

    // Test conflict detection logic
    async testConflictDetection() {
        console.log('⚡ Testing Conflict Detection...');
        
        const localQuotes = [
            { id: 'quote1', text: 'Original text', category: 'test' },
            { id: 'quote2', text: 'Another quote', category: 'test' }
        ];

        const serverQuotes = [
            { id: 'quote1', text: 'Modified text', category: 'test' }, // Conflict
            { id: 'quote3', text: 'New server quote', category: 'server' } // No conflict
        ];

        try {
            const conflicts = this.detectTestConflicts(localQuotes, serverQuotes);
            
            if (conflicts.length === 1 && conflicts[0].id === 'quote1') {
                this.logTest('Conflict Detection', true);
            } else {
                this.logTest('Conflict Detection', false, `Expected 1 conflict, found ${conflicts.length}`);
            }
            
        } catch (error) {
            this.logTest('Conflict Detection', false, error.message);
        }
    }

    // Test merge logic
    async testMergeLogic() {
        console.log('🔄 Testing Merge Logic...');
        
        const localQuotes = [
            { id: 'local1', text: 'Local quote 1', category: 'local' },
            { id: 'local2', text: 'Local quote 2', category: 'local' }
        ];
