"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import Link from "next/link";
import { useConfig } from "../configContext";
import {
  TrashIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/solid"; // Import Chevron icons for dropdown
import {
  getFromLocalStorage,
  saveToLocalStorage,
} from "../utils/storageUtils";

export default function Configuration() {
  const {
    pantryItems,
    setPantryItems,
    pantryItemStatus,
    setPantryItemStatus,
    spices,
    setSpices,
    dietaryRequirements,
    setDietaryRequirements,
  } = useConfig();

  const [menuOpen, setMenuOpen] = useState(false);
  const [pantryInput, setPantryInput] = useState("");
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("spices");
  const [pantryOpen, setPantryOpen] = useState(true); // State to control pantry visibility
  const [difficulty, setDifficulty] = useState("medium"); // Difficulty state
  const [calorieContent, setCalorieContent] = useState("any"); // Calorie content state

  // Load cached data on component mount
  useEffect(() => {
    const cachedPantryItems = getFromLocalStorage("pantryItems");
    const cachedPantryItemStatus = getFromLocalStorage("pantryItemStatus");
    const cachedSpices = getFromLocalStorage("spices");
    const cachedDietaryRequirements = getFromLocalStorage("dietaryRequirements");
    const cachedDifficulty = getFromLocalStorage("difficulty") || "medium"; // Default to 'medium'
    const cachedCalorieContent = getFromLocalStorage("calorieContent") || "any"; // Default to 'any'

    if (cachedPantryItems) setPantryItems(cachedPantryItems);
    if (cachedPantryItemStatus) setPantryItemStatus(cachedPantryItemStatus);
    if (cachedSpices) setSpices(cachedSpices);
    if (cachedDietaryRequirements) setDietaryRequirements(cachedDietaryRequirements);
    setDifficulty(cachedDifficulty);
    setCalorieContent(cachedCalorieContent);
  }, [setPantryItems, setPantryItemStatus, setSpices, setDietaryRequirements]);

  // Handle difficulty selection
  const handleDifficultyChange = (newDifficulty: string) => {
    setDifficulty(newDifficulty);
    saveToLocalStorage("difficulty", newDifficulty); // Cache the difficulty setting
  };

  // Handle calorie content selection
  const handleCalorieContentChange = (newContent: string) => {
    setCalorieContent(newContent);
    saveToLocalStorage("calorieContent", newContent); // Cache the calorie content setting
  };

  // Handle checkbox toggle for pantry items
  const handleCheckboxChange = (item: string) => {
    const updatedStatus = {
      ...pantryItemStatus,
      [item]: !pantryItemStatus[item],
    };
    setPantryItemStatus(updatedStatus);
    saveToLocalStorage("pantryItemStatus", updatedStatus);
  };

  // Handle adding custom pantry items (supports comma-separated values)
  const handleAddPantryItem = () => {
    if (pantryInput.trim() === "") return;

    const newItems = pantryInput
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && !pantryItems.includes(item));

    if (newItems.length > 0) {
      const updatedPantryItems = [...pantryItems, ...newItems];
      setPantryItems(updatedPantryItems);

      const newStatus = { ...pantryItemStatus };
      newItems.forEach((item) => {
        newStatus[item] = true; // New items are checked by default
      });
      setPantryItemStatus(newStatus);

      saveToLocalStorage("pantryItems", updatedPantryItems);
      saveToLocalStorage("pantryItemStatus", newStatus);
    }
    setPantryInput(""); // Clear input after adding
  };

  // Handle removing pantry item by setting its status to false (Hide from list)
  const handleRemovePantryItem = (item: string) => {
    const updatedStatus = { ...pantryItemStatus, [item]: false };
    setPantryItemStatus(updatedStatus);
    saveToLocalStorage("pantryItemStatus", updatedStatus);
  };

  // Completely delete pantry item from the list and cached memory
  const handleDeletePantryItem = (item: string) => {
    const updatedPantryItems = pantryItems.filter(
      (pantryItem) => pantryItem !== item
    );
    const updatedStatus = { ...pantryItemStatus };
    delete updatedStatus[item]; // Remove the status for this item

    setPantryItems(updatedPantryItems);
    setPantryItemStatus(updatedStatus);

    saveToLocalStorage("pantryItems", updatedPantryItems); // Update the cached pantry items
    saveToLocalStorage("pantryItemStatus", updatedStatus); // Update the cached status
  };

  // Handle removing dietary requirements
  const handleRemoveDietaryRequirement = (requirement: string) => {
    const updatedDietaryRequirements = dietaryRequirements.filter(
      (item) => item !== requirement
    );
    setDietaryRequirements(updatedDietaryRequirements);
    saveToLocalStorage("dietaryRequirements", updatedDietaryRequirements); // Cache the updated dietary requirements
  };

  // Handle removing spices
  const handleRemoveSpice = (spice: string) => {
    const updatedSpices = spices.filter((item) => item !== spice);
    setSpices(updatedSpices);
    saveToLocalStorage("spices", updatedSpices); // Cache the updated spices
  };

  // Handle adding spices and dietary requirements (supports comma-separated values)
  const handleAddItem = () => {
    if (input.trim() === "") return;

    const newItems = input
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (category === "spices") {
      const uniqueNewItems = newItems.filter((item) => !spices.includes(item));
      if (uniqueNewItems.length > 0) {
        const updatedSpices = [...spices, ...uniqueNewItems];
        setSpices(updatedSpices);
        saveToLocalStorage("spices", updatedSpices);
      }
    } else if (category === "diet") {
      const uniqueNewItems = newItems.filter(
        (item) => !dietaryRequirements.includes(item)
      );
      if (uniqueNewItems.length > 0) {
        const updatedDietaryRequirements = [
          ...dietaryRequirements,
          ...uniqueNewItems,
        ];
        setDietaryRequirements(updatedDietaryRequirements);
        saveToLocalStorage("dietaryRequirements", updatedDietaryRequirements);
      }
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
            <img
              src={"/assets/favicon-96x96.png"}
              alt="Logo"
              className="h-10"
            />{" "}
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

      <div className="flex flex-col min-h-screen">
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
                  className="bg-secondary text-textPrimary p-2 rounded-md block"
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
                    href="/"
                    className="block px-4 py-2 rounded bg-secondary text-textPrimary shadow-lg"
                  >
                    Home
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
        <main className="flex-grow p-8 mt-16 lg:ml-64">
          <h1 className="text-2xl font-bold mb-4">
            Configure Your Ingredients
          </h1>

          {/* Add Custom Pantry Items */}
          <div className="mt-6">
            <p className="text-textSecondary">
              Add custom pantry items to track your inventory. This is where you put Items that you always have in your cupboards.
            </p>
            <p className="text-textSecondary">You can also mark them as available or not available. </p>
            <h2 className="text-lg font-bold">Add Pantry Items</h2>
            <input
              type="text"
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              placeholder="Enter pantry items (comma-separated)"
              className="border p-2 shadow-lg rounded-md w-full mb-2 bg-background text-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleAddPantryItem()}
            />
            <button
              onClick={handleAddPantryItem}
              className="px-4 py-2 rounded-md w-full bg-secondary text-textPrimary shadow-lg"
            >
              Add Pantry Items
            </button>
            <p className="text-sm text-textSecondary mt-1">
              Enter multiple items separated by commas.
            </p>
          </div>

          {/* Pantry Section with Toggle */}
          <div className="mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold">Pantry Items</h2>
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
                {pantryItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={!!pantryItemStatus[item]}
                        onChange={() => handleCheckboxChange(item)}
                        className="form-checkbox h-5 w-5 text-primary"
                      />
                      <span>{item}</span>
                    </label>
                    <button
                      onClick={() => handleDeletePantryItem(item)}
                      className="text-textSecondary hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                {pantryItems.length === 0 && (
                  <p className="text-textSecondary">
                    No pantry items available.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Spices and Dietary Requirements */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">
              Add Spices or Dietary Requirements/Preferences
            </h2>

            <div className="mb-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded-md w-full bg-background text-foreground"
              >
                <option value="spices">Spices</option>
                <option value="diet">Dietary Requirements/Preferences</option>
              </select>
            </div>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Enter ${category} items (comma-separated)`}
              className="border p-2 shadow-lg rounded-md w-full mb-2 bg-background text-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <button
              onClick={handleAddItem}
              className="px-4 py-2 rounded-md bg-secondary text-textPrimary shadow-lg"
            >
              Add {category === "spices" ? "Spices" : "Dietary Requirements"}
            </button>
            <p className="text-sm text-textSecondary mt-1">
              Enter multiple items separated by commas.
            </p>
          </div>

          {/* Difficulty and Calorie Content */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Difficulty</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleDifficultyChange("easy")}
                className={`px-4 py-2 rounded-md ${difficulty === "easy" ? "bg-secondary" : "bg-background"} text-textPrimary shadow-lg`}
              >
                Easy
              </button>
              <button
                onClick={() => handleDifficultyChange("medium")}
                className={`px-4 py-2 rounded-md ${difficulty === "medium" ? "bg-secondary" : "bg-background"} text-textPrimary shadow-lg`}
              >
                Medium
              </button>
              <button
                onClick={() => handleDifficultyChange("complex")}
                className={`px-4 py-2 rounded-md ${difficulty === "complex" ? "bg-secondary" : "bg-background"} text-textPrimary shadow-lg`}
              >
                Complex
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-bold">Calorie Content</h2>
            <div className="flex space-x-4">
              <button
                onClick={() => handleCalorieContentChange("low calorie")}
                className={`px-4 py-2 rounded-md ${calorieContent === "low calorie" ? "bg-secondary" : "bg-background"} text-textPrimary shadow-lg`}
              >
                Low Calorie
              </button>
              <button
                onClick={() => handleCalorieContentChange("any")}
                className={`px-4 py-2 rounded-md ${calorieContent === "any" ? "bg-secondary" : "bg-background"} text-textPrimary shadow-lg`}
              >
                Any
              </button>
            </div>
          </div>

          {/* Display Spices */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Spices</h2>
            <ul className="list-disc list-inside">
              {spices.length > 0 ? (
                spices.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveSpice(item)}
                      className="text-textSecondary hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-textSecondary">No spices added yet.</li>
              )}
            </ul>
          </div>

          {/* Display Dietary Requirements */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Dietary Requirements/Preferences</h2>
            <ul className="list-disc list-inside">
              {dietaryRequirements.length > 0 ? (
                dietaryRequirements.map((item, index) => (
                  <li key={index} className="flex items-center justify-between">
                    <span>{item}</span>
                    <button
                      onClick={() => handleRemoveDietaryRequirement(item)}
                      className="text-textSecondary hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-textSecondary">
                  No dietary requirements/Preferences added yet.
                </li>
              )}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
