from playwright.sync_api import sync_playwright

def verify_page_loads():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the local server
            page.goto("http://localhost:3000/legion-v3.html")

            # Wait for the scene to load (give it a moment for Three.js to initialize)
            page.wait_for_timeout(2000)

            # Take a screenshot to verify it didn't crash
            page.screenshot(path="verification/legion_v3.png")
            print("Screenshot taken.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_page_loads()
