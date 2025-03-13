/* eslint-disable camelcase */
import { Router } from 'express';
import client from './client';
import { authMiddleware } from './authMiddleware';
const router = Router();
const {
  getPresignedUrls,
  getPresignedUrl,
  deleteAWSFiles,
} = require('./aws-s3');

export interface RawRecipe {
  title: string;
  raw_title: string;
  ingredients: string;
  directions: string;
  category: string;
  no_bake: string;
  easy: string;
  healthy: string;
  gluten_free: string;
  dairy_free: string;
  sugar_free: string;
  vegetarian: string;
  vegan: string;
  keto: string;
  recipe_uuid: string;
  user_uuid: string;
}

const constructTags = (recipe): string[] => {
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
    user_id: recipe.user_id,
    ingredients: recipe.ingredients,
    directions: recipe.directions,
    tags: constructTags(recipe),
    defaultTileImageKey: recipe.default_tile_image_key,
    preSignedDefaultTileImageUrl: recipe.preSignedDefaultTileImageUrl,
  };
};

router.use(authMiddleware);

router.get('/', authMiddleware, (request: any, response, next) => {
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

      const results = await Promise.all(
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

router.post('/', (request: any, response, next): Promise<RawRecipe> => {
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

router.put('/', (request: any, response, next): Promise<RawRecipe> => {
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
  return client.query(
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
        : response.status(500).json(null);
    },
  );
});

const getImageAWSKeys = (recipeId: string) => {
  return new Promise((resolve, reject) => {
    client.query(
      'SELECT key FROM files WHERE recipe_uuid=$1',
      [recipeId],
      (err, res) => {
        if (err) reject(err);
        const imageUrlArray = res.rows.reduce((arr, el) => {
          arr.push(el.key);
          return arr;
        }, []);
        resolve(imageUrlArray);
      },
    );
  });
};

export interface FullRecipe {
  id: string;
  title: string;
  rawTitle: string;
  category: string;
  user_id: string;
  ingredients: string;
  directions: string;
  tags: string[];
  defaultTileImageKey: string | null;
  preSignedUrls: string[] | null;
  preSignedDefaultTileImageUrl: string | null;
}

router.get(
  '/:recipeId',
  (request: any, response, next): Promise<FullRecipe | null> => {
    const { recipeId } = request.params;
    const userId = request.session.userID;
    return client.query(
      'SELECT * FROM recipes WHERE user_uuid=$1 AND recipe_uuid=$2',
      [userId, recipeId],
      async (err, res) => {
        if (err) return next(err);
        const recipe = res.rows[0];
        if (!recipe) return response.status(500).json(null);

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
        if (!recipe.has_images)
          return response.status(200).json(recipeResponse);

        const urls = await getImageAWSKeys(recipeId);
        if (urls) {
          recipeResponse.preSignedUrls = await getPresignedUrls(urls);
          if (recipe.default_tile_image_key) {
            const preSignedDefaultTileImageUrl = await getPresignedUrl(
              recipe.default_tile_image_key,
            );
            recipeResponse.preSignedDefaultTileImageUrl =
              preSignedDefaultTileImageUrl;
          }
        }
        response.status(200).json(recipeResponse);
      },
    );
  },
);

router.delete(
  '/:recipeId',
  (request: any, response, next): Promise<{ recipeDeleted: boolean }> => {
    const userId = request.session.userID;
    const { recipeId } = request.params;
    return client.query(
      'DELETE FROM recipes WHERE recipe_uuid=$1 AND user_uuid=$2 RETURNING has_images, recipe_uuid',
      [recipeId, userId],
      (err, res) => {
        if (err) return next(err);
        if (res) {
          const hasImages: boolean = res.rows[0].has_images;
          const recipeId: string = res.rows[0].recipe_uuid;
          if (!hasImages)
            return response.status(200).json({ recipeDeleted: true });

          // delete images associated with the recipe from database
          client.query(
            'DELETE FROM files WHERE recipe_uuid=$1 RETURNING key',
            [recipeId],
            async (error, res) => {
              if (error)
                return response.status(500).json({ recipeDeleted: false });
              // set recipe's "has_images" property to false if necessary
              if (res) {
                const awsKeys = res.rows.map((row) => row.key);
                // then delete from AWS S3
                const awsDeletions = await deleteAWSFiles(awsKeys);
                if (awsDeletions) {
                  return response.status(200).json({ recipeDeleted: true });
                }
              }
            },
          );
        }
      },
    );
  },
);

export default router;
