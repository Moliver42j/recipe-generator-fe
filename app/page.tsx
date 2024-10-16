"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrashIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon, // Importing shuffle icon
} from "@heroicons/react/24/solid";
import { useHome } from "./homeContext";
import { useConfig } from "./configContext";
import { getFromLocalStorage, saveToLocalStorage } from "./utils/storageUtils";

interface Recipe {
  recipe: string;
  ingredients: string[];
  instructions: string[];
  caloriesPerServing: {
    calories: string;
    protein: string;
    carbs: string;
  };
  link: string;
  descriptionStart: string;
  descriptionEnd: string;
  error: string;
}

export default function Home() {
  const { ingredients, setIngredients } = useHome();
  const {
    pantryItems,
    setPantryItems,
    spices,
    dietaryRequirements,
    pantryItemStatus,
    setPantryItemStatus,
  } = useConfig();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [favourites, setFavourites] = useState<Recipe[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pantryOpen, setPantryOpen] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false); 
  const [difficulty, setDifficulty] = useState("medium");
  const [calories, setCalories] = useState("any");

  // Load cached data on mount
  useEffect(() => {
    const cachedIngredients = getFromLocalStorage("ingredients");
    const cachedPantryItems = getFromLocalStorage("pantryItems");
    const cachedPantryStatus = getFromLocalStorage("pantryItemStatus");
    const cachedFavourites = getFromLocalStorage("favourites");
    const cachedDifficulty = getFromLocalStorage("difficulty") || "medium";
    const cachedCalories = getFromLocalStorage("calories") || "any";

    if (cachedIngredients) setIngredients(cachedIngredients);
    if (cachedPantryItems) setPantryItems(cachedPantryItems);
    if (cachedPantryStatus) setPantryItemStatus(cachedPantryStatus);
    if (cachedFavourites) setFavourites(cachedFavourites);
    setDifficulty(cachedDifficulty);
    setCalories(cachedCalories);
  }, [setIngredients, setPantryItems, setPantryItemStatus]);

  const handleAddIngredient = () => {
    if (input.trim() !== "") {
      const newIngredients = input.split(",").map((ing) => ing.trim());
      const updatedIngredients = [...ingredients, ...newIngredients];
      setIngredients(updatedIngredients);
      saveToLocalStorage("ingredients", updatedIngredients);
      setInput("");
    }
  };

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setRecipe(null);

    const tickedPantryItems = pantryItems.filter(
      (item) => pantryItemStatus[item]
    );

    const payload = {
      ingredients: [...ingredients],
      pantryItems: tickedPantryItems, // Only ticked items are sent
      spices: spices.length === 0 ? "" : spices,
      dietaryRestrictions: dietaryRequirements,
      difficulty, // Add difficulty to payload
      calories, // Add calorie preference to payload
      recipeToSkip: recipe?.recipe || "", // If a recipe exists, send it as recipeToSkip
    };

    try {
      const response = await fetch(
        "https://n9f4glumj7.execute-api.eu-west-1.amazonaws.com/default/recipeApi",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();
      const recipeData: Recipe = JSON.parse(result.body);
      if (recipeData.error) {
        recipeData.recipe =
          "No recipe found for chosen ingredients. \nTry adding more ingredients or changing your dietary restrictions.";
      }
      setRecipe(recipeData);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error generating recipe:", error.message);
        setRecipe(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to add the current recipe to favourites
  const handleAddToFavourites = () => {
    if (recipe) {
      const updatedFavourites = [...favourites, recipe];
      setFavourites(updatedFavourites);
      saveToLocalStorage("favourites", updatedFavourites); // Cache favourites
    }
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
    saveToLocalStorage("ingredients", updatedIngredients); // Cache the updated ingredients
  };

  // Instead of removing the pantry item, set its status to false
  const handleRemovePantryItem = (item: string) => {
    const updatedStatus = { ...pantryItemStatus, [item]: false };
    setPantryItemStatus(updatedStatus);
    saveToLocalStorage("pantryItemStatus", updatedStatus); // Cache the updated pantry item status
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Banner Section */}
      <header className="p-4 fixed top-0 left-0 right-0 z-50 bg-primary text-textPrimary">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            {/* Logo and Site Name */}
            <img
              src={"/assets/favicon-96x96.png"}
              alt="Logo"
              className="h-10"
            />
            <h1 className="text-2xl font-bold">DishFromThis</h1>
          </div>

          {/* Mobile Burger Menu */}
          <button
            className="block lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6 text-textPrimary " />
            ) : (
              <Bars3Icon className="h-6 w-6 text-textPrimary" />
            )}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:block fixed top-16 left-0 h-full w-64 bg-sidebar text-textPrimary">
          <nav className="p-4">
            <ul>
              <li className="mb-4">
                <Link
                  href="/"
                  className="bg-secondary text-textPrimary p-2 rounded-md block"
                >
                  Home
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="/configuration"
                  className="hover:text-gray-300 p-2 rounded-md block"
                >
                  Configuration
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="/favourites"
                  className="hover:text-gray-300 p-2 rounded-md block"
                >
                  Favourites
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="/export"
                  className="hover:text-gray-300 p-2 rounded-md block"
                >
                  Export
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Mobile Menu */}
        {menuOpen && (
          <aside className="lg:hidden p-4 absolute top-16 left-0 w-full z-50 bg-primary text-textPrimary">
            <nav>
              <ul>
                <li className="mb-4">
                  <Link
                    href="/configuration"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary shadow-lg"
                  >
                    Configuration
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    href="/favourites"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary shadow-lg"
                  >
                    Favourites
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    href="/export"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary shadow-lg"
                  >
                    Export
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-grow p-8 mt-16 lg:ml-64 mb-16">
          <h1 className="text-2xl font-bold mb-4">Enter Fresh Ingredients</h1>
          <p className="text-textSecondary">
            Add fresh ingredients you have at home to generate a recipe.{" "}
          </p>
          <p className="text-textSecondary">
            You can also add pantry items you usually have at home on the configuration page.{" "}
          </p>

          {/* Input to add fresh ingredients */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter fresh ingredients (comma-separated)"
            className="border p-2 shadow-lg rounded-md w-full mb-2 mt-5 bg-background text-foreground"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddIngredient();
              }
            }}
          />

          <button
            onClick={handleAddIngredient}
            className="px-4 py-2 rounded-md bg-secondary text-textPrimary shadow-lg"
          >
            Add Ingredient
          </button>

          {/* Ingredients Section */}
          <h2 className="mt-4 text-lg font-bold">Ingredients</h2>
          <div className="mb-4">
            <h3 className="font-semibold">
              <u>Fresh Ingredients</u>
            </h3>
            {ingredients.length > 0 ? (
              <ul className="list-disc list-inside">
                {ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{ingredient}</span>
                    <button
                      onClick={() => handleRemoveIngredient(index)}
                      className="ml-4 text-textSecondary"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-textSecondary">
                No fresh ingredients added yet.
              </p>
            )}
          </div>

          {/* Pantry Section with Toggle */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                <u>Pantry Items</u>
              </h3>
              <button onClick={() => setPantryOpen(!pantryOpen)}>
                {pantryOpen ? (
                  <ChevronUpIcon className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-primary" />
                )}
              </button>
            </div>

            {pantryOpen && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {pantryItems
                  .filter((item) => pantryItemStatus[item]) // Only show pantry items where the status is true
                  .map((item, index) => (
                    <ul className="list-disc list-inside" key={index}>
                      <li className="flex items-center justify-between">
                        <span>{item}</span>
                        <button
                          onClick={() => handleRemovePantryItem(item)}
                          className="ml-4 text-textSecondary"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </li>
                    </ul>
                  ))}
                {pantryItems.filter((item) => pantryItemStatus[item]).length ===
                  0 && (
                  <p className="text-textSecondary">No pantry staples added.</p>
                )}
              </div>
            )}
          </div>

          {/* Recipe Preferences Section with Toggle */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                <u>Recipe Preferences</u>
              </h3>
              <button onClick={() => setPreferencesOpen(!preferencesOpen)}>
                {preferencesOpen ? (
                  <ChevronUpIcon className="h-5 w-5 text-primary" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-primary" />
                )}
              </button>
            </div>

            {preferencesOpen && (
              <div className="mt-4">
                {/* Difficulty Select */}
                <label className="block mt-4">
                  <span className="font-semibold">Difficulty:</span>
                  <select
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value);
                      saveToLocalStorage("difficulty", e.target.value);
                    }}
                    className="border p-2 rounded-md w-full bg-background text-foreground mt-1"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="complex">Complex</option>
                  </select>
                </label>

                {/* Calorie Preference Toggle */}
                <label className="block mt-4">
                  <span className="font-semibold">Calorie Preference:</span>
                  <select
                    value={calories}
                    onChange={(e) => {
                      setCalories(e.target.value);
                      saveToLocalStorage("calories", e.target.value);
                    }}
                    className="border p-2 rounded-md w-full bg-background text-foreground mt-1"
                  >
                    <option value="any">Any</option>
                    <option value="low calorie">Low Calorie</option>
                  </select>
                </label>

                {/* Dietary Requirements */}
                <div className="mt-6">
                  <h4 className="font-semibold">Dietary Requirements:</h4>
                  <ul className="list-disc list-inside">
                    {dietaryRequirements.length > 0 ? (
                      dietaryRequirements.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))
                    ) : (
                      <li className="text-textSecondary">
                        No dietary requirements added.
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Generate/Shuffle Recipe Button */}
          <button
            onClick={handleGenerateRecipe}
            className="px-4 py-2 rounded-md mt-4 flex items-center justify-center bg-secondary text-textPrimary shadow-lg"
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 100 16 8 8 0 01-8-8z"
                ></path>
              </svg>
            ) : recipe ? (
              <>
                <ArrowPathIcon className="h-5 w-5 mr-2" /> Shuffle
              </>
            ) : (
              "Generate Recipe"
            )}
          </button>

          {/* Display API Response */}
          
          {/* Display Recipe */}
          {recipe && (
            <div className="mt-6">
              <h2 className="text-lg font-bold">Generated Recipe:</h2>
              <h3 className="font-bold mb-2">{recipe.recipe}</h3>
              <p className="mb-2">{recipe.descriptionStart}</p>

              <div className="p-4 rounded-md bg-background text-foreground">
                {recipe.ingredients && (
                  <div>
                    <h4 className="font-semibold">Ingredients:</h4>
                    <ul className="list-disc list-inside mb-4">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recipe.instructions && (
                  <div>
                    <h4 className="font-semibold">Instructions:</h4>
                    <ul className="list-decimal list-inside mb-4">
                      {recipe.instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Calories and Nutrition Info */}
                {recipe.caloriesPerServing && (
                  <div>
                    <h4 className="font-semibold">Nutritional Information:</h4>
                    <p>Calories: {recipe.caloriesPerServing.calories}</p>
                    <p>Protein: {recipe.caloriesPerServing.protein}</p>
                    <p>Carbohydrates: {recipe.caloriesPerServing.carbs}</p>
                  </div>
                )}

                {/* Final description */}
                <p className="mt-4">{recipe.descriptionEnd}</p>
                {recipe && (
                <button
                  onClick={handleAddToFavourites}
                  className="px-4 py-2 mt-2 rounded-md bg-secondary text-textPrimary shadow-lg"
                >
                  <HeartIcon className="h-5 w-5 inline-block mr-2" /> Add to
                  Favourites
                </button>)}

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
