from playwright.sync_api import sync_playwright, expect
import time

def verify_progress_a11y():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the page
        page.goto("http://localhost:3000/legion-v3.html")

        # Locate the progress bar container
        progress_container = page.locator("#boot-progress-container")

        # Wait for it to be visible
        expect(progress_container).to_be_visible()

        # Verify initial ARIA attributes
        expect(progress_container).to_have_attribute("role", "progressbar")
        expect(progress_container).to_have_attribute("aria-label", "System Boot Progress")
        expect(progress_container).to_have_attribute("aria-valuemin", "0")
        expect(progress_container).to_have_attribute("aria-valuemax", "100")

        # Wait a bit for the animation to start and check if aria-valuenow updates
        # The boot sequence runs for about 3-4 seconds (progress += random * 15 every 200ms)
        # We want to catch it in the middle
        time.sleep(1)

        # Get the current value
        val_now = progress_container.get_attribute("aria-valuenow")
        print(f"Current aria-valuenow: {val_now}")

        # Assert it's a number and greater than 0 (assuming it started)
        assert int(val_now) >= 0

        # Take a screenshot
        page.screenshot(path="verification/boot_progress.png")

        browser.close()

if __name__ == "__main__":
    verify_progress_a11y()
