import { test as base } from '@playwright/test';
import type { FullRecipe } from '../shared/types';

const emptyRecipes = () => ({
  breakfast: [],
  dessert: [],
  dinner: [],
  drinks: [],
  lunch: [],
  other: [],
  side_dish: [],
});

const initialRecipe: FullRecipe = {
  id: 'recipe-1',
  title: 'Tomato Soup',
  rawTitle: 'Tomato Soup',
  category: 'dinner',
  user_id: 'user-1',
  ingredients: '<p>Tomatoes</p>',
  directions: '<p>Simmer until tender</p>',
  tags: ['easy'],
  defaultTileImageKey: null,
  preSignedUrls: null,
  preSignedDefaultTileImageUrl: null,
};

type ApiState = {
  recipes: Record<string, FullRecipe[]>;
  user: { email: string; firstName: string; lastName: string };
  requests: Array<{ method: string; path: string; body?: unknown }>;
};

export const test = base.extend<{ api: ApiState }>({
  api: async ({ page }, use) => {
    const api: ApiState = {
      recipes: { ...emptyRecipes(), dinner: [{ ...initialRecipe }] },
      user: {
        email: 'chef@example.com',
        firstName: 'Jamie',
        lastName: 'Cook',
      },
      requests: [],
    };

    await page.addInitScript(() => {
      window.localStorage.setItem('user_logged_in', 'true');
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

    await page.route('**/auth', (route) =>
      route.fulfill({ json: { authenticated: true } }),
    );

    await page.route(/\/recipe(?:\/[^/?]+)?$/, async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const method = request.method();
      const id = url.pathname.split('/')[2];
      const body: any = request.postDataJSON?.();
      api.requests.push({ method, path: url.pathname, body });

      if (method === 'GET' && !id) {
        await route.fulfill({ json: api.recipes });
        return;
      }

      if (method === 'GET') {
        const recipe = Object.values(api.recipes)
          .flat()
          .find((candidate) => candidate.id === id);
        await route.fulfill({ json: recipe });
        return;
      }

      if (method === 'POST') {
        const recipe: FullRecipe = {
          ...body,
          id: 'recipe-created',
          user_id: 'user-1',
          tags: Object.entries(body)
            .filter(([key, value]) => key.startsWith('is') && value)
            .map(([key]) =>
              key
                .slice(2)
                .replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`)
                .replace(/^_/, ''),
            ),
          defaultTileImageKey: null,
          preSignedUrls: null,
          preSignedDefaultTileImageUrl: null,
        };
        api.recipes[recipe.category].push(recipe);
        await route.fulfill({ json: recipe });
        return;
      }

      if (method === 'PUT') {
        const existing = Object.values(api.recipes)
          .flat()
          .find((candidate) => candidate.id === body.recipeId) as FullRecipe;
        const updated = { ...existing, ...body };
        for (const recipes of Object.values(api.recipes)) {
          const index = recipes.findIndex((recipe) => recipe.id === updated.id);
          if (index >= 0) recipes.splice(index, 1);
        }
        api.recipes[updated.category].push(updated);
        await route.fulfill({ json: updated });
        return;
      }

      for (const recipes of Object.values(api.recipes)) {
        const index = recipes.findIndex((recipe) => recipe.id === id);
        if (index >= 0) recipes.splice(index, 1);
      }
      await route.fulfill({ json: { recipeDeleted: true } });
    });

    await page.route('**/user', async (route) => {
      const request = route.request();
      const method = request.method();
      const body: any = request.postDataJSON?.();
      api.requests.push({ method, path: '/user', body });

      if (method === 'GET') {
        await route.fulfill({ json: { userData: api.user } });
      } else if (method === 'PUT') {
        if ('newEmail' in body) api.user.email = body.newEmail;
        if ('firstName' in body) api.user.firstName = body.firstName;
        if ('lastName' in body) api.user.lastName = body.lastName;
        await route.fulfill({ json: { success: true, message: 'Profile updated.' } });
      } else {
        await route.fulfill({ json: { success: true } });
      }
    });

    await page.route('**/send-reset-email', async (route) => {
      api.requests.push({
        method: route.request().method(),
        path: '/send-reset-email',
        body: route.request().postDataJSON?.(),
      });
      await route.fulfill({ json: { success: true, message: 'Reset email sent.' } });
    });

    await page.route('**/logout', async (route) => {
      api.requests.push({ method: 'POST', path: '/logout' });
      await route.fulfill({ json: { success: true } });
    });

    await use(api);
  },
});

export { expect } from '@playwright/test';
