
from playwright.sync_api import sync_playwright
import os

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"CONSOLE: {msg.text}"))

        page.goto('http://localhost:3000')

        # Force show Strategy Forge
        page.evaluate("""
            document.querySelectorAll('.content-module').forEach(m => m.classList.remove('active'));
            document.getElementById('strategy-forge').classList.add('active');
        """)

        page.wait_for_timeout(500)

        # Focus last nav item
        page.locator('.nav-item').last.focus()

        # Tab to first terminal card
        page.keyboard.press('Tab')

        page.wait_for_timeout(500)

        # Screenshot focused state (should show focus ring)
        page.screenshot(path='verification/final_focus.png')

        # Press Enter to activate
        page.keyboard.press('Enter')
        page.wait_for_timeout(1000)

        # Screenshot open state
        page.screenshot(path='verification/final_open.png')

        browser.close()

if __name__ == '__main__':
    run()
