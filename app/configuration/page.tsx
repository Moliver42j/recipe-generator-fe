"use client"; // Ensure this is a client component

import { useState } from "react";
import Link from "next/link";
import { useConfig } from "../configContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid"; 
import Logo from "../assets/favicon-96x96.png";

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
                <Link href="/" className="hover:text-gray-300">
                  Home
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
                    href="/"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary"
                  >
                    Home
                  </Link>
                </li>
                <li className="mb-4">
                  <Link
                    href="/settings"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary"
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
          <h1 className="text-2xl font-bold mb-4">Configure Your Ingredients</h1>

          {/* Add Custom Pantry Item */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Add Pantry Item</h2>
            <input
              type="text"
              value={pantryInput} // Bind to state variable
              onChange={(e) => setPantryInput(e.target.value)} // Update state on input change
              placeholder="Enter pantry item"
              className="border p-2 rounded-md w-full mb-2 bg-background text-foreground"
            />
            <button
              onClick={handleAddPantryItem}
              className="px-4 py-2 rounded-md w-full bg-primary text-textPrimary"
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
                    className="form-checkbox h-5 w-5 text-primary"
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Spices and Dietary Requirements */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Add Spices or Dietary Requirements</h2>

            <div className="mb-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded-md w-full bg-background text-foreground"
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
              className="border p-2 rounded-md w-full mb-2 bg-background text-foreground"
            />

            <button
              onClick={handleAddItem}
              className="px-4 py-2 rounded-md bg-primary text-textPrimary"
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
                <li className="text-textSecondary">
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
                <li className="text-textSecondary">No dietary requirements added yet.</li>
              )}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
