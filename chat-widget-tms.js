// chat-widget-tms.js — fixed-position launcher (BR), 90px, orange, faint chat bg, auto-open
(function () {
  const PRIMARY = '#b75536';
  const BG = '#fffaf5';
  const FONT = '#333333';
  const LAUNCHER_SIZE = 90; // px (50% bigger than 60)
  const LOGO_MAX_H = 40;    // px
  const AUTO_OPEN = true;
  const WEBHOOK_URL = 'https://n8n.lmallen.uk/webhook/f406671e-c954-4691-b39a-66c90aa2f103/chat';

  const css = `
  .n8n-chat-widget { position: fixed; right: 20px; bottom: 20px; z-index: 2147483647; pointer-events: none; }
  .n8n-chat-widget * { box-sizing: border-box; font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Inter,system-ui,sans-serif; }

  /* Launcher: force fixed BR */
  .n8n-chat-widget .chat-toggle{
    position: fixed !important; right: 20px !important; bottom: 20px !important; z-index: 2147483647 !important;
    width: ${LAUNCHER_SIZE}px !important; height: ${LAUNCHER_SIZE}px !important; border-radius: 50% !important;
    background: ${PRIMARY} !important; color:#fff !important; border:0; display:flex; align-items:center; justify-content:center;
    box-shadow: 0 8px 24px rgba(0,0,0,.18); cursor:pointer; pointer-events: auto;
  }
  .n8n-chat-widget .chat-toggle svg{ width:${Math.round(LAUNCHER_SIZE*0.37)}px; height:${Math.round(LAUNCHER_SIZE*0.37)}px; }

  /* Panel */
  .n8n-chat-widget .chat-container{
    position: fixed; right: 20px; bottom: ${LAUNCHER_SIZE + 16}px; width: min(92vw, 380px); height: 520px;
    display: none; flex-direction: column; background: ${BG}; color: ${FONT};
    border-radius: 12px; box-shadow: 0 16px 48px rgba(0,0,0,.2); overflow: hidden; border: 1px solid rgba(0,0,0,.06);
    pointer-events: auto;
  }
  .n8n-chat-widget.open .chat-container{ display:flex; }

  .n8n-chat-widget .chat-header{ display:flex; align-items:center; gap:10px; padding:10px 12px; background:${BG}; border-bottom:1px solid rgba(0,0,0,.08); }
  .n8n-chat-widget .chat-header img{ max-height:${LOGO_MAX_H}px; width:auto; height:auto; object-fit:contain; }
  .n8n-chat-widget .chat-messages{ flex:1; overflow:auto; padding:12px; display:flex; flex-direction:column; gap:10px; background:${BG}; }
  .n8n-chat-widget .msg{ max-width:85%; padding:10px 12px; border-radius:12px; line-height:1.35; font-size:14px; }
  .n8n-chat-widget .msg.user{ margin-left:auto; background:#fff; border:1px solid rgba(0,0,0,.08); }
  .n8n-chat-widget .msg.bot{ background:#fdeee7; border:1px solid #f6d0c3; }
  .n8n-chat-widget .chat-input{ display:flex; gap:8px; padding:10px; border-top:1px solid rgba(0,0,0,.08); background:${BG}; }
  .n8n-chat-widget .chat-input input{ flex:1; padding:10px 12px; border-radius:10px; border:1px solid rgba(0,0,0,.15); outline:none; background:#fff; color:${FONT}; }
  .n8n-chat-widget .chat-input button{ background:${PRIMARY}; color:#fff; border:0; border-radius:10px; padding:10px 14px; cursor:pointer; }
  .n8n-chat-widget .chat-footer{ display:none !important; }
  `;

  // Inject styles
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Build widget DOM
  const root = document.createElement('div');
  root.className = 'n8n-chat-widget';
  root.innerHTML = `
    <button class="chat-toggle" aria-label="Open chat">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H9.8l-3.6 2.7c-.9.7-2.2 0-2.2-1.1V5Z" stroke="white" stroke-width="2"/>
        <circle cx="9" cy="9" r="1.5" fill="white"/><circle cx="13" cy="9" r="1.5" fill="white"/><circle cx="17" cy="9" r="1.5" fill="white"/>
      </svg>
    </button>
    <div class="chat-container" role="dialog" aria-label="Mortgage Assistant">
      <div class="chat-header">
        <img src="https://s3.eu-west-1.amazonaws.com/cdn.webfactore.co.uk/e3cbf828-841e-41af-97e4-3f7170f86e6a.png?t=1748510500" alt="Logo" />
        <div>
          <div style="font-weight:600;">Mortgage Assistant</div>
          <div style="font-size:12px;opacity:.8;">Hi 👋, how can we help?</div>
        </div>
      </div>
      <div class="chat-messages"></div>
      <form class="chat-input">
        <input type="text" name="q" placeholder="Type your message..." autocomplete="off"/>
        <button type="submit">Send</button>
      </form>
    </div>
  `;
  document.body.appendChild(root);

  const toggle = root.querySelector('.chat-toggle');
  const panel = root.querySelector('.chat-container');
  const msgs = root.querySelector('.chat-messages');
  const form = root.querySelector('.chat-input');
  const input = form.querySelector('input[name="q"]');

  function setOpen(open){ root.classList.toggle('open', open); }
  toggle.addEventListener('click', () => setOpen(!root.classList.contains('open')));

  function addMsg(text, who='bot'){
    const div = document.createElement('div');
    div.className = `msg ${who}`;
    div.textContent = text;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  // Greeting
  addMsg('Hi 👋, how can we help?', 'bot');

  // Send to n8n
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const text = input.value.trim();
    if(!text) return;
    addMsg(text, 'user'); input.value=''; input.focus();

    const thinking = document.createElement('div');
    thinking.className = 'msg bot'; thinking.textContent = '…';
    msgs.appendChild(thinking); msgs.scrollTop = msgs.scrollHeight;

    try{
      const res = await fetch(WEBHOOK_URL, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message: text, route: 'general' })
      });
      let reply = await res.text();
      try { const j = JSON.parse(reply); reply = j.reply || j.text || j.message || reply; } catch {}
      thinking.remove(); addMsg(String(reply || ''), 'bot');
    }catch{
      thinking.remove(); addMsg('Unable to reach the assistant right now.', 'bot');
    }
  });

  if (AUTO_OPEN) setOpen(true);
})();
