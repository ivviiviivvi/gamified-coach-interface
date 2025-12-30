from playwright.sync_api import sync_playwright, expect

def verify_boot_progress_a11y(page):
    # Navigate to the app
    page.goto("http://localhost:3000/legion-v3.html")

    # Locate the boot progress container
    boot_progress = page.locator(".boot-progress")

    # Assert ARIA attributes are present
    expect(boot_progress).to_have_attribute("role", "progressbar")
    expect(boot_progress).to_have_attribute("aria-label", "System Boot Progress")
    expect(boot_progress).to_have_attribute("aria-valuemin", "0")
    expect(boot_progress).to_have_attribute("aria-valuemax", "100")

    # Wait for the progress to start updating (valuemax > 0)
    # The script updates it randomly, let's wait a bit and check it has a value
    page.wait_for_timeout(500)

    # Get the current value
    val = boot_progress.get_attribute("aria-valuenow")
    print(f"Current aria-valuenow: {val}")

    # Assert it's a number and not 0 (since we waited)
    # Or just check it exists.
    assert val is not None

    # Take a screenshot
    page.screenshot(path="verification/boot_progress.png")
    print("Screenshot saved to verification/boot_progress.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_boot_progress_a11y(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            exit(1)
        finally:
            browser.close()
