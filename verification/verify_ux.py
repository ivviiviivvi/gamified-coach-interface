from playwright.sync_api import sync_playwright

def verify_boot_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (Vite configured for 3000)
        page.goto("http://localhost:3000/legion-v3.html")

        # Get the boot progress bar
        progress_bar = page.locator(".boot-progress")

        # Wait for it to exist
        progress_bar.wait_for(state="attached")

        # Check initial attributes
        role = progress_bar.get_attribute("role")
        label = progress_bar.get_attribute("aria-label")
        valuemin = progress_bar.get_attribute("aria-valuemin")
        valuemax = progress_bar.get_attribute("aria-valuemax")

        print(f"Role: {role}")
        print(f"Label: {label}")
        print(f"Min: {valuemin}, Max: {valuemax}")

        # Check dynamic updates
        # Wait for value to be > 0
        page.wait_for_function("document.querySelector('.boot-progress').getAttribute('aria-valuenow') > 0")
        valuenow = progress_bar.get_attribute("aria-valuenow")
        print(f"Value Now (active): {valuenow}")

        # Take a screenshot while it's loading
        page.screenshot(path="verification/boot_loading.png")

        # Wait for boot to finish (hidden class added)
        page.wait_for_selector("#boot-screen.hidden", timeout=10000)

        # Check aria-hidden
        boot_screen = page.locator("#boot-screen")
        aria_hidden = boot_screen.get_attribute("aria-hidden")
        print(f"Boot Screen Aria-Hidden: {aria_hidden}")

        # Take final screenshot
        page.screenshot(path="verification/boot_complete.png")

        browser.close()

if __name__ == "__main__":
    verify_boot_accessibility()
