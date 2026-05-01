export interface Recipe {
  recipe: string;
  ingredients: string[];
  instructions: string | string[];
  caloriesPerServing?: {
    calories: string;
    protein: string;
    carbs: string;
  };
  link?: string;
  descriptionStart?: string;
  descriptionEnd?: string;
  error?: string;
}
