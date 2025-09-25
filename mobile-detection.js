// Mobile Detection and Warning System
class MobileDetection {
    constructor() {
        this.init();
    }

    // Detect if user is on mobile device
    isMobile() {
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        // Check for mobile user agents
        const mobileRegex = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i;
        
        // Check screen size (fallback)
        const smallScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
        
        // Check for touch capability
        const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        return mobileRegex.test(userAgent) || (smallScreen && touchDevice);
    }

    // Create and show the mobile warning overlay
    showMobileWarning() {
        // Create overlay container
        const overlay = document.createElement('div');
        overlay.id = 'mobile-warning-overlay';
        overlay.className = 'mobile-warning-overlay';
        
        // Create content container
        const content = document.createElement('div');
        content.className = 'mobile-warning-content';
        
        // Create warning message
        const title = document.createElement('h2');
        title.innerHTML = '⚠️ PUNY DEVICE DETECTED ⚠️';
        title.className = 'mobile-warning-title';
        
        const message = document.createElement('p');
        message.innerHTML = `
            This website is <strong>NOT</strong> optimized for mobile viewing 
            (and probably never will be, let's be honest here 📱💀).<br><br>
            It's best experienced on a proper desktop monitor where you can 
            actually see the chess pieces without squinting like a confused pirate! 🏴‍☠️
        `;
        message.className = 'mobile-warning-message';
        
        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'mobile-warning-buttons';
        
        // Create "Leave" button
        const leaveButton = document.createElement('button');
        leaveButton.innerHTML = '🚪 Okay, I\'ma leave then';
        leaveButton.className = 'mobile-warning-btn leave-btn';
        leaveButton.onclick = () => {
            // Take user to browser homepage or close tab
            try {
                window.location.href = 'about:home';
            } catch (e) {
                // Fallback for browsers that don't support about:home
                window.history.back();
                setTimeout(() => {
                    window.close();
                }, 100);
            }
        };
        
        // Create "Continue" button
        const continueButton = document.createElement('button');
        continueButton.innerHTML = '💪 Nah, I wanna continue';
        continueButton.className = 'mobile-warning-btn continue-btn';
        continueButton.onclick = () => {
            this.hideMobileWarning();
        };
        
        // Assemble the elements
        buttonContainer.appendChild(leaveButton);
        buttonContainer.appendChild(continueButton);
        
        content.appendChild(title);
        content.appendChild(message);
        content.appendChild(buttonContainer);
        
        overlay.appendChild(content);
        
        // Add to page
        document.body.appendChild(overlay);
        
        // Add some dramatic entrance animation
        setTimeout(() => {
            overlay.classList.add('show');
        }, 100);
    }

    // Hide the mobile warning overlay
    hideMobileWarning() {
        const overlay = document.getElementById('mobile-warning-overlay');
        if (overlay) {
            overlay.classList.add('hide');
            setTimeout(() => {
                overlay.remove();
            }, 300);
        }
    }

    // Initialize the mobile detection
    init() {
        // Check if user is on mobile when page loads
        if (this.isMobile()) {
            // Show warning after a brief delay to let page load
            setTimeout(() => {
                this.showMobileWarning();
            }, 500);
        }
        
        // Also check on window resize (in case user rotates device or changes window size)
        window.addEventListener('resize', () => {
            if (this.isMobile() && !document.getElementById('mobile-warning-overlay')) {
                this.showMobileWarning();
            }
        });
    }
}

// Initialize mobile detection when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MobileDetection();
});

// Also initialize immediately if DOM is already loaded (just in case)
if (document.readyState === 'loading') {
    // DOM is still loading, wait for DOMContentLoaded
} else {
    // DOM is already loaded
    new MobileDetection();
}