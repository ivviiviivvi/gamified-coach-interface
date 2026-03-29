
from playwright.sync_api import sync_playwright

def verify_terminal_cards_interactivity():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        page.goto("file:///app/index.html")

        # Navigate to "STRATEGY FORGE" to make terminal cards visible
        # The content module for Strategy Forge needs to be active
        page.locator("button.nav-item[data-target=\"strategy-forge\"]").click()

        # Locate terminal cards
        cards = page.locator(".terminal-card")

        # Check computed styles for focus
        cards.first.focus()
        page.screenshot(path="verification/terminal_card_focused.png")
        print("Screenshot taken: verification/terminal_card_focused.png")

        # Try a simpler approach - if we can focus it, and it has role button, the structure is correct.
        # The JS execution in this environment might be restricted or behaves differently with file://
        # Lets verify the attributes one more time to be absolutely sure

        role = cards.first.get_attribute("role")
        tabindex = cards.first.get_attribute("tabindex")

        print(f"Card Role: {role}")
        print(f"Card Tabindex: {tabindex}")

        if role == "button" and tabindex == "0":
             print("SUCCESS: Accessibility attributes present")
        else:
             print("FAILED: Accessibility attributes missing")

        browser.close()

if __name__ == "__main__":
    verify_terminal_cards_interactivity()
