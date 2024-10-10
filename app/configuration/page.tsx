"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import Link from "next/link";
import { useConfig } from "../configContext";
import { TrashIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/storageUtils";

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

  // State to handle adding custom pantry items
  const [pantryInput, setPantryInput] = useState("");

  // Load cached data on component mount
  useEffect(() => {
    const cachedPantryItems = getFromLocalStorage("pantryItems");
    const cachedPantryItemStatus = getFromLocalStorage("pantryItemStatus");
    const cachedSpices = getFromLocalStorage("spices");
    const cachedDietaryRequirements = getFromLocalStorage(
      "dietaryRequirements"
    );

    if (cachedPantryItems) setPantryItems(cachedPantryItems);
    if (cachedPantryItemStatus) setPantryItemStatus(cachedPantryItemStatus);
    if (cachedSpices) setSpices(cachedSpices);
    if (cachedDietaryRequirements)
      setDietaryRequirements(cachedDietaryRequirements);
  }, [setPantryItems, setPantryItemStatus, setSpices, setDietaryRequirements]);

  // Handle checkbox toggle for pantry items
  const handleCheckboxChange = (item: string) => {
    const updatedStatus = {
      ...pantryItemStatus,
      [item]: !pantryItemStatus[item],
    };
    setPantryItemStatus(updatedStatus);
    saveToLocalStorage("pantryItemStatus", updatedStatus);
  };

  // Handle adding custom pantry item
  const handleAddPantryItem = () => {
    if (pantryInput.trim() === "") return;
    if (!pantryItems.includes(pantryInput)) {
      const updatedPantryItems = [...pantryItems, pantryInput];
      setPantryItems(updatedPantryItems);
      setPantryItemStatus({ ...pantryItemStatus, [pantryInput]: true }); // New item is checked by default
      saveToLocalStorage("pantryItems", updatedPantryItems);
      saveToLocalStorage("pantryItemStatus", {
        ...pantryItemStatus,
        [pantryInput]: true,
      });
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

  const [input, setInput] = useState("");
  const [category, setCategory] = useState("spices");

  // Handle adding spices and dietary requirements
  const handleAddItem = () => {
    if (input.trim() === "") return;

    if (category === "spices") {
      const updatedSpices = [...spices, input];
      setSpices(updatedSpices);
      saveToLocalStorage("spices", updatedSpices);
    } else if (category === "diet") {
      const updatedDietaryRequirements = [...dietaryRequirements, input];
      setDietaryRequirements(updatedDietaryRequirements);
      saveToLocalStorage("dietaryRequirements", updatedDietaryRequirements);
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
                <Link href="/" className="hover:text-gray-300">
                  Home
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/favourites" className="hover:text-gray-300">
                  Favourites
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
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-grow p-8 mt-16 lg:ml-64">
          <h1 className="text-2xl font-bold mb-4">
            Configure Your Ingredients
          </h1>

          {/* Add Custom Pantry Item */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Add Pantry Item</h2>
            <input
              type="text"
              value={pantryInput}
              onChange={(e) => setPantryInput(e.target.value)}
              placeholder="Enter pantry item"
              className="border-solid shadow-lg p-2 rounded-md w-full mb-2 bg-background text-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleAddPantryItem()}
            />
            <button
              onClick={handleAddPantryItem}
              className="px-4 py-2 rounded-md w-full bg-secondary text-textPrimary shadow-lg"
            >
              Add Pantry Item
            </button>
          </div>

          {/* Pantry Staples with Checkboxes and Delete Buttons */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Pantry Items</h2>
            <div className="grid grid-cols-2 gap-4">
              {pantryItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
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
                <p className="text-textSecondary">No pantry items available.</p>
              )}
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
              className="border p-2 shadow-lg rounded-md w-full mb-2 bg-background text-foreground"
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />

            <button
              onClick={handleAddItem}
              className="px-4 py-2 rounded-md bg-secondary text-textPrimary shadow-lg"
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
                <li className="text-textSecondary">No spices added yet.</li>
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
                <li className="text-textSecondary">
                  No dietary requirements added yet.
                </li>
              )}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
