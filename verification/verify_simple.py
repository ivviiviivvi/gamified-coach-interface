
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        file_path = os.path.abspath('index.html')
        page.goto(f'file://{file_path}')

        # Click Strategy Forge
        page.click('button[data-target="strategy-forge"]')

        # Wait a bit blindly if selectors are failing
        page.wait_for_timeout(1000)

        # Focus first card
        page.locator('.terminal-card').first.focus()
        page.wait_for_timeout(500)
        page.screenshot(path='verification/step1_focus.png')

        # Press Enter
        page.keyboard.press('Enter')
        page.wait_for_timeout(500)
        page.screenshot(path='verification/step2_open.png')

        browser.close()

if __name__ == '__main__':
    run()
