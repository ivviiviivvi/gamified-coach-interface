
from playwright.sync_api import sync_playwright

def check_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load local file directly
        page.goto('file:///app/legion-v3.html')

        # Check boot progress attributes
        boot_progress = page.locator('.boot-progress')

        print(f'Role: {boot_progress.get_attribute('role')}')
        print(f'Aria Value Now: {boot_progress.get_attribute('aria-valuenow')}')

        # Wait for boot to finish (it takes a few seconds)
        page.wait_for_timeout(4000)

        # Check boot screen visibility
        boot_screen = page.locator('#boot-screen')
        print(f'Boot Screen Classes: {boot_screen.get_attribute('class')}')
        print(f'Boot Screen Aria Hidden: {boot_screen.get_attribute('aria-hidden')}')

        browser.close()

if __name__ == '__main__':
    check_accessibility()
