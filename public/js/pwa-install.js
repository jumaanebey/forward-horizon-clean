/**
 * PWA Installation Component for Forward Horizon
 * Crisis-focused mobile app experience
 */

class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        this.isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
        this.installButton = null;
        
        this.init();
    }

    init() {
        // Register service worker
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }

        // Listen for install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Handle app installed
        window.addEventListener('appinstalled', () => {
            console.log('PWA installed successfully');
            this.hideInstallPrompt();
            this.showInstallSuccess();
        });

        // Check if already installed
        if (this.isInStandaloneMode) {
            this.hideInstallPrompt();
        }

        // Show install prompt on load if appropriate
        setTimeout(() => this.checkAndShowPrompt(), 3000);
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('Service Worker registered successfully:', registration);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        this.showUpdateNotification();
                    }
                });
            });
            
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }

    checkAndShowPrompt() {
        // Show install prompt if:
        // 1. Not already installed
        // 2. Not iOS (different flow)
        // 3. Browser supports PWA installation
        // 4. User hasn't dismissed it recently
        
        if (this.isInStandaloneMode) return;
        
        const dismissedTime = localStorage.getItem('pwa-install-dismissed');
        if (dismissedTime) {
            const timeDiff = Date.now() - parseInt(dismissedTime);
            if (timeDiff < 7 * 24 * 60 * 60 * 1000) return; // Don't show for 7 days
        }

        if (this.isIOS) {
            this.showIOSInstallPrompt();
        } else if (this.deferredPrompt) {
            this.showInstallPrompt();
        }
    }

    showInstallPrompt() {
        // Create install banner
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'fixed bottom-4 left-4 right-4 bg-white border-2 border-primary rounded-xl shadow-xl z-50 p-4 mx-auto max-w-md';
        banner.innerHTML = `
            <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <i class="fas fa-mobile-alt text-xl"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-text-primary mb-1">Install Forward Horizon App</h4>
                    <p class="text-sm text-readable-secondary mb-3">Get instant access to crisis support, even offline</p>
                    <div class="flex space-x-2">
                        <button id="pwa-install-btn" class="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors">
                            Install App
                        </button>
                        <button id="pwa-dismiss-btn" class="text-readable-light hover:text-text-primary transition-colors text-sm px-2">
                            Not now
                        </button>
                    </div>
                </div>
                <button id="pwa-close-btn" class="text-readable-light hover:text-text-primary text-xl">×</button>
            </div>
        `;

        document.body.appendChild(banner);
        this.installButton = document.getElementById('pwa-install-btn');
        
        // Add event listeners
        this.installButton.addEventListener('click', () => this.installPWA());
        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => this.dismissInstallPrompt());
        document.getElementById('pwa-close-btn').addEventListener('click', () => this.dismissInstallPrompt());
    }

    showIOSInstallPrompt() {
        const banner = document.createElement('div');
        banner.id = 'pwa-install-banner';
        banner.className = 'fixed bottom-4 left-4 right-4 bg-white border-2 border-primary rounded-xl shadow-xl z-50 p-4 mx-auto max-w-md';
        banner.innerHTML = `
            <div class="flex items-start space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white flex-shrink-0">
                    <i class="fas fa-mobile-alt text-xl"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-text-primary mb-1">Add to Home Screen</h4>
                    <p class="text-sm text-readable-secondary mb-2">Install Forward Horizon for quick crisis access:</p>
                    <ol class="text-xs text-readable-secondary space-y-1 mb-3">
                        <li>1. Tap the <i class="fas fa-share"></i> share button</li>
                        <li>2. Select "Add to Home Screen"</li>
                        <li>3. Tap "Add" to install</li>
                    </ol>
                    <button id="pwa-dismiss-btn" class="text-primary hover:text-blue-700 transition-colors text-sm font-semibold">
                        Got it
                    </button>
                </div>
                <button id="pwa-close-btn" class="text-readable-light hover:text-text-primary text-xl">×</button>
            </div>
        `;

        document.body.appendChild(banner);
        
        // Add event listeners
        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => this.dismissInstallPrompt());
        document.getElementById('pwa-close-btn').addEventListener('click', () => this.dismissInstallPrompt());
    }

    async installPWA() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('User accepted PWA installation');
        } else {
            console.log('User dismissed PWA installation');
            this.dismissInstallPrompt();
        }
        
        this.deferredPrompt = null;
    }

    dismissInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.remove();
        }
        
        // Remember dismissal for 7 days
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    }

    hideInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.remove();
        }
    }

    showInstallSuccess() {
        // Show success message briefly
        const successBanner = document.createElement('div');
        successBanner.className = 'fixed top-4 left-4 right-4 bg-secondary text-white rounded-xl shadow-xl z-50 p-4 mx-auto max-w-md';
        successBanner.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-check-circle text-2xl"></i>
                <div>
                    <h4 class="font-bold">App Installed Successfully!</h4>
                    <p class="text-sm text-green-100">Forward Horizon is now available on your home screen</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(successBanner);
        
        setTimeout(() => {
            successBanner.remove();
        }, 4000);
    }

    showUpdateNotification() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'fixed top-4 left-4 right-4 bg-yellow-500 text-white rounded-xl shadow-xl z-50 p-4 mx-auto max-w-md';
        updateBanner.innerHTML = `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-sync-alt text-xl"></i>
                    <div>
                        <h4 class="font-bold">Update Available</h4>
                        <p class="text-sm text-yellow-100">A new version is ready</p>
                    </div>
                </div>
                <button onclick="location.reload()" class="bg-white text-yellow-500 px-3 py-1 rounded font-semibold text-sm hover:bg-gray-100 transition-colors">
                    Update
                </button>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
        
        setTimeout(() => {
            updateBanner.remove();
        }, 8000);
    }

    // Crisis-specific PWA features
    enableCrisisMode() {
        // Add crisis shortcuts to the app
        if ('navigator' in window && 'setAppBadge' in navigator) {
            navigator.setAppBadge(1); // Show badge for urgent attention
        }

        // Enable wake lock if available (keep screen on during crisis)
        if ('wakeLock' in navigator) {
            this.requestWakeLock();
        }
    }

    async requestWakeLock() {
        try {
            const wakeLock = await navigator.wakeLock.request('screen');
            console.log('Screen wake lock activated');
            
            // Release after 10 minutes for battery conservation
            setTimeout(() => {
                wakeLock.release();
                console.log('Screen wake lock released');
            }, 10 * 60 * 1000);
        } catch (err) {
            console.log('Wake lock request failed:', err);
        }
    }

    // Quick action shortcuts
    static addQuickActions() {
        // This would typically be handled by the manifest shortcuts
        // But we can also add dynamic shortcuts via JavaScript API when available
        
        if ('setUserTasks' in navigator) {
            navigator.setUserTasks([
                {
                    name: "Crisis Support",
                    description: "Call immediate crisis support line",
                    iconUrl: "/images/icons/crisis-icon-96x96.png",
                    actionUrl: "tel:(310)488-5280"
                },
                {
                    name: "Apply for Housing",
                    description: "Submit housing application",
                    iconUrl: "/images/icons/apply-icon-96x96.png", 
                    actionUrl: "/application.html"
                }
            ]);
        }
    }
}

// Initialize PWA installer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.pwaInstaller = new PWAInstaller();
    });
} else {
    window.pwaInstaller = new PWAInstaller();
}

// Export for use in other scripts
window.PWAInstaller = PWAInstaller;