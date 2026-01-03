
from playwright.sync_api import sync_playwright, expect
import time

def verify_accessibility_attributes(page):
    # Go to the local server
    page.goto("http://localhost:3000/legion-v3.html")

    # Wait for the boot screen to be present
    boot_container = page.locator("#boot-progress-container")

    # Verify the static attributes
    expect(boot_container).to_have_attribute("role", "progressbar")
    expect(boot_container).to_have_attribute("aria-valuemin", "0")
    expect(boot_container).to_have_attribute("aria-valuemax", "100")
    expect(boot_container).to_have_attribute("aria-label", "System Boot Progress")

    # Verify dynamic update
    # The progress starts at 0 and increases. We wait a bit and check if it's > 0
    # Wait for aria-valuenow to be updated to something other than 0 (or just check existence)
    # Since it updates frequently, we can check if it eventually reaches 100

    # Take a screenshot while it's loading
    page.screenshot(path="verification/boot_progress.png")

    print("Static attributes verified.")

    # Wait for completion
    expect(boot_container).to_have_attribute("aria-valuenow", "100", timeout=10000)
    print("Dynamic update to 100 verified.")

    # Verify boot screen gets hidden
    boot_screen = page.locator("#boot-screen")
    expect(boot_screen).to_have_class("hidden", timeout=5000)
    expect(boot_screen).to_have_attribute("aria-hidden", "true")
    print("Boot screen hidden and aria-hidden verified.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_accessibility_attributes(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="verification/error.png")
            raise
        finally:
            browser.close()
