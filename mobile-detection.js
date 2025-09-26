/**
 * Mobile Detection and Warning System
 * 
 * Detects mobile devices and displays a humorous warning message
 * informing users that the chess application is not optimized for mobile viewing.
 * Uses multiple detection methods for better accuracy.
 */
class MobileDetection {
    /**
     * Initialize the mobile detection system
     */
    constructor() {
        this.init();
    }

    /**
     * Detects if the user is on a mobile device using multiple methods
     * @returns {boolean} True if mobile device is detected
     */
    isMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Primary detection: Check for mobile user agent strings
        const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
        
        // Secondary detection: Check screen size (fallback method)
        const smallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
        
        // Tertiary detection: Check for touch capability
        const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return mobileRegex.test(userAgent) || (smallScreen && touchDevice);
    }

    /**
     * Creates and displays the mobile warning overlay with humorous messaging
     * Dynamically builds the warning interface with appropriate styling and actions
     */
    showMobileWarning() {
        // Create main overlay container
        const overlay = document.createElement('div');
        overlay.id = 'mobile-warning-overlay';
        overlay.className = 'mobile-warning-overlay';
        
        // Create content wrapper
        const content = document.createElement('div');
        content.className = 'mobile-warning-content';
        
        // Create warning title with emoji for visual impact
        const title = document.createElement('h2');
        title.innerHTML = '⚠️ PUNY DEVICE DETECTED ⚠️';
        title.className = 'mobile-warning-title';
        
        // Create humorous warning message
        const message = document.createElement('p');
        message.innerHTML = `
            This website is <strong>NOT</strong> optimized for mobile viewing 
            (and probably never will be, let's be honest here 📱💀).<br><br>
            It's best experienced on a proper desktop monitor where you can 
            actually see the chess pieces without squinting like a confused pirate! 🏴‍☠️
        `;
        message.className = 'mobile-warning-message';
        
        // Create container for action buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'mobile-warning-buttons';
        
        // Create "Leave" button - attempts to navigate away from the site
        const leaveButton = document.createElement('button');
        leaveButton.innerHTML = '🚪 Okay, I\'ma leave then';
        leaveButton.className = 'mobile-warning-btn leave-btn';
        leaveButton.onclick = () => {
            // Try multiple methods to navigate away or close tab
            try {
                window.location.href = 'about:home';
            } catch (e) {
                // Fallback: go back in history then attempt to close
                window.history.back();
                setTimeout(() => {
                    window.close();
                }, 100);
            }
        };
        
        // Create "Continue" button - dismisses the warning
        const continueButton = document.createElement('button');
        continueButton.innerHTML = '💪 Nah, I wanna continue';
        continueButton.className = 'mobile-warning-btn continue-btn';
        continueButton.onclick = () => {
            this.hideMobileWarning();
        };
        
        // Assemble all elements into the overlay structure
        buttonContainer.appendChild(leaveButton);
        buttonContainer.appendChild(continueButton);
        
        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(buttonContainer);
        
        overlay.appendChild(content);
        
        // Add overlay to the page
        document.body.appendChild(overlay);
        
        // Trigger entrance animation after a brief delay
        setTimeout(() => {
            overlay.classList.add('show');
        }, 100);
    }

    /**
     * Hides the mobile warning overlay with exit animation
     * Removes the overlay from DOM after animation completes
     */
    hideMobileWarning() {
        const overlay = document.getElementById('mobile-warning-overlay');
        if (overlay) {
            overlay.classList.add('hide');
            // Remove element after animation finishes
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    /**
     * Initializes the mobile detection system
     * Sets up detection on page load and window resize events
     */
    init() {
        // Check for mobile device when page initially loads
        if (this.isMobile()) {
            // Delay warning to allow page to fully load first
            setTimeout(() => {
                this.showMobileWarning();
            }, 500);
        }
        
        // Monitor for window resize events (device rotation, window resizing)
        window.addEventListener('resize', () => {
            // Show warning if mobile is detected and warning isn't already shown
            if (this.isMobile() && !document.getElementById('mobile-warning-overlay')) {
                this.showMobileWarning();
            }
        });
    }
}

// === INITIALIZATION ===

/**
 * Initialize mobile detection when DOM is fully loaded
 * Uses DOMContentLoaded event to ensure all elements are available
 */
document.addEventListener('DOMContentLoaded', () => {
    new MobileDetection();
});

/**
 * Fallback initialization in case DOM is already loaded when this script runs
 * Handles cases where the script is loaded after DOMContentLoaded has already fired
 */
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded event
} else {
    // DOM is already loaded, initialize immediately
    new MobileDetection();
}