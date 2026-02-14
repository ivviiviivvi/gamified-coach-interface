
from playwright.sync_api import sync_playwright

def check_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file directly
        page.goto('http://localhost:3000/legion-v3.html')

        # Check boot progress attributes
        boot_progress = page.locator('.boot-progress')

        print(f'Role: {boot_progress.get_attribute('role')}')
        print(f'Initial Aria Value Now: {boot_progress.get_attribute('aria-valuenow')}')

        # Wait for boot to finish (it takes a few seconds)
        # We need to wait until the class 'hidden' is added to #boot-screen
        # Or wait for a few seconds

        page.wait_for_timeout(4000)

        # Check final Aria Value Now
        print(f'Final Aria Value Now: {boot_progress.get_attribute('aria-valuenow')}')

        # Check boot screen visibility
        boot_screen = page.locator('#boot-screen')
        print(f'Boot Screen Classes: {boot_screen.get_attribute('class')}')
        print(f'Boot Screen Aria Hidden: {boot_screen.get_attribute('aria-hidden')}')
        print(f'Boot Screen Display: {boot_screen.evaluate('el => getComputedStyle(el).display')}')

        browser.close()

if __name__ == '__main__':
    check_accessibility()
