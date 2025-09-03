import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🌐 Navigating to the Todo App...');
  await page.goto('http://localhost:3000');

  // Take initial screenshot
  await page.screenshot({ path: 'screenshots/01-initial.png', fullPage: true });
  console.log('📸 Initial screenshot saved');

  // Check page title
  const title = await page.title();
  console.log(`📄 Page title: "${title}"`);

  // Find input field and add a todo
  console.log('🔍 Testing todo input...');
  const input = page.locator('input[placeholder*="What needs to be done"]');
  await input.fill('Test todo item');
  await page.screenshot({ path: 'screenshots/02-input-filled.png', fullPage: true });
  console.log('✍️  Filled input with test todo');

  // Click the add button
  const addButton = page.locator('button').filter({ hasText: '+' });
  await addButton.click();
  await page.screenshot({ path: 'screenshots/03-after-add.png', fullPage: true });
  console.log('➕ Clicked add button');

  // Check if todo was added
  const todos = await page.locator('[data-testid="todo-item"]').count();
  console.log(`📝 Found ${todos} todo items on page`);

  // Try adding another todo
  await input.fill('Second todo item');
  await addButton.click();
  await page.screenshot({ path: 'screenshots/04-second-todo.png', fullPage: true });
  console.log('➕ Added second todo');

  // Check for todo list functionality
  const todoItems = await page.locator('[data-testid="todo-item"]').all();
  console.log(`📋 Total todo items: ${todoItems.length}`);

  // Try to interact with individual todos (check if clickable)
  if (todoItems.length > 0) {
    console.log('🔍 Checking first todo item...');
    const firstTodo = todoItems[0];

    // Check if there's a checkbox
    const checkbox = firstTodo.locator('input[type="checkbox"]');
    const checkboxCount = await checkbox.count();
    if (checkboxCount > 0) {
      console.log('☑️  Found checkbox, clicking to complete todo');
      await checkbox.click();
      await page.screenshot({ path: 'screenshots/05-todo-completed.png', fullPage: true });
    }

    // Check if there's a delete button
    const deleteButton = firstTodo.locator('button').filter({ hasText: /delete|×|🗑️/ });
    const deleteCount = await deleteButton.count();
    console.log(`🗑️  Found ${deleteCount} delete button(s)`);
  }

  // Check page structure
  console.log('🏗️  Analyzing page structure...');
  const headings = await page.locator('h1, h2, h3').allTextContents();
  console.log('📍 Headings found:', headings);

  // Check for any error messages
  const errors = await page.locator('.error, [role="alert"]').allTextContents();
  if (errors.length > 0) {
    console.log('⚠️  Errors found:', errors);
  } else {
    console.log('✅ No error messages found');
  }

  // Final screenshot
  await page.screenshot({ path: 'screenshots/06-final-state.png', fullPage: true });
  console.log('📸 Final screenshot saved');

  await browser.close();
  console.log('✨ Exploration complete!');
})();
