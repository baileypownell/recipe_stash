import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.google = {
      accounts: {
        id: {
          initialize: () => undefined,
          renderButton: () => undefined,
          prompt: () => undefined,
        },
      },
    };
  });

  await page.route('**/auth', async (route) => {
    await route.fulfill({ json: { authenticated: false } });
  });
});

test('shows the home page', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Keep every recipe within reach.' }),
  ).toBeVisible();
});

test('redirects unauthenticated users away from recipes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Get Started' }).click();

  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
});

test('requires valid login credentials', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Login' }).click();

  const loginButton = page
    .getByRole('main')
    .getByRole('button', { name: 'Login' });
  await expect(loginButton).toBeDisabled();

  await page.getByLabel('Email').fill('chef@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');

  await expect(loginButton).toBeEnabled();
});
