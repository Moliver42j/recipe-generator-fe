"use client"; // Ensure this is a client component

import { useState } from "react";
import Link from "next/link";
import { useHome } from "./homeContext";
import { useConfig } from "./configContext";
import { TrashIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

interface Recipe {
  recipe: string;
  ingredients: string[];
  instructions: string;
  error: string;
}

export default function Home() {
  const { ingredients, setIngredients } = useHome();
  const { pantryItems, setPantryItems, spices, dietaryRequirements } =
    useConfig();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleAddIngredient = () => {
    if (input.trim() !== "") {
      const newIngredients = input.split(",").map((ing) => ing.trim());
      setIngredients([...ingredients, ...newIngredients]);
      setInput("");
    }
  };

  const handleGenerateRecipe = async () => {
    setLoading(true);
    setRecipe(null);

    const payload = {
      ingredients: [...ingredients, ...pantryItems],
      spices: spices.length === 0 ? "all" : spices,
      dietaryRestrictions: dietaryRequirements,
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
      if (recipeData.error)
      {
        recipeData.recipe = 'No recipe found for chosen ingredients. \nTry adding more ingredients or changing your dietary restrictions.';
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

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index);
    setIngredients(updatedIngredients);
  };

  const handleRemovePantryItem = (item: string) => {
    setPantryItems(pantryItems.filter((pantryItem) => pantryItem !== item));
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Banner Section */}
      <header className="p-4 fixed top-0 left-0 right-0 z-50 bg-primary text-textPrimary">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            {/* Logo and Site Name */}
            <img src = {"/assets/favicon-96x96.png"} alt="Logo" className="h-10" />{" "}
            {/* Use favicon.ico as logo */}
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
        <aside className="hidden lg:block fixed top-16 left-0 h-full w-64 bg-sidebar text-textSecondary">
          <nav className="p-4">
            <ul>
              <li className="mb-4">
                <Link href="/configuration" className="hover:text-gray-300">
                  Configuration
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/settings" className="hover:text-gray-300">
                  Settings
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
                    href="/settings"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary shadow-lg"
                  >
                    Settings
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-grow p-8 mt-16 lg:ml-64">
          <h1 className="text-2xl font-bold mb-4">Enter Fresh Ingredients</h1>

          {/* Input to add fresh ingredients */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter fresh ingredients (comma-separated)"
            className="border p-2 shadow-lg rounded-md w-full mb-2 bg-background text-foreground"
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
            <h3 className="font-semibold">Fresh Ingredients</h3>
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
              <p className="text-textSecondary">No fresh ingredients added yet.</p>
            )}
          </div>

          {/* Pantry Staples Section */}
          <div className="mb-4">
            <h3 className="font-semibold">Pantry Staples</h3>
            {pantryItems.length > 0 ? (
              <ul className="list-disc list-inside">
                {pantryItems.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemovePantryItem(item)}
                      className="ml-4 text-textSecondary"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-textSecondary">No pantry staples added.</p>
            )}
          </div>

          {/* Generate Recipe Button */}
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
            ) : (
              "Generate Recipe"
            )}
          </button>

          {/* Display API Response */}
          {recipe && (
            <div className="mt-6">
              <h2 className="text-lg font-bold">Generated Recipe:</h2>
              <p className="mb-2">Here is a recipe based on your ingredients:</p>
              <div className="p-4 rounded-md bg-background text-foreground">
                <h3 className="font-bold mb-2">{recipe.recipe}</h3>

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
                    <p>{recipe.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
