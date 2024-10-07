"use client"; // Ensure this is a client component

import { useState } from 'react';
import Link from 'next/link';
import { useConfig } from '../configContext'; // Import the context

export default function Configuration() {
  const { pantryItems, setPantryItems, spices, setSpices, dietaryRequirements, setDietaryRequirements } = useConfig();

  // Keep a full list of all possible pantry items (both ticked and unticked)
  const [allPantryItems, setAllPantryItems] = useState<string[]>([...pantryItems]);

  // State to handle adding custom pantry items
  const [pantryInput, setPantryInput] = useState('');

  // Handle checkbox toggle for pantry items
  const handleCheckboxChange = (item: string) => {
    if (pantryItems.includes(item)) {
      // If the item is already checked, uncheck it
      setPantryItems(pantryItems.filter(pantryItem => pantryItem !== item));
    } else {
      // Otherwise, check the item
      setPantryItems([...pantryItems, item]);
    }
  };

  // Handle adding custom pantry item
  const handleAddPantryItem = () => {
    if (pantryInput.trim() === '') return;
    if (!allPantryItems.includes(pantryInput)) {
      setAllPantryItems([...allPantryItems, pantryInput]); // Add to all items list
    }
    if (!pantryItems.includes(pantryInput)) {
      setPantryItems([...pantryItems, pantryInput]); // Add to checked items
    }
    setPantryInput(''); // Clear input after adding
  };

  const [input, setInput] = useState('');
  const [category, setCategory] = useState('spices');

  // Handle adding spices and dietary requirements
  const handleAddItem = () => {
    if (input.trim() === '') return;

    if (category === 'spices') {
      setSpices([...spices, input]);
    } else if (category === 'diet') {
      setDietaryRequirements([...dietaryRequirements, input]);
    }

    setInput('');
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configure Your Ingredients</h1>

      {/* Add Custom Pantry Item */}
      <div className="mt-6">
        <h2 className="text-lg font-bold">Add Pantry Item</h2>
        <input
          type="text"
          value={pantryInput}
          onChange={(e) => setPantryInput(e.target.value)}
          placeholder="Enter pantry item"
          className="border p-2 rounded-md w-full mb-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddPantryItem(); // Call the function to add the ingredient
            }
          }}
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
                checked={pantryItems.includes(item)} // Control checkbox state based on pantryItems
                onChange={() => handleCheckboxChange(item)} // Toggle checked/unchecked state
                className="form-checkbox h-5 w-5 text-blue-600"
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
          {spices.length > 0 ? spices.map((item, index) => (
            <li key={index}>{item}</li>
          )) : (
            <li>No spices added yet. (An empty list will assume all spices available)</li>
          )}
        </ul>
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-bold">Dietary Requirements</h2>
        <ul className="list-disc list-inside">
          {dietaryRequirements.length > 0 ? dietaryRequirements.map((item, index) => (
            <li key={index}>{item}</li>
          )) : (
            <li>No dietary requirements added yet.</li>
          )}
        </ul>
      </div>

      {/* Navigation Links */}
      <nav className="mt-6">
        <ul className="list-none">
          <li>
            <Link href="/">
              Go to Home Page
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
