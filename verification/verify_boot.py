from playwright.sync_api import sync_playwright

def verify_boot_progress(page):
    # Go to the local page
    page.goto("http://localhost:3000/legion-v3.html")

    # Wait for the boot progress bar to exist
    progress_bar = page.locator(".boot-progress")

    # Check if role is present
    role = progress_bar.get_attribute("role")
    print(f"Role: {role}")
    if role != "progressbar":
        print("FAIL: role is not progressbar")
    else:
        print("PASS: role is progressbar")

    # Wait for the valuenow to update (it starts at 0 and goes to 100)
    # We can poll it
    for i in range(10):
        valuenow = progress_bar.get_attribute("aria-valuenow")
        print(f"ValueNow: {valuenow}")
        if valuenow and int(valuenow) > 0:
            print("PASS: aria-valuenow updated")
            break
        page.wait_for_timeout(200)

    page.screenshot(path="verification/boot_progress.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            verify_boot_progress(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
