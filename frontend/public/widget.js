/**
 * Chatbot Integration Platform - IFrame Injector
 * Users will place this script on their website:
 * <script src="https://our-api.com/widget.js" data-bot-id="12345"></script>
 */

(function() {
    // 1. Find the script tag that loaded this file to extract the Bot ID
    const scripts = document.getElementsByTagName('script');
    let botId = null;
    
    // Look for our specific script to grab the data-bot-id attribute
    for (let script of scripts) {
        if (script.src.includes('widget.js') && script.hasAttribute('data-bot-id')) {
            botId = script.getAttribute('data-bot-id');
            break;
        }
    }

    if (!botId) {
        console.error("Chatbot Widget Error: No data-bot-id provided in the script tag.");
        return;
    }

    // 2. We dynamically calculate the IFrame URL based on where THIS specific widget.js script is hosted!
    // This allows seamless local testing (localhost:5173/chat/1) alongside live Vercel/Firebase deploys (domain.com/chat/1)
    const scriptSrc = document.currentScript ? document.currentScript.src : 'https://darpan360ai.web.app/widget.js'; // Fallback
    const domainOrigin = new URL(scriptSrc).origin;
    const iframeUrl = `${domainOrigin}/chat/${botId}`;

    // 3. Create the Floating Action Button (FAB)
    const button = document.createElement('button');
    button.innerHTML = `
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 28px; height: 28px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
        </svg>
    `;
    button.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: #1E1E1E; /* Default Builder Theme Dark */
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        cursor: pointer;
        z-index: 999999;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: transform 0.2s ease;
    `;

    // 4. Create the IFrame Container (Hidden by default)
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 380px;
        height: 600px;
        max-height: 80vh;
        max-width: 90vw;
        border-radius: 6px; /* Strict Design: Minimal rounding */
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        overflow: hidden;
        z-index: 999999;
        display: none;
        background-color: #1a1a1a;
        border: 1px solid #333;
    `;

    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
    `;

    iframeContainer.appendChild(iframe);
    document.body.appendChild(button);
    document.body.appendChild(iframeContainer);

    // 5. Toggle Logic
    let isOpen = false;
    button.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframeContainer.style.display = 'block';
            button.style.transform = 'scale(0.9)';
        } else {
            iframeContainer.style.display = 'none';
            button.style.transform = 'scale(1)';
        }
    });
})();
