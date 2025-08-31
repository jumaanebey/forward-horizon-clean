/**
 * Offline Support for Forward Horizon PWA
 * Critical functionality for housing crisis situations
 */

class OfflineSupport {
    constructor() {
        this.isOnline = navigator.onLine;
        this.offlineBanner = null;
        this.syncQueue = [];
        
        this.init();
    }

    init() {
        // Monitor network status
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Set initial state
        if (!this.isOnline) {
            this.handleOffline();
        }

        // Store critical information for offline use
        this.cacheCriticalInfo();
        
        // Enable offline form submission
        this.enableOfflineFormSubmission();
    }

    handleOffline() {
        this.isOnline = false;
        this.showOfflineBanner();
        console.log('App is offline - activating crisis mode');
        
        // Store timestamp of when user went offline
        localStorage.setItem('offline-since', Date.now());
        
        // Show offline-specific guidance
        this.showOfflineGuidance();
    }

    handleOnline() {
        this.isOnline = true;
        this.hideOfflineBanner();
        console.log('App is back online - syncing data');
        
        // Process any queued submissions
        this.processSyncQueue();
        
        // Clear offline timestamp
        localStorage.removeItem('offline-since');
    }

    showOfflineBanner() {
        if (this.offlineBanner) return; // Already showing

        this.offlineBanner = document.createElement('div');
        this.offlineBanner.id = 'offline-banner';
        this.offlineBanner.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 z-50 font-semibold';
        this.offlineBanner.innerHTML = `
            <div class="flex items-center justify-center space-x-2">
                <i class="fas fa-wifi-slash"></i>
                <span>You're offline - Emergency numbers still work</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-black hover:text-gray-700">×</button>
            </div>
        `;

        document.body.insertBefore(this.offlineBanner, document.body.firstChild);

        // Adjust page content to account for banner
        document.body.style.paddingTop = '40px';
    }

    hideOfflineBanner() {
        if (this.offlineBanner) {
            this.offlineBanner.remove();
            this.offlineBanner = null;
            document.body.style.paddingTop = '0';
        }
    }

    showOfflineGuidance() {
        // Only show if user has been offline for more than 30 seconds
        setTimeout(() => {
            if (!this.isOnline) {
                const guidance = document.createElement('div');
                guidance.className = 'fixed bottom-4 left-4 right-4 bg-accent text-white rounded-xl shadow-xl z-40 p-4 mx-auto max-w-md';
                guidance.innerHTML = `
                    <div class="text-center">
                        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
                        <h4 class="font-bold mb-2">In Crisis? You Can Still Get Help</h4>
                        <div class="space-y-2 text-sm">
                            <p><strong>Emergency:</strong> Call 911</p>
                            <p><strong>Crisis Support:</strong> <a href="tel:(310)488-5280" class="underline font-semibold">(310) 488-5280</a></p>
                            <p><strong>National Suicide Prevention:</strong> <a href="tel:988" class="underline font-semibold">988</a></p>
                        </div>
                        <button onclick="this.parentElement.remove()" class="mt-3 bg-white text-accent px-4 py-2 rounded font-semibold text-sm">
                            Got it
                        </button>
                    </div>
                `;
                document.body.appendChild(guidance);

                // Auto-remove after 10 seconds
                setTimeout(() => {
                    if (guidance.parentElement) guidance.remove();
                }, 10000);
            }
        }, 30000);
    }

    cacheCriticalInfo() {
        // Cache essential information for offline access
        const criticalInfo = {
            crisisNumbers: {
                emergency: '911',
                forwardHorizon: '(310) 488-5280',
                nationalSuicide: '988',
                nationalHomeless: '1-877-424-3838'
            },
            emergencyContacts: [
                {
                    name: 'Forward Horizon Crisis Line',
                    phone: '(310) 488-5280',
                    description: 'Available 24/7 for housing emergencies'
                },
                {
                    name: 'LA County Emergency Shelter',
                    phone: '211',
                    description: 'Information and referrals'
                },
                {
                    name: 'Veterans Crisis Line',
                    phone: '1-800-273-8255',
                    description: 'For veterans in crisis'
                }
            ],
            offlineGuidance: {
                immediate: [
                    'If you are in immediate danger, call 911',
                    'For housing crisis, call (310) 488-5280',
                    'Find safe shelter - library, 24hr business, hospital'
                ],
                nextSteps: [
                    'Contact 211 for local resources',
                    'Visit nearest police station if unsafe',
                    'Go to hospital emergency room if needed'
                ],
                documents: [
                    'Keep ID and important papers with you',
                    'Take photos of documents with phone',
                    'Remember social security number'
                ]
            },
            shelterLocations: [
                {
                    name: 'Union Rescue Mission',
                    address: '545 S San Pedro St, Los Angeles, CA 90013',
                    phone: '(213) 347-6300',
                    hours: '24/7'
                },
                {
                    name: 'LA Mission',
                    address: '303 E 5th St, Los Angeles, CA 90013', 
                    phone: '(213) 629-1227',
                    hours: '24/7'
                }
            ],
            lastUpdated: Date.now()
        };

        localStorage.setItem('forward-horizon-critical-info', JSON.stringify(criticalInfo));
    }

    getCriticalInfo() {
        const stored = localStorage.getItem('forward-horizon-critical-info');
        return stored ? JSON.parse(stored) : null;
    }

    enableOfflineFormSubmission() {
        // Intercept form submissions when offline
        document.addEventListener('submit', async (event) => {
            if (!this.isOnline && event.target.tagName === 'FORM') {
                event.preventDefault();
                await this.handleOfflineSubmission(event.target);
            }
        });
    }

    async handleOfflineSubmission(form) {
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Add metadata
        const submission = {
            id: Date.now(),
            formAction: form.action || window.location.href,
            formMethod: form.method || 'POST',
            data: data,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };

        // Store for later submission
        const stored = localStorage.getItem('offline-submissions') || '[]';
        const submissions = JSON.parse(stored);
        submissions.push(submission);
        localStorage.setItem('offline-submissions', JSON.stringify(submissions));

        // Show confirmation
        this.showOfflineSubmissionConfirm();

        // Try to register for background sync if available
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            const registration = await navigator.serviceWorker.ready;
            try {
                await registration.sync.register('form-submission');
                console.log('Background sync registered for form submission');
            } catch (err) {
                console.log('Background sync registration failed:', err);
            }
        }
    }

    showOfflineSubmissionConfirm() {
        const confirm = document.createElement('div');
        confirm.className = 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white border-2 border-secondary rounded-xl shadow-2xl z-50 p-6 max-w-sm mx-4';
        confirm.innerHTML = `
            <div class="text-center">
                <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                    <i class="fas fa-check"></i>
                </div>
                <h3 class="font-bold text-lg mb-2">Form Saved Offline</h3>
                <p class="text-readable-secondary mb-4">
                    Your application has been saved. It will be submitted automatically when you're back online.
                </p>
                <p class="text-sm text-readable-light mb-4">
                    <strong>Need immediate help?</strong><br>
                    Call <a href="tel:(310)488-5280" class="text-primary font-semibold">(310) 488-5280</a>
                </p>
                <button onclick="this.parentElement.remove()" class="bg-primary text-white px-6 py-2 rounded-lg font-semibold">
                    OK
                </button>
            </div>
        `;
        
        document.body.appendChild(confirm);
        
        // Auto-remove after 8 seconds
        setTimeout(() => {
            if (confirm.parentElement) confirm.remove();
        }, 8000);
    }

    async processSyncQueue() {
        const stored = localStorage.getItem('offline-submissions');
        if (!stored) return;

        const submissions = JSON.parse(stored);
        let processed = 0;

        for (const submission of submissions) {
            try {
                const response = await fetch(submission.formAction, {
                    method: submission.formMethod,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(submission.data)
                });

                if (response.ok) {
                    processed++;
                    console.log('Offline submission processed successfully:', submission.id);
                }
            } catch (error) {
                console.log('Failed to process offline submission:', submission.id, error);
            }
        }

        // Remove processed submissions
        if (processed > 0) {
            const remaining = submissions.slice(processed);
            localStorage.setItem('offline-submissions', JSON.stringify(remaining));
            
            // Show sync success message
            this.showSyncSuccessMessage(processed);
        }
    }

    showSyncSuccessMessage(count) {
        const message = document.createElement('div');
        message.className = 'fixed top-4 right-4 bg-secondary text-white rounded-xl shadow-xl z-50 p-4';
        message.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-sync-alt text-xl"></i>
                <div>
                    <h4 class="font-bold">Submissions Synced</h4>
                    <p class="text-sm text-green-100">${count} form${count !== 1 ? 's' : ''} submitted successfully</p>
                </div>
            </div>
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.remove();
        }, 4000);
    }

    // Crisis-specific offline features
    showOfflineCrisisInfo() {
        const info = this.getCriticalInfo();
        if (!info) return;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-text-primary">Emergency Resources (Offline)</h2>
                        <button onclick="this.closest('.fixed').remove()" class="text-readable-light hover:text-text-primary text-2xl">×</button>
                    </div>
                    
                    <div class="space-y-6">
                        <div class="bg-red-50 border-l-4 border-accent p-4 rounded">
                            <h3 class="font-bold text-accent mb-2">Immediate Help</h3>
                            <div class="space-y-1 text-sm">
                                ${info.offlineGuidance.immediate.map(item => `<p>• ${item}</p>`).join('')}
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-bold text-text-primary mb-3">Emergency Numbers</h3>
                            <div class="space-y-2">
                                ${info.emergencyContacts.map(contact => `
                                    <div class="flex justify-between items-center py-2 border-b border-gray-200">
                                        <div>
                                            <p class="font-semibold">${contact.name}</p>
                                            <p class="text-sm text-readable-secondary">${contact.description}</p>
                                        </div>
                                        <a href="tel:${contact.phone.replace(/[^\d]/g, '')}" class="bg-primary text-white px-3 py-1 rounded font-semibold text-sm">
                                            ${contact.phone}
                                        </a>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div>
                            <h3 class="font-bold text-text-primary mb-3">Emergency Shelters</h3>
                            <div class="space-y-3">
                                ${info.shelterLocations.map(shelter => `
                                    <div class="bg-gray-50 p-3 rounded">
                                        <p class="font-semibold">${shelter.name}</p>
                                        <p class="text-sm text-readable-secondary">${shelter.address}</p>
                                        <div class="flex justify-between mt-2">
                                            <span class="text-sm text-readable-light">${shelter.hours}</span>
                                            <a href="tel:${shelter.phone.replace(/[^\d]/g, '')}" class="text-primary font-semibold text-sm">
                                                ${shelter.phone}
                                            </a>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Create offline indicator in navigation
    addOfflineIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'offline-indicator';
        indicator.className = 'fixed top-20 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold z-40';
        indicator.innerHTML = `
            <i class="fas fa-wifi-slash mr-1"></i>
            <span>Offline</span>
        `;
        
        document.body.appendChild(indicator);
    }
}

// Initialize offline support
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.offlineSupport = new OfflineSupport();
    });
} else {
    window.offlineSupport = new OfflineSupport();
}

// Make it available globally
window.OfflineSupport = OfflineSupport;