"use client"; // Add this line at the top

import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [spices, setSpices] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // State for handling loading
  const [recipe, setRecipe] = useState<string | null>(null); // State for storing API response

  const handleAddIngredient = () => {
    if (input.trim() !== '') {
      setIngredients([...ingredients, input]);
      setInput('');
    }
  };

  const handleGenerateRecipe = async () => {
    setLoading(true); // Start loading when button is clicked
    setRecipe(null); // Clear previous recipe

    const payload = {
      ingredients: [...ingredients, ...pantryItems], // Combine fresh and pantry ingredients
      spices: spices,
      dietaryRestrictions: dietaryRestrictions,
    };

     // Log the payload to the console
    console.log("Sending payload:", payload);

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

      const result = await response.json();
      setRecipe(JSON.stringify(result, null, 2)); // Set the recipe to the response
    } catch (error) {
      console.error("Error generating recipe: ", error);
      setRecipe("Error generating recipe, please try again.");
    } finally {
      setLoading(false); // Stop loading after request finishes
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Enter Fresh Ingredients</h1>
      
      <input 
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter ingredient"
        className="border p-2 rounded-md w-full mb-2"
      />

      <button 
        onClick={handleAddIngredient}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Add Ingredient
      </button>

      <h2 className="mt-4 text-lg">Ingredients List</h2>
      <ul className="list-disc list-inside">
        {ingredients.map((ingredient, index) => (
          <li key={index}>{ingredient}</li>
        ))}
      </ul>

      {/* Generate Recipe Button with Loading Spinner */}
      <button 
        onClick={handleGenerateRecipe}
        className="bg-green-500 text-white px-4 py-2 rounded-md mt-4 flex items-center justify-center"
        disabled={loading} // Disable the button while loading
      >
        {loading ? (
          // Display spinner when loading
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
          <pre className="bg-gray-100 p-4 rounded-md text-black">
            {recipe}
          </pre>
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
