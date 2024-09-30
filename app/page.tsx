"use client"; // Add this line at the top

import { useState } from 'react';
import Link from 'next/link';
import { useHome } from './homeContext'; // Import the home context
import { useConfig } from './configContext'; // Import the context

export default function Home() {
  const { ingredients, setIngredients } = useHome();
  const { pantryItems, setPantryItems, spices, setSpices, dietaryRequirements, setDietaryRequirements } = useConfig();
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
  
      // Assuming the 'body' field is a stringified JSON, we parse it
      const recipeData = JSON.parse(result.body);
      setRecipe(recipeData); // Set the parsed recipe to the state
  
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error generating recipe:", error.message); // Log the error
        setRecipe(`Error generating recipe: ${error.message}`); // Display error in the UI
      } else {
        console.error("Unknown error:", error);
        setRecipe("An unknown error occurred.");
      }
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
            <h4 className="font-semibold">Ingredients:</h4>
            <ul className="list-disc list-inside mb-4">
              {recipe.ingredients.map((ingredient: string, index: number) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
            <h4 className="font-semibold">Instructions:</h4>
            <p>{recipe.instructions}</p>
            {/* <p className="mt-2"><a href={recipe.link} className="text-blue-500 hover:underline">Full Recipe</a></p> */}
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
