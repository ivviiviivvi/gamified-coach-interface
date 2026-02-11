from playwright.sync_api import sync_playwright, expect
import time

def verify_boot_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the page
        print("Navigating to legion-v3.html...")
        page.goto("http://localhost:3000/legion-v3.html")

        # Get the progress bar container
        progress_bar = page.locator(".boot-progress")

        # Verify initial ARIA attributes
        print("Checking initial ARIA attributes...")
        expect(progress_bar).to_have_attribute("role", "progressbar")
        expect(progress_bar).to_have_attribute("aria-label", "System Boot Progress")
        expect(progress_bar).to_have_attribute("aria-valuemin", "0")
        expect(progress_bar).to_have_attribute("aria-valuemax", "100")
        print("SUCCESS: Initial ARIA attributes present")

        # Wait for value to update (it starts at 0 and goes to 100)
        print("Checking if aria-valuenow updates...")

        # We'll check if it reaches 100 or at least increases
        # Since boot is fast, we might catch it mid-way or at end
        expect(progress_bar).to_have_attribute("aria-valuenow", "100", timeout=5000)
        print("SUCCESS: aria-valuenow reached 100")

        browser.close()

if __name__ == "__main__":
    verify_boot_accessibility()
