## 2024-02-14 - Socket.IO Stored XSS
**Vulnerability:** Socket.IO event handlers (`send_message`, `guild_message`) in `backend/server.js` were blindly broadcasting user input back to clients. This allowed for Stored XSS if the frontend rendered these messages as HTML.
**Learning:** Real-time event handlers often bypass standard Express middleware (like `express-validator` or `helmet`'s HTTP headers), leaving them vulnerable if not explicitly sanitized within the event handler itself.
**Prevention:** Always sanitize inputs at the point of entry. For Socket.IO, this means implementing validation and sanitization (using `sanitize-html` or similar) directly inside the `socket.on` callbacks before emitting data.
