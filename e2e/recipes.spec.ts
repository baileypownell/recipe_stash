import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

const openRecipes = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Recipes' }).click();
  await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible();
};

const fillRecipe = async (
  page: Page,
  values: { name: string; category: string; ingredients: string; directions: string },
) => {
  await page.getByRole('textbox', { name: 'Recipe name', exact: true }).fill(values.name);
  await page.getByRole('combobox', { name: 'Category' }).click();
  await page.getByRole('option', { name: values.category }).click();
  const editors = page.locator('.ql-editor');
  await editors.nth(0).fill(values.ingredients);
  await editors.nth(1).fill(values.directions);
};

test('creates a recipe with a category and tag', async ({ page, api }) => {
  await openRecipes(page);
  await page.getByRole('button', { name: 'Create a new recipe' }).click();

  const addButton = page.getByRole('button', { name: 'Add Recipe' });
  await expect(addButton).toBeDisabled();
  await fillRecipe(page, {
    name: 'Garlic Pasta',
    category: 'Dinner',
    ingredients: 'Pasta and garlic',
    directions: 'Boil and toss',
  });
  await page
    .getByRole('dialog', { name: 'Add Recipe' })
    .getByText('Easy', { exact: true })
    .click();
  await expect(addButton).toBeEnabled();
  await addButton.click();

  await expect(page.getByText('Garlic Pasta')).toBeVisible();
  expect(api.requests).toContainEqual(
    expect.objectContaining({ method: 'POST', path: '/recipe' }),
  );
  expect(api.recipes.dinner.some((recipe) => recipe.rawTitle === 'Garlic Pasta')).toBe(true);
});

test('cancels creation without sending a request', async ({ page, api }) => {
  await openRecipes(page);
  await page.getByRole('button', { name: 'Create a new recipe' }).click();
  await page.getByRole('textbox', { name: 'Recipe name', exact: true }).fill('Discarded Recipe');
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  expect(api.requests.filter((request) => request.method === 'POST')).toHaveLength(0);
});

test('edits an existing recipe', async ({ page, api }) => {
  await openRecipes(page);
  await page.getByText('Tomato Soup', { exact: true }).click();
  await page.getByRole('main').getByRole('button').first().click();
  await page.getByRole('textbox', { name: 'Recipe name', exact: true }).fill('Roasted Tomato Soup');
  await page.locator('.ql-editor').nth(1).fill('Roast, blend, and simmer');
  await page.getByRole('button', { name: 'Update Recipe' }).click();

  await expect(page.getByRole('heading', { name: 'Roasted Tomato Soup' })).toBeVisible();
  expect(api.requests).toContainEqual(
    expect.objectContaining({ method: 'PUT', path: '/recipe' }),
  );
});

test('duplicates an existing recipe', async ({ page, api }) => {
  await openRecipes(page);
  await page.getByText('Tomato Soup', { exact: true }).click();
  await page.getByRole('main').getByRole('button').last().click();
  await page.getByRole('textbox', { name: 'Recipe name', exact: true }).fill('Tomato Soup Copy');
  await page.getByRole('button', { name: 'Add Recipe' }).click();

  await expect.poll(() => api.requests.filter((request) => request.method === 'POST').length).toBe(1);
});

test('keeps then deletes a recipe after confirmation', async ({ page, api }) => {
  await openRecipes(page);
  await page.getByText('Tomato Soup', { exact: true }).click();
  await page.getByRole('main').getByRole('button').first().click();
  await page
    .getByRole('dialog', { name: 'Edit Recipe' })
    .getByRole('button', { name: 'Delete Recipe' })
    .click();
  await page.getByRole('button', { name: 'Keep Recipe' }).click();
  expect(api.recipes.dinner).toHaveLength(1);

  await page
    .getByRole('dialog', { name: 'Edit Recipe' })
    .getByRole('button', { name: 'Delete Recipe' })
    .click();
  await page.getByRole('dialog', { name: 'Delete recipe?' }).getByRole('button', { name: 'Delete Recipe' }).click();

  await expect(page).toHaveURL('/recipes');
  expect(api.recipes.dinner).toHaveLength(0);
});
