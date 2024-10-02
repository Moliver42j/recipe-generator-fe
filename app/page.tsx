"use client"; // Add this line at the top

import { useState } from 'react';
import Link from 'next/link';
import { useHome } from './homeContext'; // Import the home context
import { useConfig } from './configContext'; // Import the configuration context

// Define the Recipe type
interface Recipe {
    recipe: string;
    ingredients: string[];
    instructions: string;
}

export default function Home() {
  const { ingredients, setIngredients } = useHome();
  const { pantryItems, spices, dietaryRequirements } = useConfig(); // Get pantry items and spices from config
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // State for handling loading
  const [recipe, setRecipe] = useState<Recipe | null>(null); // State for storing API response

  // Handle adding fresh ingredients
  const handleAddIngredient = () => {
    if (input.trim() !== '') {
      // Split by commas and trim whitespace to allow comma-separated entries
      const newIngredients = input.split(',').map(ing => ing.trim());
      setIngredients([...ingredients, ...newIngredients]);
      setInput('');
    }
  };

  const handleGenerateRecipe = async () => {
    setLoading(true); // Start loading when button is clicked
    setRecipe(null); // Clear previous recipe

    const payload = {
      ingredients: [...ingredients, ...pantryItems], // Combine fresh and pantry ingredients
      spices: spices.length === 0 ? "all" : spices, // Assume "all spices" if none are selected
      dietaryRestrictions: dietaryRequirements,
    };

    console.log("Sending payload:", payload); // Log the payload being sent

    try {
      const response = await fetch(
        "https://n9f4glumj7.execute-api.eu-west-1.amazonaws.com/default/recipeApi",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(`Error ${response.status}: ${errorMessage}`);
      }

      const result = await response.json();
      console.log("API Response:", result); // Log the response for debugging

      // Parse the API response body (assuming it's stringified JSON)
      const recipeData: Recipe = JSON.parse(result.body);
      setRecipe(recipeData); // Set the parsed recipe to the state

    } catch (error) {
      if (error instanceof Error) {
        console.error("Error generating recipe:", error.message); // Log the error
        setRecipe(null); // Clear the recipe on error
      } else {
        console.error("Unknown error:", error);
        setRecipe(null); // Clear the recipe on unknown error
      }
    } finally {
      setLoading(false); // Stop loading after request finishes
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enter Fresh Ingredients</h1>

      {/* Input to add fresh ingredients */}
      <input 
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter fresh ingredients (comma-separated)"
        className="border p-2 rounded-md w-full mb-2"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleAddIngredient(); // Trigger add ingredient on Enter
          }
        }}
      />

      <button 
        onClick={handleAddIngredient}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Add Ingredient
      </button>

      {/* Ingredients Section */}
      <h2 className="mt-4 text-lg font-bold">Ingredients</h2>

      {/* Fresh Ingredients List */}
      <div className="mb-4">
        <h3 className="font-semibold">Fresh Ingredients</h3>
        {ingredients.length > 0 ? (
          <ul className="list-disc list-inside">
            {ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No fresh ingredients added yet.</p>
        )}
      </div>

      {/* Pantry Staples Section */}
      <div className="mb-4">
        <h3 className="font-semibold">Pantry Staples</h3>
        {pantryItems.length > 0 ? (
          <ul className="list-disc list-inside">
            {pantryItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No pantry staples added.</p>
        )}
      </div>

      {/* Spices Section */}
      <div className="mb-4">
        <h3 className="font-semibold">Spices</h3>
        {spices.length > 0 ? (
          <ul className="list-disc list-inside">
            {spices.map((spice, index) => (
              <li key={index}>{spice}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">All spices will be used.</p>
        )}
      </div>

      {/* Generate Recipe Button with Loading Spinner */}
      <button 
        onClick={handleGenerateRecipe}
        className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 flex items-center justify-center"
        disabled={loading} // Disable the button while loading
      >
        {loading ? (
          <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l4-4-4-4v4a8 8 0 100 16 8 8 0 01-8-8z"></path>
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

          {/* Format recipe output */}
          <div className="bg-gray-100 p-4 rounded-md text-black">
            <h3 className="font-bold mb-2">{recipe.recipe}</h3>

            {/* Check if ingredients exist before rendering */}
            {recipe.ingredients && (
              <div>
                <h4 className="font-semibold">Ingredients:</h4>
                <ul className="list-disc list-inside mb-4">
                  {recipe.ingredients.map((ingredient: string, index: number) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Check if instructions exist before rendering */}
            {recipe.instructions && (
              <div>
                <h4 className="font-semibold">Instructions:</h4>
                <p>{recipe.instructions}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="mt-6">
        <ul className="list-none">
          <li>
            <Link href="/configuration">
              Go to Configuration Page
            </Link>
          </li>
          <li>
            <Link href="/settings">
              Go to Settings Page
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
