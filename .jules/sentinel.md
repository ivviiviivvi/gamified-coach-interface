# Sentinel's Journal

## 2024-05-22 - Missing Input Validation in Auth
**Vulnerability:** The authentication endpoints (`/register`, `/login`) lacked robust input validation and sanitization. While Sequelize provided some database-level validation (like `isEmail`), the controller did not validate input before processing, leading to potential bad data reaching the DB logic and weaker error feedback.
**Learning:** Always validate input at the edge of the application (controller/route level) before it reaches domain logic or database layers.
**Prevention:** Implemented `express-validator` middleware on auth routes to enforce email formats, password length, and sanitize inputs.

## 2024-05-24 - Socket.IO Authorization Bypass
**Vulnerability:** The `guild_message` socket event handler in `backend/server.js` blindly broadcasted messages to `guild:${guildId}` without verifying if the sender was a member of that guild. This allowed any authenticated user to send messages to any guild.
**Learning:** Socket.IO events do not pass through standard Express middleware chains. Authorization logic must be explicitly implemented within each event handler or via a global socket middleware that inspects the payload and user state.
**Prevention:** Added a check in the `guild_message` handler to verify `guildId` against `socket.user.guilds`. Also established a pattern for testing socket security integrations by mocking the database and using `socket.io-client` against the actual server instance.

## 2025-12-24 - Missing Status Check in Refresh Token Logic
**Vulnerability:** The `refreshToken` endpoint validated the JWT signature but failed to verify if the user's account status was still `active`. This meant a suspended or banned user could continue to refresh their session and access the platform until the refresh token expired (30 days).
**Learning:** Token validity != User validity. Always re-verify critical user state (like account status) when issuing new access credentials, even if the request credential (refresh token) is technically valid.
**Prevention:** Added `if (user.status !== 'active')` check in the `refreshToken` controller method.
