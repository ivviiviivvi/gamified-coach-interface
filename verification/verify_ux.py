from playwright.sync_api import sync_playwright

def verify_ux_changes():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))
        page.on("pageerror", lambda err: print(f"PAGE ERROR: {err}"))

        # Use 127.0.0.1 to avoid localhost resolution issues
        url = "http://127.0.0.1:3000/legion-v3.html"
        print(f"Navigating to {url}")

        try:
            page.goto(url, timeout=30000)
        except Exception as e:
            print(f"Navigation failed: {e}")
            return

        print("Page loaded")

        # Wait for boot screen to finish (it has a progress bar)
        try:
            boot_bar = page.locator("#boot-bar")
            boot_bar.wait_for(state="attached")

            # Verify ARIA attributes on boot bar
            role = boot_bar.get_attribute('role')
            print(f"Role: {role}")

            # Use evaluate to get property because attribute might be updated quickly
            valuenow = boot_bar.get_attribute('aria-valuenow')
            print(f"Aria Valuenow (initial): {valuenow}")

            # Wait for boot screen to disappear
            print("Waiting for boot screen to hide...")
            # Increased timeout and checking for class hidden
            page.wait_for_selector("#boot-screen.hidden", timeout=20000)

            # Verify boot screen is hidden from a11y
            boot_screen = page.locator("#boot-screen")
            aria_hidden = boot_screen.get_attribute('aria-hidden')
            print(f"Boot Screen Aria Hidden: {aria_hidden}")

            # Click a node hint to open terminal
            print("Clicking 'target-analysis' node hint...")
            # Force click in case of overlay issues
            page.click(".node-hint[data-node='target-analysis']", force=True)

            # Wait for modal
            print("Waiting for modal...")
            page.wait_for_selector("#terminal-modal.active", timeout=5000)

            # Verify focus is on the textarea (first input)
            focused_tag = page.evaluate("document.activeElement.tagName")
            focused_id = page.evaluate("document.activeElement.id")
            print(f"Focused Element: {focused_tag}#{focused_id}")

            # Verify close button aria label
            close_btn = page.locator("#close-terminal")
            label = close_btn.get_attribute('aria-label')
            print(f"Close Button Label: {label}")

            # Take screenshot of the terminal open
            page.screenshot(path="verification/terminal_ux.png")
            print("Screenshot saved to verification/terminal_ux.png")

            frontend_verification_complete(screenshot_path="verification/terminal_ux.png")

        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")

        finally:
            browser.close()

if __name__ == "__main__":
    verify_ux_changes()
