
from playwright.sync_api import sync_playwright

def verify_terminal_cards():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local index.html file
        page.goto("file:///app/index.html")

        # Locate terminal cards
        cards = page.locator(".terminal-card")

        # Check if they have role="button"
        count = cards.count()
        print(f"Found {count} terminal cards")

        for i in range(count):
            card = cards.nth(i)
            role = card.get_attribute("role")
            tabindex = card.get_attribute("tabindex")
            print(f"Card {i}: role={role}, tabindex={tabindex}")

            if role != "button" or tabindex != "0":
                print(f"FAILED: Card {i} missing attributes")
                browser.close()
                return

        # Test focus style by focusing first card
        cards.first.focus()
        page.screenshot(path="verification/terminal_cards_focused.png")
        print("Screenshot taken: verification/terminal_cards_focused.png")

        # Test interaction via keyboard (Enter)
        # We need to see if content changes.
        # Before click/enter, #terminal-content should be empty
        content = page.locator("#terminal-content")
        print(f"Content before: {content.inner_text()}")

        # Press Enter on focused card
        page.keyboard.press("Enter")

        # Wait for content update
        page.wait_for_timeout(500)
        print(f"Content after: {content.inner_text()}")

        if "HERO CLASS" in content.inner_text() or "LOOT TABLE" in content.inner_text():
            print("SUCCESS: Keyboard interaction worked")
        else:
            print("FAILED: Keyboard interaction did not update content")

        browser.close()

if __name__ == "__main__":
    verify_terminal_cards()
