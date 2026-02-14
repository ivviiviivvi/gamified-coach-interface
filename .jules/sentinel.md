## 2024-05-24 - Privilege Escalation in Onboarding

**Vulnerability:** The `saveOnboarding` controller allowed users to update their `role` by passing a `role` field in the request body. This could allow a regular user to escalate privileges to 'admin'.
**Learning:** Even "harmless" user preference updates can be dangerous if they blindly update the user model based on `req.body` inputs. "Mass Assignment" or blind property updates are a common source of privilege escalation.
**Prevention:** Always explicitly whitelist the fields that can be updated in a controller. Never blindly copy properties from `req.body` to a sensitive model like `User`. Use DTOs or explicit assignments (e.g., `user.style = req.body.style`).
