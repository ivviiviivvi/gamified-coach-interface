from playwright.sync_api import sync_playwright, expect
import time

def verify_boot_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the page
        print("Navigating to http://localhost:3000/legion-v3.html")
        page.goto("http://localhost:3000/legion-v3.html")

        # Get the boot progress container
        progress_container = page.locator(".boot-progress")

        # Verify static attributes
        print("Verifying static ARIA attributes...")
        expect(progress_container).to_have_attribute("role", "progressbar")
        expect(progress_container).to_have_attribute("aria-label", "System Boot Progress")
        expect(progress_container).to_have_attribute("aria-valuemin", "0")
        expect(progress_container).to_have_attribute("aria-valuemax", "100")

        # Verify dynamic update of aria-valuenow
        print("Verifying dynamic aria-valuenow update...")
        # Get initial value
        initial_value = progress_container.get_attribute("aria-valuenow")
        print(f"Initial value: {initial_value}")

        # Wait a bit and check again
        time.sleep(0.5)
        updated_value = progress_container.get_attribute("aria-valuenow")
        print(f"Updated value: {updated_value}")

        if initial_value != updated_value:
            print("SUCCESS: aria-valuenow is updating.")
        else:
            print("WARNING: aria-valuenow did not update in the observed window (might have finished or be too slow).")

        # Take a screenshot while it's still loading (hopefully)
        page.screenshot(path="verification/boot_progress.png")
        print("Screenshot taken.")

        # Wait for boot to finish and check aria-hidden on boot-screen
        print("Waiting for boot screen to hide...")
        boot_screen = page.locator("#boot-screen")
        expect(boot_screen).to_have_class("hidden", timeout=10000)
        expect(boot_screen).to_have_attribute("aria-hidden", "true")
        print("SUCCESS: boot-screen has aria-hidden='true'.")

        browser.close()

if __name__ == "__main__":
    verify_boot_accessibility()
