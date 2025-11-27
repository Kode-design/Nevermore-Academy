from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            # Navigate to the game
            page.goto("http://localhost:8000/index.html")

            # Wait for the game to load (canvas element)
            page.wait_for_selector("canvas", timeout=10000)

            # Wait a bit for the dialogue to appear (delayed call was 1000ms)
            # The intro dialogue starts after 1000ms.
            page.wait_for_timeout(3000)

            # Take a screenshot
            page.screenshot(path="verification/verification_screenshot.png")
            print("Screenshot taken")
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
