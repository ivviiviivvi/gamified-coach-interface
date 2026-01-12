# Sentinel's Journal

## 2024-05-22 - Missing Input Validation in Auth
**Vulnerability:** The authentication endpoints (`/register`, `/login`) lacked robust input validation and sanitization. While Sequelize provided some database-level validation (like `isEmail`), the controller did not validate input before processing, leading to potential bad data reaching the DB logic and weaker error feedback.
**Learning:** Always validate input at the edge of the application (controller/route level) before it reaches domain logic or database layers.
**Prevention:** Implemented `express-validator` middleware on auth routes to enforce email formats, password length, and sanitize inputs.

## 2024-05-24 - Socket.IO Authorization Bypass
**Vulnerability:** The `guild_message` socket event handler in `backend/server.js` blindly broadcasted messages to `guild:${guildId}` without verifying if the sender was a member of that guild. This allowed any authenticated user to send messages to any guild.
**Learning:** Socket.IO events do not pass through standard Express middleware chains. Authorization logic must be explicitly implemented within each event handler or via a global socket middleware that inspects the payload and user state.
**Prevention:** Added a check in the `guild_message` handler to verify `guildId` against `socket.user.guilds`. Also established a pattern for testing socket security integrations by mocking the database and using `socket.io-client` against the actual server instance.

## 2026-01-12 - Missing Input Validation in Socket Messages
**Vulnerability:** Socket.IO event handlers (`send_message`, `guild_message`) in `backend/server.js` accepted raw input without type checking, length validation, or sanitization, exposing the application to XSS and DoS attacks.
**Learning:** Socket.IO events bypass standard Express middleware (like `body-parser` limits or helmet CSP). Security controls must be applied explicitly within the socket event handlers.
**Prevention:** Implemented strict input validation (type check, max length) and HTML escaping (`escapeHtml`) for all user-generated content in socket handlers.
