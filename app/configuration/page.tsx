"use client"; // Ensure this is a client component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useConfig } from '../configContext'; // Import the context

export default function Configuration() {
  const { pantryItems, setPantryItems, spices, setSpices, dietaryRequirements, setDietaryRequirements } = useConfig();
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('pantry');

  // Handle adding items to the correct category
  const handleAddItem = () => {
    if (input.trim() === '') return;
    
    if (category === 'pantry') {
      setPantryItems([...pantryItems, input]); // Add to pantry items in the context
    } else if (category === 'spices') {
      setSpices([...spices, input]); // Add to spices in the context
    } else if (category === 'diet') {
      setDietaryRequirements([...dietaryRequirements, input]); // Add to dietary requirements in the context
    }

    setInput(''); // Clear input field
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configure Your Ingredients</h1>
      
      <div className="mb-4">
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)} 
          className="border p-2 rounded-md w-full"
        >
          <option value="pantry">Pantry Staples</option>
          <option value="spices">Spices</option>
          <option value="diet">Dietary Requirements</option>
        </select>
      </div>

      <input 
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Enter ${category} item`}
        className="border p-2 rounded-md w-full mb-2"
      />

      <button 
        onClick={handleAddItem}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Add Item
      </button>

      {/* Pantry Staples */}
      <div className="mt-6">
        <h2 className="text-lg font-bold">Pantry Staples</h2>
        <ul className="list-disc list-inside">
          {pantryItems.length > 0 ? (
            pantryItems.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <li>No pantry items added yet.</li>
          )}
        </ul>
      </div>

      {/* Spices */}
      <div className="mt-6">
        <h2 className="text-lg font-bold">Spices</h2>
        <ul className="list-disc list-inside">
          {spices.length > 0 ? (
            spices.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <li>No spices added yet.</li>
          )}
        </ul>
      </div>

      {/* Dietary Requirements */}
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
