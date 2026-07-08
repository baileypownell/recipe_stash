/* eslint-disable camelcase */
import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import client from './client.js';
import { authMiddleware } from './authMiddleware.js';
import type { FullRecipe, RawRecipe } from '../shared/types.js';
const router = Router();
import {
  getPresignedUrls,
  getPresignedUrl,
  deleteAWSFiles,
} from './aws-s3.js';

type RecipeTagsSource = RawRecipe & {
  high_protein: string;
};

const constructTags = (recipe: RecipeTagsSource): string[] => {
  const tagArray: string[] = [];
  if (recipe.no_bake) {
    tagArray.push('no_bake');
  }
  if (recipe.easy) {
    tagArray.push('easy');
  }
  if (recipe.healthy) {
    tagArray.push('healthy');
  }
  if (recipe.gluten_free) {
    tagArray.push('gluten_free');
  }
  if (recipe.dairy_free) {
    tagArray.push('dairy_free');
  }
  if (recipe.vegetarian) {
    tagArray.push('vegetarian');
  }
  if (recipe.vegan) {
    tagArray.push('vegan');
  }
  if (recipe.keto) {
    tagArray.push('keto');
  }
  if (recipe.sugar_free) {
    tagArray.push('sugar_free');
  }
  if (recipe.high_protein) {
    tagArray.push('high_protein');
  }
  return tagArray;
};

const formatRecipeResponse = (recipe: any): any => {
  return {
    id: recipe.recipe_uuid,
    title: recipe.title,
    rawTitle: recipe.raw_title || recipe.title,
    category: recipe.category,
    // Every query in this file selects user_uuid, not user_id — the old
    // field name here was always undefined.
    user_id: recipe.user_uuid,
    ingredients: recipe.ingredients,
    directions: recipe.directions,
    tags: constructTags(recipe),
    defaultTileImageKey: recipe.default_tile_image_key,
    preSignedDefaultTileImageUrl: recipe.preSignedDefaultTileImageUrl,
  };
};

router.use(authMiddleware);

// authMiddleware is already applied via router.use() above, so it's
// dropped from individual route signatures below.

router.get('/', (request: Request, response: Response, next: NextFunction) => {
  client.query(
    'SELECT * FROM recipes WHERE user_uuid=$1',
    [request.session.userID],
    async (err, res) => {
      if (err) return next(err);
      const responseObject: any = {
        breakfast: [],
        lunch: [],
        dinner: [],
        dessert: [],
        other: [],
        side_dish: [],
        drinks: [],
      };

      if (!res.rows.length) return response.json(responseObject);

      let results;
      try {
        // getPresignedUrl is async — this was previously called inside a
        // synchronous .map(), which meant every preSignedDefaultTileImageUrl
        // was a pending Promise instead of a real URL string. Promise.all
        // over an async map fixes that.
        results = await Promise.all(
          res.rows.map(async (recipe) => {
            if (recipe.default_tile_image_key) {
              const preSignedDefaultTileImageUrl = await getPresignedUrl(
                recipe.default_tile_image_key,
              );
              return {
                ...recipe,
                preSignedDefaultTileImageUrl,
              };
            } else {
              return recipe;
            }
          }),
        );
      } catch (error) {
        return response.status(500).json({
          success: false,
          message: 'Could not generate image URLs.',
        });
      }

      results.forEach((recipe) => {
        if (recipe.category === 'Dinner' || recipe.category === 'dinner') {
          responseObject.dinner.push(formatRecipeResponse(recipe));
        } else if (
          recipe.category === 'Dessert' ||
          recipe.category === 'dessert'
        ) {
          responseObject.dessert.push(formatRecipeResponse(recipe));
        } else if (
          recipe.category === 'Drinks' ||
          recipe.category === 'drinks'
        ) {
          responseObject.drinks.push(formatRecipeResponse(recipe));
        } else if (recipe.category === 'Lunch' || recipe.category === 'lunch') {
          responseObject.lunch.push(formatRecipeResponse(recipe));
        } else if (
          recipe.category === 'Breakfast' ||
          recipe.category === 'breakfast'
        ) {
          responseObject.breakfast.push(formatRecipeResponse(recipe));
        } else if (recipe.category === 'Other' || recipe.category === 'other') {
          responseObject.other.push(formatRecipeResponse(recipe));
        } else if (
          recipe.category === 'Side Dish' ||
          recipe.category === 'side_dish'
        ) {
          responseObject.side_dish.push(formatRecipeResponse(recipe));
        }
      });
      response.json(responseObject);
    },
  );
});

router.post('/', (request: any, response, next) => {
  const userId = request.session.userID;
  const {
    title,
    rawTitle,
    category,
    ingredients,
    directions,
    isNoBake,
    isEasy,
    isHealthy,
    isGlutenFree,
    isDairyFree,
    isSugarFree,
    isVegetarian,
    isVegan,
    isKeto,
    isHighProtein,
  } = request.body;
  if (!!rawTitle && !!title && !!category && !!ingredients && !!directions) {
    return client.query(
      `INSERT INTO recipes(
        title,
        raw_title,
        category,
        user_uuid,
        ingredients,
        directions,
        no_bake,
        easy,
        healthy,
        gluten_free,
        dairy_free,
        sugar_free,
        vegetarian,
        vegan,
        keto,
        high_protein
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
      [
        title,
        rawTitle,
        category,
        userId,
        ingredients,
        directions,
        isNoBake,
        isEasy,
        isHealthy,
        isGlutenFree,
        isDairyFree,
        isSugarFree,
        isVegetarian,
        isVegan,
        isKeto,
        isHighProtein,
      ],
      (err, res) => {
        if (err) return next(err);

        return res.rowCount
          ? response.status(200).json(res.rows[0])
          : response.status(500).json(null);
      },
    );
  } else {
    return response.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    }) as any;
  }
});

router.put('/', (request: any, response, next) => {
  const userId = request.session.userID;
  const {
    recipeId,
    title,
    rawTitle,
    ingredients,
    directions,
    category,
    isNoBake,
    isEasy,
    isHealthy,
    isGlutenFree,
    isDairyFree,
    isSugarFree,
    isVegetarian,
    isVegan,
    isKeto,
    isHighProtein,
  } = request.body;

  if (!recipeId || !title || !category || !ingredients || !directions) {
    return response.status(400).json({
      success: false,
      message: 'Invalid request sent.',
    });
  }

  client.query(
    `UPDATE recipes SET
    title=$1,
    raw_title=$16,
    ingredients=$2,
    directions=$3,
    category=$4,
    no_bake=$5,
    easy=$6,
    healthy=$7,
    gluten_free=$8,
    dairy_free=$9,
    sugar_free=$10,
    vegetarian=$11,
    vegan=$12,
    keto=$13,
    high_protein=$17 WHERE
    recipe_uuid=$14 AND
    user_uuid=$15
    RETURNING *`,
    [
      title,
      ingredients,
      directions,
      category,
      isNoBake,
      isEasy,
      isHealthy,
      isGlutenFree,
      isDairyFree,
      isSugarFree,
      isVegetarian,
      isVegan,
      isKeto,
      recipeId,
      userId,
      rawTitle,
      isHighProtein,
    ],
    (err, res) => {
      if (err) return next(err);
      return res.rowCount
        ? response.status(200).json(res.rows[0])
        : response
            .status(404)
            .json({ success: false, message: 'Recipe not found.' });
    },
  );
});

const getImageAWSKeys = (recipeId: string) => {
  return new Promise<string[]>((resolve, reject) => {
    client.query(
      'SELECT key FROM files WHERE recipe_uuid=$1',
      [recipeId],
      (err, res) => {
        if (err) return reject(err);
        const imageUrlArray = res.rows.reduce((arr, el) => {
          arr.push(el.key);
          return arr;
        }, []);
        resolve(imageUrlArray);
      },
    );
  });
};

router.get('/:recipeId', (request: any, response, next) => {
  const { recipeId } = request.params;
  const userId = request.session.userID;
  client.query(
    'SELECT * FROM recipes WHERE user_uuid=$1 AND recipe_uuid=$2',
    [userId, recipeId],
    async (err, res) => {
      if (err) return next(err);
      const recipe = res.rows[0];
      if (!recipe)
        return response
          .status(404)
          .json({ success: false, message: 'Recipe not found.' });

      const recipeResponse: FullRecipe = {
        id: recipe.recipe_uuid,
        title: recipe.title,
        rawTitle: recipe.raw_title || recipe.title,
        category: recipe.category,
        user_id: recipe.user_uuid,
        ingredients: recipe.ingredients,
        directions: recipe.directions,
        tags: constructTags(recipe),
        defaultTileImageKey: recipe.default_tile_image_key,
        preSignedUrls: null,
        preSignedDefaultTileImageUrl: null,
      };
      if (!recipe.has_images) return response.status(200).json(recipeResponse);

      try {
        const urls = await getImageAWSKeys(recipeId);
        if (urls.length) {
          recipeResponse.preSignedUrls = await getPresignedUrls(urls);
          if (recipe.default_tile_image_key) {
            recipeResponse.preSignedDefaultTileImageUrl = await getPresignedUrl(
              recipe.default_tile_image_key,
            );
          }
        }
        response.status(200).json(recipeResponse);
      } catch (error) {
        return response.status(500).json({
          success: false,
          message: 'Could not generate image URLs.',
        });
      }
    },
  );
});

router.delete('/:recipeId', async (request: any, response, next) => {
  const userId = request.session.userID;
  const { recipeId } = request.params;

  try {
    const recipeRes = await client.query(
      'SELECT has_images FROM recipes WHERE recipe_uuid=$1 AND user_uuid=$2',
      [recipeId, userId],
    );

    if (!recipeRes.rows.length) {
      return response.status(404).json({
        recipeDeleted: false,
        message: 'Recipe not found or you do not have permission to delete it.',
      });
    }

    if (recipeRes.rows[0].has_images) {
      const filesRes = await client.query(
        'SELECT key FROM files WHERE recipe_uuid=$1',
        [recipeId],
      );
      const awsKeys = filesRes.rows.map((row) => row.key);

      if (awsKeys.length) {
        await deleteAWSFiles(awsKeys);
      }
    }

    const deleteRes = await client.query(
      'DELETE FROM recipes WHERE recipe_uuid=$1 AND user_uuid=$2',
      [recipeId, userId],
    );

    if (!deleteRes.rowCount) {
      return response.status(404).json({
        recipeDeleted: false,
        message: 'Recipe not found or you do not have permission to delete it.',
      });
    }

    return response.status(200).json({ recipeDeleted: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
