
from playwright.sync_api import sync_playwright

def verify_frontend():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file directly
        page.goto('http://localhost:3000/legion-v3.html')

        # Wait for boot to finish (it takes a few seconds)
        page.wait_for_timeout(4000)

        # Take a screenshot
        page.screenshot(path='verification/boot_complete.png')

        browser.close()

if __name__ == '__main__':
    verify_frontend()
