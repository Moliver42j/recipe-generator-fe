"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import {
  TrashIcon,
  PencilIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Link from "next/link";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/storageUtils";

interface Recipe {
  recipe: string;
  ingredients: string[];
  instructions: string;
}

export default function Favourites() {
  const [favourites, setFavourites] = useState<Recipe[]>([]); // Store favourite recipes
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null); // For editing a recipe
  const [editIndex, setEditIndex] = useState<number | null>(null); // Track which recipe is being edited
  const [menuOpen, setMenuOpen] = useState(false); // For mobile menu

  // Load favourites from local storage on component mount
  useEffect(() => {
    const cachedFavourites = getFromLocalStorage("favourites");
    if (cachedFavourites) setFavourites(cachedFavourites);
  }, []);

  // Function to delete a recipe from favourites
  const handleDelete = (recipeIndex: number) => {
    const updatedFavourites = favourites.filter(
      (_, index) => index !== recipeIndex
    );
    setFavourites(updatedFavourites);
    saveToLocalStorage("favourites", updatedFavourites);
  };

  // Function to start editing a recipe
  const handleEdit = (recipe: Recipe, index: number) => {
    setEditingRecipe(recipe);
    setEditIndex(index); // Set which recipe is being edited
  };

  // Function to save the edited recipe
  const handleSaveEdit = () => {
    if (editingRecipe !== null && editIndex !== null) {
      const updatedFavourites = [...favourites];
      updatedFavourites[editIndex] = editingRecipe;
      setFavourites(updatedFavourites);
      saveToLocalStorage("favourites", updatedFavourites);
      setEditingRecipe(null);
      setEditIndex(null);
    }
  };

  const handleEditChange = (field: keyof Recipe, value: string | string[]) => {
    if (editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        [field]: value,
      });
    }
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
              <XMarkIcon className="h-6 w-6 text-textPrimary" />
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
                  className="hover:text-gray-300 p-2 rounded-md block"
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
                  className="bg-secondary text-textPrimary p-2 rounded-md block"
                >
                  Favourites
                </Link>
              </li>
              <li className="mb-4">
                {/* Export page is highlighted with bg-secondary */}
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
                    href="/"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary shadow-lg"
                  >
                    Home
                  </Link>
                </li>
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
        <main className="flex-grow p-8 mt-16 lg:ml-64">
          <h1 className="text-2xl font-bold mb-4">Favourite Recipes</h1>

          {favourites.length === 0 ? (
            <p>No favourites added yet.</p>
          ) : (
            <ul>
              {favourites.map((recipe, index) => (
                <li key={index} className="mb-4 p-4 border rounded-md shadow">
                  {editingRecipe && editIndex === index ? (
                    // Editing mode
                    <div>
                      <input
                        type="text"
                        value={editingRecipe.recipe}
                        onChange={(e) =>
                          handleEditChange("recipe", e.target.value)
                        }
                        className="border p-2 mb-2 w-full"
                        placeholder="Edit Recipe Title"
                      />
                      <textarea
                        value={editingRecipe.instructions}
                        onChange={(e) =>
                          handleEditChange("instructions", e.target.value)
                        }
                        className="border p-2 mb-2 w-full"
                        placeholder="Edit Recipe Instructions"
                      />
                      <textarea
                        value={editingRecipe.ingredients.join(", ")}
                        onChange={(e) =>
                          handleEditChange(
                            "ingredients",
                            e.target.value.split(", ")
                          )
                        }
                        className="border p-2 mb-2 w-full"
                        placeholder="Edit Ingredients (comma-separated)"
                      />
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 rounded-md bg-secondary text-textPrimary shadow-lg"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    // Display the recipe
                    <div>
                      <h3 className="font-bold">{recipe.recipe}</h3>
                      <p className="mt-2">
                        <strong>Ingredients:</strong>
                        <ul className="list-disc list-inside ml-5 mt-2">
                          {" "}
                          {/* List with bullets and spacing */}
                          {recipe.ingredients.map((ingredient, idx) => (
                            <li key={idx} className="mb-1">
                              {" "}
                              {/* Add margin-bottom to separate ingredients */}
                              {ingredient}
                            </li>
                          ))}
                        </ul>
                      </p>
                      <p className="mt-2 mb-4">
                        <strong>Instructions:</strong> {recipe.instructions}
                      </p>
                      <button
                        onClick={() => handleEdit(recipe, index)}
                        className="px-4 py-2 rounded-md bg-secondary text-textPrimary shadow-lg mr-2"
                      >
                        <PencilIcon className="h-5 w-5 inline-block mr-2" />{" "}
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="px-4 py-2 rounded-md bg-red-600 text-white shadow-lg"
                      >
                        <TrashIcon className="h-5 w-5 inline-block mr-2" />{" "}
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    </div>
  );
}
