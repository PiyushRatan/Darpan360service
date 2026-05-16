/**
 * Chatbot Integration Platform - IFrame Injector
 * Users will place this script on their website:
 * <script src="https://your-frontend.com/widget.js" data-bot-id="12345" data-avatar-url="https://client.com/logo.png" crossorigin="anonymous"></script>
 */

(function() {
    // 1. Find the script tag that loaded this file to extract runtime settings.
    const scripts = document.getElementsByTagName('script');
    let botId = null;
    let currentScript = document.currentScript;
    
    // Look for our specific script to grab the data-bot-id attribute
    for (let script of scripts) {
        if (script.src.includes('widget.js') && script.hasAttribute('data-bot-id')) {
            currentScript = script;
            botId = script.getAttribute('data-bot-id');
            break;
        }
    }

    if (!botId) {
        console.error("Chatbot Widget Error: No data-bot-id provided in the script tag.");
        return;
    }

    // 2. Dynamically calculate the chat URL from where this widget script is hosted.
    // This allows local testing and live deploys to use the same script file.
    const scriptSrc = currentScript ? currentScript.src : 'https://darpan360ai.web.app/widget.js';
    const domainOrigin = new URL(scriptSrc).origin;
    const sourceOrigin = window.location.origin && window.location.origin !== 'null'
        ? window.location.origin
        : '';
    const iframeUrl = `${domainOrigin}/chat/${encodeURIComponent(botId)}${sourceOrigin ? `?sourceOrigin=${encodeURIComponent(sourceOrigin)}` : ''}`;
    const defaultLogoUrl = `${domainOrigin}/logo.png`;
    const configuredAvatarUrl = currentScript?.getAttribute('data-avatar-url') || '';

    const isValidImageUrl = (value) => {
        if (!value || typeof value !== 'string') return false;

        try {
            const parsed = new URL(value);
            return parsed.protocol === 'https:' || parsed.protocol === 'http:';
        } catch {
            return false;
        }
    };

    const createSafeImage = () => {
        const image = new Image();
        image.referrerPolicy = 'no-referrer';
        image.decoding = 'async';
        return image;
    };

    // 3. Create the Floating Action Button (FAB)
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', 'Open chat');
    button.innerHTML = `<img src="${defaultLogoUrl}" alt="" referrerpolicy="no-referrer" style="width: 32px; height: 32px; border-radius: 50%; object-fit: contain;">`;
    const buttonImage = button.querySelector('img');
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
        overflow: hidden;
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

    const style = document.createElement('style');
    style.textContent = `
        @keyframes darpanWidgetProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(260%); }
        }
        @keyframes darpanWidgetPulse {
            0%, 100% { opacity: 0.48; }
            50% { opacity: 0.82; }
        }
    `;

    const loader = document.createElement('div');
    loader.style.cssText = `
        position: absolute;
        inset: 0;
        display: grid;
        grid-template-rows: auto 1fr auto;
        background: #111111;
        color: #9ca3af;
        font-family: Inter, ui-sans-serif, system-ui, sans-serif;
        z-index: 2;
    `;
    loader.innerHTML = `
        <div style="height: 68px; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-bottom: 1px solid #2a2a2a; background: #181818;">
            <div style="width: 36px; height: 36px; border-radius: 50%; background: #262626; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                <img src="${defaultLogoUrl}" alt="" referrerpolicy="no-referrer" style="width: 25px; height: 25px; object-fit: contain; opacity: .82;">
            </div>
            <div style="display: grid; gap: 7px; width: 148px;">
                <span style="height: 9px; width: 118px; border-radius: 999px; background: #2d2d2d; animation: darpanWidgetPulse 1.4s ease-in-out infinite;"></span>
                <span style="height: 7px; width: 86px; border-radius: 999px; background: #272727; animation: darpanWidgetPulse 1.4s .18s ease-in-out infinite;"></span>
            </div>
        </div>
        <div style="display: flex; flex-direction: column; justify-content: flex-end; gap: 14px; padding: 18px 16px;">
            <div style="align-self: flex-start; width: 78%; padding: 12px; border: 1px solid #2a2a2a; background: #1c1c1c; border-radius: 10px 10px 10px 2px;">
                <span style="display:block;height:8px;width:88%;border-radius:999px;background:#303030;animation:darpanWidgetPulse 1.4s ease-in-out infinite;"></span>
                <span style="display:block;height:8px;width:62%;margin-top:8px;border-radius:999px;background:#292929;animation:darpanWidgetPulse 1.4s .16s ease-in-out infinite;"></span>
            </div>
            <div style="align-self: flex-end; width: 62%; padding: 12px; border: 1px solid #2a2a2a; background: #232323; border-radius: 10px 10px 2px 10px;">
                <span style="display:block;height:8px;width:82%;border-radius:999px;background:#343434;animation:darpanWidgetPulse 1.4s .26s ease-in-out infinite;"></span>
            </div>
            <div style="align-self: flex-start; width: 70%; padding: 12px; border: 1px solid #2a2a2a; background: #1c1c1c; border-radius: 10px 10px 10px 2px;">
                <span style="display:block;height:8px;width:76%;border-radius:999px;background:#303030;animation:darpanWidgetPulse 1.4s .12s ease-in-out infinite;"></span>
                <span style="display:block;height:8px;width:48%;margin-top:8px;border-radius:999px;background:#292929;animation:darpanWidgetPulse 1.4s .28s ease-in-out infinite;"></span>
            </div>
        </div>
        <div style="padding: 14px 16px 16px; border-top: 1px solid #2a2a2a; background: #181818;">
            <div style="height: 40px; border: 1px solid #2a2a2a; border-radius: 999px; background: #101010;"></div>
            <div style="position: relative; height: 2px; overflow: hidden; margin-top: 12px; border-radius: 999px; background: #242424;">
                <span style="position:absolute;inset:0 auto 0 0;width:34%;background:#8b949e;animation:darpanWidgetProgress 1.35s ease-in-out infinite;"></span>
            </div>
            <div style="margin-top: 10px; font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: #737373;">
                Opening chat
            </div>
        </div>
    `;
    const loaderImage = loader.querySelector('img');

    let activeImageRequest = 0;
    const applyWidgetImage = (imageUrl, fit = 'contain') => {
        [buttonImage, loaderImage].forEach((image) => {
            if (!image) return;
            image.onerror = null;
            image.style.objectFit = fit;
            image.style.borderRadius = '50%';
            image.src = imageUrl;
        });
    };

    const setWidgetImage = (imageUrl) => {
        const nextImageUrl = isValidImageUrl(imageUrl) ? imageUrl : defaultLogoUrl;
        const requestId = ++activeImageRequest;

        if (nextImageUrl === defaultLogoUrl) {
            applyWidgetImage(defaultLogoUrl, 'contain');
            return;
        }

        const preload = createSafeImage();
        preload.onload = () => {
            if (requestId !== activeImageRequest) return;
            applyWidgetImage(nextImageUrl, 'cover');
        };
        preload.onerror = () => {
            if (requestId !== activeImageRequest) return;
            applyWidgetImage(defaultLogoUrl, 'contain');
        };
        preload.src = nextImageUrl;

        // Keep the current image visible while the profile image is being fetched.
        [buttonImage, loaderImage].forEach((image) => {
            if (!image) return;
            image.onerror = () => {
                image.onerror = null;
                image.src = defaultLogoUrl;
            };
        });
    };
    setWidgetImage(configuredAvatarUrl);

    const iframe = document.createElement('iframe');
    iframe.src = iframeUrl;
    iframe.title = 'Darpan360 chat';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
    `;
    iframe.addEventListener('load', () => {
        loader.style.opacity = '0';
        loader.style.transition = 'opacity 220ms ease';
        setTimeout(() => loader.remove(), 240);
    });

    document.head.appendChild(style);
    iframeContainer.appendChild(loader);
    iframeContainer.appendChild(iframe);
    document.body.appendChild(button);
    document.body.appendChild(iframeContainer);

    window.addEventListener('message', (event) => {
        if (event.origin !== domainOrigin || !event.data || event.data.type !== 'DARPAN_WIDGET_CONFIG') return;
        if (String(event.data.botId) !== String(botId)) return;

        setWidgetImage(event.data.avatarImgUrl || configuredAvatarUrl);

        if (event.data.botName) {
            button.setAttribute('aria-label', `Open ${event.data.botName} chat`);
        }
    });

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
