import { test, expect } from '@playwright/test';

test.describe('Personal Todo App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to start fresh
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
  });

  test.describe('Core CRUD Operations', () => {
    test('should add a new todo', async ({ page }) => {
      const todoInput = page.getByRole('textbox', { name: 'New todo input' });
      const addButton = page.getByRole('button', { name: 'Add todo' });

      await todoInput.fill('Test todo item');
      await addButton.click();

      await expect(page.getByRole('button', { name: 'Test todo item, click to edit' })).toBeVisible();
      await expect(page.locator('.font-medium').filter({ hasText: '1 todo' })).toBeVisible();
      await expect(page.locator('text=1 active').first()).toBeVisible();
      await expect(page.getByText('Todo added successfully!')).toBeVisible();
    });

    test('should add multiple todos', async ({ page }) => {
      const todoInput = page.getByRole('textbox', { name: 'New todo input' });
      const addButton = page.getByRole('button', { name: 'Add todo' });

      // Add first todo
      await todoInput.fill('First todo');
      await addButton.click();

      // Add second todo
      await todoInput.fill('Second todo');
      await addButton.click();

      await expect(page.getByRole('button', { name: 'First todo, click to edit' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Second todo, click to edit' })).toBeVisible();
      await expect(page.locator('.font-medium').filter({ hasText: '2 todos' })).toBeVisible();
      await expect(page.locator('text=2 active').first()).toBeVisible();
    });

    test('should mark todo as complete', async ({ page }) => {
      // Add a todo first
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Complete me');
      await page.getByRole('button', { name: 'Add todo' }).click();

      // Mark as complete
      await page.getByRole('checkbox', { name: 'Mark "Complete me" as complete' }).click();

      await expect(page.locator('.font-medium').filter({ hasText: '1 todo' })).toBeVisible();
      await expect(page.locator('text=0 active').first()).toBeVisible();
      await expect(page.locator('text=1 completed').first()).toBeVisible();
      await expect(page.getByText('Todo completed!')).toBeVisible();
    });

    test('should mark todo as incomplete', async ({ page }) => {
      // Add and complete a todo
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Uncomplete me');
      await page.getByRole('button', { name: 'Add todo' }).click();
      await page.getByRole('checkbox', { name: 'Mark "Uncomplete me" as complete' }).click();

      // Mark as incomplete
      await page.getByRole('checkbox', { name: 'Mark "Uncomplete me" as incomplete' }).click();

      await expect(page.locator('text=1 active').first()).toBeVisible();
      await expect(page.locator('text=0 completed').first()).toBeVisible();
    });

    test('should edit todo text (save)', async ({ page }) => {
      // Add a todo first
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Edit me');
      await page.getByRole('button', { name: 'Add todo' }).click();

      // Click edit button
      await page.getByRole('button', { name: 'Edit "Edit me"' }).click();

      // Edit the text
      const editInput = page.getByRole('textbox', { name: 'Edit todo text' });
      await editInput.clear();
      await editInput.fill('Edited todo');
      
      // Save changes
      await page.getByRole('button', { name: 'Save changes' }).click();

      await expect(page.getByRole('button', { name: 'Edited todo, click to edit' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit me, click to edit' })).not.toBeVisible();
    });

    test('should edit todo text (cancel)', async ({ page }) => {
      // Add a todo first
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Cancel edit');
      await page.getByRole('button', { name: 'Add todo' }).click();

      // Click edit button
      await page.getByRole('button', { name: 'Edit "Cancel edit"' }).click();

      // Edit the text but cancel
      const editInput = page.getByRole('textbox', { name: 'Edit todo text' });
      await editInput.clear();
      await editInput.fill('Should not save');
      
      // Cancel changes
      await page.getByRole('button', { name: 'Cancel editing' }).click();

      await expect(page.getByRole('button', { name: 'Cancel edit, click to edit' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Should not save, click to edit' })).not.toBeVisible();
    });

    test('should delete todo', async ({ page }) => {
      // Add a todo first
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Delete me');
      await page.getByRole('button', { name: 'Add todo' }).click();

      // Set up dialog handler before clicking delete
      page.on('dialog', dialog => dialog.accept());
      
      // Delete the todo
      await page.getByRole('button', { name: 'Delete "Delete me"' }).click();

      await expect(page.getByRole('button', { name: 'Delete me, click to edit' })).not.toBeVisible();
      // Verify success notification
      await expect(page.locator('.font-medium').filter({ hasText: 'Todo deleted' })).toBeVisible();
    });
  });

  test.describe('State Management', () => {
    test('should persist todos across page refresh', async ({ page }) => {
      // Add a todo
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Persistent todo');
      await page.getByRole('button', { name: 'Add todo' }).click();

      // Refresh page
      await page.reload();

      // Todo should still be there
      await expect(page.getByRole('button', { name: 'Persistent todo, click to edit' })).toBeVisible();
      await expect(page.locator('.font-medium').filter({ hasText: '1 todo' })).toBeVisible();
    });

    test('should maintain completion state after refresh', async ({ page }) => {
      // Add and complete a todo
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Completed persistent');
      await page.getByRole('button', { name: 'Add todo' }).click();
      await page.getByRole('checkbox', { name: 'Mark "Completed persistent" as complete' }).click();

      // Refresh page
      await page.reload();

      // Should still be completed
      await expect(page.locator('text=0 active').first()).toBeVisible();
      await expect(page.locator('text=1 completed').first()).toBeVisible();
      await expect(page.getByRole('checkbox', { name: 'Mark "Completed persistent" as incomplete' })).toBeChecked();
    });
  });

  test.describe('Theme System', () => {
    test('should toggle to dark mode', async ({ page }) => {
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();

      await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
      // Check that dark mode is applied by checking the html element
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'dark');
    });

    test('should toggle back to light mode', async ({ page }) => {
      // Switch to dark mode first
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();
      
      // Switch back to light mode
      await page.getByRole('button', { name: 'Switch to light mode' }).click();

      await expect(page.getByRole('button', { name: 'Switch to dark mode' })).toBeVisible();
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'light');
    });

    test('should persist theme across page refresh', async ({ page }) => {
      // Switch to dark mode
      await page.getByRole('button', { name: 'Switch to dark mode' }).click();

      // Refresh page
      await page.reload();

      // Should still be in dark mode
      await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
      const html = page.locator('html');
      await expect(html).toHaveAttribute('data-theme', 'dark');
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should cancel edit with Escape key', async ({ page }) => {
      // Add a todo
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Escape test');
      await page.getByRole('button', { name: 'Add todo' }).click();

      // Start editing
      await page.getByRole('button', { name: 'Edit "Escape test"' }).click();

      // Edit text
      const editInput = page.getByRole('textbox', { name: 'Edit todo text' });
      await editInput.clear();
      await editInput.fill('Should cancel');

      // Press Escape
      await page.keyboard.press('Escape');

      // Should revert to original text
      await expect(page.getByRole('button', { name: 'Escape test, click to edit' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Should cancel, click to edit' })).not.toBeVisible();
    });

    test('should save edit with Enter key', async ({ page }) => {
      // Add a todo
      await page.getByRole('textbox', { name: 'New todo input' }).fill('Enter test');
      await page.getByRole('button', { name: 'Add todo' }).click();

      // Start editing
      await page.getByRole('button', { name: 'Edit "Enter test"' }).click();

      // Edit text and press Enter
      const editInput = page.getByRole('textbox', { name: 'Edit todo text' });
      await editInput.clear();
      await editInput.fill('Enter saved');
      await page.keyboard.press('Enter');

      // Should save the changes
      await expect(page.getByRole('button', { name: 'Enter saved, click to edit' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Enter test, click to edit' })).not.toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper skip link', async ({ page }) => {
      const skipLink = page.getByRole('link', { name: 'Skip to main content' });
      await expect(skipLink).toBeVisible();
      await expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    test('should have proper heading structure', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Todo App', level: 1 })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'My Todos', level: 1 })).toBeVisible();
    });

    test('should have proper ARIA labels', async ({ page }) => {
      // Add a todo to test ARIA labels
      await page.getByRole('textbox', { name: 'New todo input' }).fill('ARIA test');
      await page.getByRole('button', { name: 'Add todo' }).click();

      await expect(page.getByRole('checkbox', { name: 'Mark "ARIA test" as complete' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Edit "ARIA test"' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Delete "ARIA test"' })).toBeVisible();
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty todo submission', async ({ page }) => {
      const todoInput = page.getByRole('textbox', { name: 'New todo input' });
      const addButton = page.getByRole('button', { name: 'Add todo' });

      // Try to add empty todo
      await addButton.click();

      // Should show validation error message and not add empty todo
      await expect(page.getByText('Please enter a todo item')).toBeVisible();
    });

    test('should handle very long todo text', async ({ page }) => {
      const longText = 'This is a very long todo item that contains a lot of text to test how the application handles extremely long todo items and whether it displays them properly without breaking the layout or causing any issues with the user interface';
      
      await page.getByRole('textbox', { name: 'New todo input' }).fill(longText);
      await page.getByRole('button', { name: 'Add todo' }).click();

      await expect(page.getByRole('button', { name: `${longText}, click to edit` })).toBeVisible();
      await expect(page.locator('.font-medium').filter({ hasText: '1 todo' })).toBeVisible();
    });

    test('should handle special characters and emojis', async ({ page }) => {
      const specialText = 'Special chars: !@#$%^&*()_+ 🎉🔥💯';
      
      await page.getByRole('textbox', { name: 'New todo input' }).fill(specialText);
      await page.getByRole('button', { name: 'Add todo' }).click();

      await expect(page.getByRole('button', { name: `${specialText}, click to edit` })).toBeVisible();
    });
  });
});