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

export interface TileImageSetResponse {
  success: boolean;
  message?: string;
}
