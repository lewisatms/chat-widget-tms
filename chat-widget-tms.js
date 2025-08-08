(function () {
    const PRIMARY = '#b75536';
    const BG = '#fffaf5';
    const FONT = '#333333';
    const LAUNCHER_SIZE = 90; // px
    const LOGO_MAX_H = 40;    // px
    const AUTO_OPEN = true;   // open chat on load

    const WEBHOOK_URL = 'https://n8n.lmallen.uk/webhook/f406671e-c954-4691-b39a-66c90aa2f103/chat';

    const css = `
    .n8n-chat-widget * { box-sizing: border-box; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Inter,system-ui,sans-serif; }
    .n8n-chat-widget { --primary:${PRIMARY}; --bg:${BG}; --font:${FONT}; }
    .n8n-chat-widget .chat-container { background: var(--bg) !important; color: var(--font); }
    .n8n-chat-widget .chat-header { background: var(--bg) !important; }
    .n8n-chat-widget .chat-header img {
      max-height: ${LOGO_MAX_H}px !important;
      width: auto !important;
      height: auto !important;
      object-fit: contain !important;
    }
    .n8n-chat-widget .chat-footer { display: none !important; }
    .n8n-chat-widget .chat-toggle {
      width: ${LAUNCHER_SIZE}px !important;
      height: ${LAUNCHER_SIZE}px !important;
      border-radius: 50% !important;
      background: var(--primary) !important;
      color: #fff !important;
    }
    .n8n-chat-widget .chat-toggle svg {
      width: ${Math.round(LAUNCHER_SIZE * 0.37)}px !important;
      height: ${Math.round(LAUNCHER_SIZE * 0.37)}px !important;
    }
    `;

    // Inject style
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    // Create widget HTML
    const widget = document.createElement('div');
    widget.className = 'n8n-chat-widget';
    widget.innerHTML = `
      <button class="chat-toggle" aria-label="Open chat">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9.8l-3.6 2.7c-.9.7-2.2 0-2.2-1.1V5Z" stroke="white" stroke-width="2" />
          <circle cx="9" cy="9" r="1.5" fill="white"/><circle cx="13" cy="9" r="1.5" fill="white"/><circle cx="17" cy="9" r="1.5" fill="white"/>
        </svg>
      </button>
      <div class="chat-container" style="display:none; flex-direction:column; width:320px; height:500px; position:fixed; bottom:${LAUNCHER_SIZE + 20}px; right:20px; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.2); overflow:hidden;">
        <div class="chat-header" style="display:flex; align-items:center; gap:10px; padding:10px;">
          <img src="https://s3.eu-west-1.amazonaws.com/cdn.webfactore.co.uk/e3cbf828-841e-41af-97e4-3f7170f86e6a.png?t=1748510500" alt="Logo">
          <div>
            <div style="font-weight:600;">Mortgage Assistant</div>
            <div style="font-size:12px; opacity:0.8;">Hi 👋, how can we help?</div>
          </div>
        </div>
        <div class="chat-messages" style="flex:1; overflow:auto; padding:10px;"></div>
        <form class="chat-input" style="display:flex; gap:8px; padding:10px; border-top:1px solid rgba(0,0,0,0.1);">
          <input type="text" placeholder="Type your message..." style="flex:1; padding:8px; border-radius:8px; border:1px solid rgba(0,0,0,0.2);" />
          <button type="submit" style="background:${PRIMARY}; color:#fff; border:0; border-radius:8px; padding:8px 12px;">Send</button>
        </form>
      </div>
    `;
    document.body.appendChild(widget);

    const toggle = widget.querySelector('.chat-toggle');
    const container = widget.querySelector('.chat-container');
    const messages = widget.querySelector('.chat-messages');
    const form = widget.querySelector('.chat-input');
    const input = form.querySelector('input');

    function addMessage(text, sender) {
        const msg = document.createElement('div');
        msg.style.marginBottom = '8px';
        msg.style.padding = '8px 12px';
        msg.style.borderRadius = '10px';
        msg.style.maxWidth = '80%';
        msg.style.wordWrap = 'break-word';
        msg.style.fontSize = '14px';
        if (sender === 'user') {
            msg.style.background = '#fff';
            msg.style.border = '1px solid rgba(0,0,0,0.1)';
            msg.style.marginLeft = 'auto';
        } else {
            msg.style.background = '#fdeee7';
            msg.style.border = '1px solid #f6d0c3';
        }
        msg.textContent = text;
        messages.appendChild(msg);
        messages.scrollTop = messages.scrollHeight;
    }

    toggle.addEventListener('click', () => {
        container.style.display = container.style.display === 'none' ? 'flex' : 'none';
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        addMessage(text, 'user');
        input.value = '';

        addMessage('…', 'bot');
        try {
            const res = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, route: 'general' })
            });
            let reply = await res.text();
            try {
                const json = JSON.parse(reply);
                reply = json.reply || json.text || reply;
            } catch {}
            messages.lastChild.remove();
            addMessage(reply, 'bot');
        } catch {
            messages.lastChild.remove();
            addMessage('Unable to reach the assistant right now.', 'bot');
        }
    });

    if (AUTO_OPEN) {
        setTimeout(() => {
            container.style.display = 'flex';
        }, 500);
    }
})();
