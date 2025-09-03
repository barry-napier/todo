import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🌐 Navigating to the Todo App...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/v2-01-initial.png', fullPage: true });
  console.log('📸 Initial screenshot saved');

  // Check page title
  const title = await page.title();
  console.log(`📄 Page title: "${title}"`);

  // Check for any console errors
  const logs = [];
  page.on('console', (msg) => logs.push(msg.text()));

  // Find input field and add a todo
  console.log('🔍 Testing todo input...');
  const input = await page.locator('input[placeholder*="What needs to be done"]').first();
  await input.fill('Test todo item');
  await page.screenshot({ path: 'screenshots/v2-02-input-filled.png', fullPage: true });
  console.log('✍️  Filled input with test todo');

  // Try different selectors for the add button
  console.log('🔍 Looking for add button...');

  // Check if button exists with different selectors
  const buttonSelectors = [
    'button:has-text("+")',
    'button[type="submit"]',
    'button:near(input)',
    '[role="button"]',
    'button',
  ];

  let addButton = null;
  for (const selector of buttonSelectors) {
    const count = await page.locator(selector).count();
    console.log(`🔍 Selector "${selector}": found ${count} elements`);
    if (count > 0) {
      addButton = page.locator(selector).first();
      break;
    }
  }

  if (addButton) {
    try {
      console.log('🖱️  Attempting to click add button...');
      await addButton.click({ timeout: 5000 });
      await page.waitForTimeout(1000); // Wait a bit for any changes
      await page.screenshot({ path: 'screenshots/v2-03-after-click.png', fullPage: true });
      console.log('✅ Successfully clicked add button');
    } catch (error) {
      console.log('❌ Failed to click button:', error.message);

      // Try pressing Enter instead
      console.log('⌨️  Trying to press Enter in input field...');
      await input.press('Enter');
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/v2-03-after-enter.png', fullPage: true });
      console.log('✅ Pressed Enter in input field');
    }
  }

  // Check what's in the page now
  const todoItems = await page.locator('[data-testid*="todo"], .todo-item, li').count();
  console.log(`📝 Found ${todoItems} potential todo items`);

  // Check for error states
  const errorElements = await page
    .locator('.error, [role="alert"], .text-red-500')
    .allTextContents();
  if (errorElements.length > 0) {
    console.log('⚠️  Errors found:', errorElements);
  }

  // Check the issue indicator at bottom
  const issueIndicator = await page.locator('text="Issue"').count();
  if (issueIndicator > 0) {
    console.log('🔍 Found issue indicator, checking details...');
    await page.locator('text="Issue"').click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshots/v2-04-issue-details.png', fullPage: true });
  }

  // Try to add todo with form submission
  console.log('🔄 Trying form-based submission...');
  await input.fill('Second test todo');

  // Look for form element
  const form = page.locator('form').first();
  const formCount = await form.count();
  if (formCount > 0) {
    console.log('📋 Found form element, submitting...');
    try {
      await form.evaluate((form) => form.submit());
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'screenshots/v2-05-form-submit.png', fullPage: true });
      console.log('✅ Form submitted');
    } catch (error) {
      console.log('❌ Form submission failed:', error.message);
    }
  }

  // Check page structure
  console.log('🏗️  Analyzing page structure...');
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
  console.log('📍 Headings found:', headings);

  const buttons = await page.locator('button').allTextContents();
  console.log('🔘 Buttons found:', buttons);

  const inputs = await page.locator('input').count();
  console.log(`📝 Input fields found: ${inputs}`);

  // Check console logs
  if (logs.length > 0) {
    console.log('📊 Console messages:', logs.slice(-5)); // Show last 5
  }

  // Final screenshot
  await page.screenshot({ path: 'screenshots/v2-06-final.png', fullPage: true });
  console.log('📸 Final screenshot saved');

  await browser.close();
  console.log('✨ Exploration complete!');
})();
