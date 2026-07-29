import { expect, test } from './fixtures';
import type { Page } from '@playwright/test';

const openSettings = async (page: Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible();
};

test('updates the account name', async ({ page, api }) => {
  await openSettings(page);
  await page.getByLabel('New First Name').fill('Julia');
  await page.getByLabel('New Last Name').fill('Child');
  await page.getByRole('button', { name: 'Save' }).nth(1).click();

  await expect(page.getByText('Julia Child')).toBeVisible();
  expect(api.user).toMatchObject({ firstName: 'Julia', lastName: 'Child' });
});

test('updates the sign-in email with password confirmation', async ({ page, api }) => {
  await openSettings(page);
  await page.getByLabel('New Email').fill('julia@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('ValidPass1');
  await page.getByRole('button', { name: 'Save' }).first().click();

  await expect(page.getByText('julia@example.com')).toBeVisible();
  expect(api.requests).toContainEqual(
    expect.objectContaining({
      method: 'PUT',
      path: '/user',
      body: { newEmail: 'julia@example.com', password: 'ValidPass1' },
    }),
  );
});

test('requests a password reset and signs out', async ({ page, api }) => {
  await openSettings(page);
  await page.getByRole('button', { name: 'Send Email' }).click();

  await expect(page).toHaveURL('/');
  expect(api.requests).toContainEqual(
    expect.objectContaining({ path: '/send-reset-email' }),
  );
  expect(api.requests).toContainEqual(expect.objectContaining({ path: '/logout' }));
});

test('cancels account deletion', async ({ page, api }) => {
  await openSettings(page);
  await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();

  await expect(page.getByRole('dialog')).toBeHidden();
  expect(api.requests.some((request) => request.method === 'DELETE')).toBe(false);
});

test('deletes the account after confirmation', async ({ page, api }) => {
  await openSettings(page);
  await page.getByRole('button', { name: 'Delete Account' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Delete Account' }).click();

  await expect(page).toHaveURL('/');
  expect(api.requests).toContainEqual(
    expect.objectContaining({ method: 'DELETE', path: '/user' }),
  );
});
