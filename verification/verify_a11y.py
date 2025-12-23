from playwright.sync_api import sync_playwright, expect
import time

def verify_terminal_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the page
        print("Navigating to legion-v3.html...")
        page.goto("http://localhost:3000/legion-v3.html")

        # Wait for initialization (boot screen logic)
        # The boot screen takes some time to disappear
        print("Waiting for boot screen to clear...")
        page.wait_for_selector("#boot-screen.hidden", timeout=10000)

        # Click on "TARGET ANALYSIS" node to open the terminal
        # It has role="button" and aria-label="Open Target Analysis Module"
        print("Opening Target Analysis module...")
        target_node = page.get_by_role("button", name="Open Target Analysis Module")
        target_node.click()

        # Wait for modal to appear
        print("Waiting for modal...")
        modal = page.locator("#terminal-modal")
        expect(modal).to_have_class("active", timeout=5000)

        # Check ARIA attributes on the modal
        print("Checking ARIA attributes...")
        role = modal.get_attribute("role")
        aria_modal = modal.get_attribute("aria-modal")
        aria_labelledby = modal.get_attribute("aria-labelledby")

        if role != "dialog":
            print(f"FAILURE: Expected role='dialog', got '{role}'")
        else:
            print("SUCCESS: role='dialog'")

        if aria_modal != "true":
            print(f"FAILURE: Expected aria-modal='true', got '{aria_modal}'")
        else:
            print("SUCCESS: aria-modal='true'")

        if aria_labelledby != "terminal-title":
            print(f"FAILURE: Expected aria-labelledby='terminal-title', got '{aria_labelledby}'")
        else:
            print("SUCCESS: aria-labelledby='terminal-title'")

        # Check Focus Management: Focus should be on the Close button
        print("Checking focus management (on open)...")
        close_button = page.locator("#close-terminal")
        expect(close_button).to_be_focused()
        print("SUCCESS: Focus moved to Close button")

        # Check Label Association
        print("Checking label associations...")
        # Check for the first input "TARGET AVATAR PARAMETERS"
        label = page.get_by_text("TARGET AVATAR PARAMETERS")
        for_attr = label.get_attribute("for")
        if for_attr == "target-avatar":
             print("SUCCESS: Label 'TARGET AVATAR PARAMETERS' has for='target-avatar'")
        else:
             print(f"FAILURE: Label 'TARGET AVATAR PARAMETERS' has for='{for_attr}'")

        # Take a screenshot of the open modal
        page.screenshot(path="verification/terminal_open.png")
        print("Screenshot saved to verification/terminal_open.png")

        # Close the terminal
        print("Closing terminal...")
        close_button.click()

        # Wait for modal to close
        expect(modal).not_to_have_class("active")

        # Check Focus Restoration
        # Focus should return to the node that opened it
        # Note: In a headless environment, activeElement might behave slightly differently if not careful,
        # but Playwright handles focus quite well.
        print("Checking focus restoration...")
        # We need to wait a tick for focus to move
        time.sleep(0.5)

        # Verify the target node is focused
        # We can check if the element with the data-node="target-analysis" is focused
        is_focused =  target_node.evaluate("element => document.activeElement === element")

        if is_focused:
            print("SUCCESS: Focus restored to triggering element")
        else:
            print("FAILURE: Focus NOT restored to triggering element")
            # debug what is focused
            focused_tag = page.evaluate("document.activeElement.tagName")
            focused_id = page.evaluate("document.activeElement.id")
            print(f"Currently focused: {focused_tag}#{focused_id}")

        browser.close()

if __name__ == "__main__":
    verify_terminal_accessibility()
