import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import type { FullRecipe } from '../shared/types.js';
import { authMiddleware } from './authMiddleware.js';
import {
  deleteAWSFiles,
  getPresignedUrl,
  getPresignedUrls,
} from './aws-s3.js';
import client from './client.js';

const router = Router();

const categories = [
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'other',
  'side_dish',
  'drinks',
] as const;

type RecipeCategory = (typeof categories)[number];

interface RecipeRow {
  recipe_uuid: string;
  user_uuid: string;
  title: string;
  raw_title: string | null;
  category: string;
  ingredients: string;
  directions: string;
  no_bake: boolean | null;
  easy: boolean | null;
  healthy: boolean | null;
  gluten_free: boolean | null;
  dairy_free: boolean | null;
  sugar_free: boolean | null;
  vegetarian: boolean | null;
  vegan: boolean | null;
  keto: boolean | null;
  high_protein: boolean | null;
  default_tile_image_key: string | null;
  tile_thumbnail_key?: string | null;
}

interface RecipeInput {
  title: string;
  rawTitle: string;
  category: RecipeCategory;
  ingredients: string;
  directions: string;
  isNoBake: boolean;
  isEasy: boolean;
  isHealthy: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isSugarFree: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isKeto: boolean;
  isHighProtein: boolean;
}

const isUuid = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );

const normalizeCategory = (value: unknown): RecipeCategory | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replaceAll(' ', '_');
  return categories.includes(normalized as RecipeCategory)
    ? (normalized as RecipeCategory)
    : null;
};

const isValidString = (value: unknown, maximumLength: number): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.length <= maximumLength;

const parseRecipeInput = (body: unknown): RecipeInput | null => {
  if (typeof body !== 'object' || body === null) return null;
  const input = body as Record<string, unknown>;
  const category = normalizeCategory(input.category);
  const booleanFields = [
    input.isNoBake,
    input.isEasy,
    input.isHealthy,
    input.isGlutenFree,
    input.isDairyFree,
    input.isSugarFree,
    input.isVegetarian,
    input.isVegan,
    input.isKeto,
    input.isHighProtein,
  ];

  if (
    !isValidString(input.title, 100) ||
    !isValidString(input.rawTitle, 100) ||
    !category ||
    !isValidString(input.ingredients, 50_000) ||
    !isValidString(input.directions, 50_000) ||
    !booleanFields.every((value) => typeof value === 'boolean')
  ) {
    return null;
  }

  return {
    title: input.title.trim(),
    rawTitle: input.rawTitle.trim(),
    category,
    ingredients: input.ingredients,
    directions: input.directions,
    isNoBake: input.isNoBake as boolean,
    isEasy: input.isEasy as boolean,
    isHealthy: input.isHealthy as boolean,
    isGlutenFree: input.isGlutenFree as boolean,
    isDairyFree: input.isDairyFree as boolean,
    isSugarFree: input.isSugarFree as boolean,
    isVegetarian: input.isVegetarian as boolean,
    isVegan: input.isVegan as boolean,
    isKeto: input.isKeto as boolean,
    isHighProtein: input.isHighProtein as boolean,
  };
};

const constructTags = (recipe: RecipeRow): string[] => {
  const tags: string[] = [];
  if (recipe.no_bake) tags.push('no_bake');
  if (recipe.easy) tags.push('easy');
  if (recipe.healthy) tags.push('healthy');
  if (recipe.gluten_free) tags.push('gluten_free');
  if (recipe.dairy_free) tags.push('dairy_free');
  if (recipe.vegetarian) tags.push('vegetarian');
  if (recipe.vegan) tags.push('vegan');
  if (recipe.keto) tags.push('keto');
  if (recipe.sugar_free) tags.push('sugar_free');
  if (recipe.high_protein) tags.push('high_protein');
  return tags;
};

const formatRecipeResponse = (
  recipe: RecipeRow,
  preSignedUrls: string[] | null = null,
  preSignedDefaultTileImageUrl: string | null = null,
): FullRecipe => ({
  id: recipe.recipe_uuid,
  title: recipe.title,
  rawTitle: recipe.raw_title || recipe.title,
  category: normalizeCategory(recipe.category) ?? 'other',
  user_id: recipe.user_uuid,
  ingredients: recipe.ingredients,
  directions: recipe.directions,
  tags: constructTags(recipe),
  defaultTileImageKey: recipe.default_tile_image_key,
  preSignedUrls,
  preSignedDefaultTileImageUrl,
});

const recipeValues = (input: RecipeInput, userId: string) => [
  input.title,
  input.rawTitle,
  input.category,
  userId,
  input.ingredients,
  input.directions,
  input.isNoBake,
  input.isEasy,
  input.isHealthy,
  input.isGlutenFree,
  input.isDairyFree,
  input.isSugarFree,
  input.isVegetarian,
  input.isVegan,
  input.isKeto,
  input.isHighProtein,
];

router.use(authMiddleware);

router.get('/', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const result = await client.query<RecipeRow>(
      `SELECT recipes.*, files.thumbnail_key AS tile_thumbnail_key
      FROM recipes
      LEFT JOIN files
        ON files.recipe_uuid=recipes.recipe_uuid
        AND files.key=recipes.default_tile_image_key
      WHERE recipes.user_uuid=$1`,
      [request.session.userID],
    );
    const recipesByCategory: Record<RecipeCategory, FullRecipe[]> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      dessert: [],
      other: [],
      side_dish: [],
      drinks: [],
    };

    const recipes = await Promise.all(
      result.rows.map(async (recipe) => {
        const tileUrl = recipe.tile_thumbnail_key
          ? await getPresignedUrl(recipe.tile_thumbnail_key)
          : recipe.default_tile_image_key
            ? await getPresignedUrl(recipe.default_tile_image_key)
          : null;
        return formatRecipeResponse(recipe, null, tileUrl);
      }),
    );

    for (const recipe of recipes) {
      recipesByCategory[recipe.category as RecipeCategory].push(recipe);
    }
    return response.status(200).json(recipesByCategory);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const input = parseRecipeInput(request.body);
  const userId = request.session.userID;
  if (!input || !userId) {
    return response.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  try {
    const result = await client.query<RecipeRow>(
      `INSERT INTO recipes(
        title, raw_title, category, user_uuid, ingredients, directions,
        no_bake, easy, healthy, gluten_free, dairy_free, sugar_free,
        vegetarian, vegan, keto, high_protein
      ) VALUES(
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      ) RETURNING *`,
      recipeValues(input, userId),
    );
    return response.status(201).json(formatRecipeResponse(result.rows[0]));
  } catch (error) {
    return next(error);
  }
});

router.put('/', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const input = parseRecipeInput(request.body);
  const recipeId = (request.body as Record<string, unknown>)?.recipeId;
  const userId = request.session.userID;
  if (!input || !isUuid(recipeId) || !userId) {
    return response.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  try {
    const values = recipeValues(input, userId);
    const result = await client.query<RecipeRow>(
      `UPDATE recipes SET
        title=$1, raw_title=$2, category=$3, ingredients=$5, directions=$6,
        no_bake=$7, easy=$8, healthy=$9, gluten_free=$10, dairy_free=$11,
        sugar_free=$12, vegetarian=$13, vegan=$14, keto=$15,
        high_protein=$16
      WHERE recipe_uuid=$17 AND user_uuid=$4
      RETURNING *`,
      [...values, recipeId],
    );
    if (!result.rowCount) {
      return response.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }
    return response.status(200).json(formatRecipeResponse(result.rows[0]));
  } catch (error) {
    return next(error);
  }
});

router.get('/:recipeId', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { recipeId } = request.params;
  if (!isUuid(recipeId)) {
    return response.status(400).json({
      success: false,
      message: 'Invalid recipe id.',
    });
  }

  try {
    const result = await client.query<RecipeRow>(
      'SELECT * FROM recipes WHERE user_uuid=$1 AND recipe_uuid=$2',
      [request.session.userID, recipeId],
    );
    const recipe = result.rows[0];
    if (!recipe) {
      return response.status(404).json({
        success: false,
        message: 'Recipe not found.',
      });
    }

    const filesResult = await client.query<{ key: string }>(
      'SELECT key FROM files WHERE recipe_uuid=$1',
      [recipeId],
    );
    const keys = filesResult.rows.map((file) => file.key);
    const [imageUrls, tileUrl] = await Promise.all([
      keys.length ? getPresignedUrls(keys) : Promise.resolve(null),
      recipe.default_tile_image_key
        ? getPresignedUrl(recipe.default_tile_image_key)
        : Promise.resolve(null),
    ]);

    return response
      .status(200)
      .json(formatRecipeResponse(recipe, imageUrls, tileUrl));
  } catch (error) {
    return next(error);
  }
});

router.delete('/:recipeId', async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  const { recipeId } = request.params;
  const userId = request.session.userID;
  if (!isUuid(recipeId)) {
    return response.status(400).json({
      recipeDeleted: false,
      message: 'Invalid recipe id.',
    });
  }

  const transactionClient = await client.connect();
  let awsKeys: string[] = [];
  try {
    await transactionClient.query('BEGIN');
    const recipeResult = await transactionClient.query(
      `SELECT 1 FROM recipes
      WHERE recipe_uuid=$1 AND user_uuid=$2
      FOR UPDATE`,
      [recipeId, userId],
    );
    if (!recipeResult.rowCount) {
      await transactionClient.query('ROLLBACK');
      return response.status(404).json({
        recipeDeleted: false,
        message: 'Recipe not found.',
      });
    }

    const filesResult = await transactionClient.query<{ key: string }>(
      'SELECT key FROM files WHERE recipe_uuid=$1 FOR UPDATE',
      [recipeId],
    );
    awsKeys = filesResult.rows.map((file) => file.key);
    await transactionClient.query(
      'DELETE FROM recipes WHERE recipe_uuid=$1 AND user_uuid=$2',
      [recipeId, userId],
    );
    await transactionClient.query('COMMIT');
  } catch (error) {
    try {
      await transactionClient.query('ROLLBACK');
    } catch (rollbackError) {
      console.error('recipe DELETE /:recipeId rollback', rollbackError);
    }
    return next(error);
  } finally {
    transactionClient.release();
  }

  if (awsKeys.length) {
    try {
      await deleteAWSFiles(awsKeys);
    } catch (error) {
      console.error('recipe DELETE /:recipeId delete files', error);
    }
  }

  return response.status(200).json({ recipeDeleted: true });
});

export default router;
