"use client"; // Ensure this is a client component

import { useState } from "react";
import Link from "next/link";
import { useConfig } from "../configContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid"; // Import icons

export default function Configuration() {
  const {
    pantryItems,
    setPantryItems,
    spices,
    setSpices,
    dietaryRequirements,
    setDietaryRequirements,
  } = useConfig();
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu

  // Keep a full list of all possible pantry items (both ticked and unticked)
  const [allPantryItems, setAllPantryItems] = useState<string[]>([
    ...pantryItems,
  ]);

  // State to handle adding custom pantry items
  const [pantryInput, setPantryInput] = useState("");

  // Handle checkbox toggle for pantry items
  const handleCheckboxChange = (item: string) => {
    if (pantryItems.includes(item)) {
      setPantryItems(pantryItems.filter((pantryItem) => pantryItem !== item));
    } else {
      setPantryItems([...pantryItems, item]);
    }
  };

  // Handle adding custom pantry item
  const handleAddPantryItem = () => {
    if (pantryInput.trim() === "") return;
    if (!allPantryItems.includes(pantryInput)) {
      setAllPantryItems([...allPantryItems, pantryInput]);
    }
    if (!pantryItems.includes(pantryInput)) {
      setPantryItems([...pantryItems, pantryInput]);
    }
    setPantryInput(""); // Clear input after adding
  };

  const [input, setInput] = useState("");
  const [category, setCategory] = useState("spices");

  // Handle adding spices and dietary requirements
  const handleAddItem = () => {
    if (input.trim() === "") return;

    if (category === "spices") {
      setSpices([...spices, input]);
    } else if (category === "diet") {
      setDietaryRequirements([...dietaryRequirements, input]);
    }

    setInput("");
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Banner Section */}
      <header className="bg-blue-600 text-white p-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-3">
            {/* Logo and Site Name */}
            <img src="/favicon.ico" alt="Logo" className="h-10" />{" "}
            {/* Use favicon.ico as logo */}
            <h1 className="text-2xl font-bold">DishFromThis</h1>
          </div>

          {/* Mobile Burger Menu */}
          <button
            className="block lg:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar for Desktop */}
        <aside className="hidden lg:block bg-gray-900 text-white fixed top-16 left-0 h-full w-64">
          <nav className="p-4">
            <ul>
              <li className="mb-4">
                <Link href="/" className="hover:text-gray-300">
                  Go to Home Page
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/settings" className="hover:text-gray-300">
                  Go to Settings Page
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Mobile Menu */}
        {menuOpen && (
          <aside className="lg:hidden bg-blue-700 text-white p-4 absolute top-16 left-0 w-full z-50">
            <nav>
              <ul>
                <li className="mb-4">
                  <Link
                    href="/"
                    className="hover:bg-blue-500 block px-4 py-2 rounded"
                  >
                    Go to Home Page
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    href="/settings"
                    className="hover:bg-blue-500 block px-4 py-2 rounded"
                  >
                    Go to Settings Page
                  </Link>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-grow p-8 mt-16 lg:ml-64"> {/* Add `mt-16` to account for the height of the top bar */}
        <h1 className="text-2xl font-bold mb-4">Configure Your Ingredients</h1>
          {/* Add Custom Pantry Item */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Add Pantry Item</h2>
            <input
              type="text"
              value=""
              onChange={() => {}}
              placeholder="Enter pantry item"
              className="border p-2 rounded-md w-full mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleAddPantryItem}
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-full"
            >
              Add Pantry Item
            </button>
          </div>
          {/* Pantry Staples with Checkboxes */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Pantry Items</h2>
            <div className="grid grid-cols-2 gap-4">
              {allPantryItems.map((item, index) => (
                <label key={index} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={pantryItems.includes(item)}
                    onChange={() => handleCheckboxChange(item)}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Spices and Dietary Requirements */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">
              Add Spices or Dietary Requirements
            </h2>

            <div className="mb-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded-md w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="spices">Spices</option>
                <option value="diet">Dietary Requirements</option>
              </select>
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter ${category} item`}
              className="border p-2 rounded-md w-full mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />

            <button
              onClick={handleAddItem}
              className="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add Item
            </button>
          </div>
          {/* Display Spices and Dietary Requirements */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Spices</h2>
            <ul className="list-disc list-inside">
              {spices.length > 0 ? (
                spices.map((item, index) => <li key={index}>{item}</li>)
              ) : (
                <li>
                  No spices added yet. (An empty list will assume all spices
                  available)
                </li>
              )}
            </ul>
          </div>
          <div className="mt-6">
            <h2 className="text-lg font-bold">Dietary Requirements</h2>
            <ul className="list-disc list-inside">
              {dietaryRequirements.length > 0 ? (
                dietaryRequirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))
              ) : (
                <li>No dietary requirements added yet.</li>
              )}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
