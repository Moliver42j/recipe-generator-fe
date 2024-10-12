"use client"; // Ensure this is a client component

import { useState, useEffect } from "react";
import Link from "next/link";
import { useConfig } from "../configContext";
import { useHome } from "../homeContext";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";

export default function ExportData() {
  const { pantryItems, spices, dietaryRequirements } = useConfig();
  const { ingredients } = useHome();
  const [menuOpen, setMenuOpen] = useState(false);

  // Export data as a comma-separated string
  const handleExport = () => {
    const pantryList = pantryItems.join(", ");
    const freshList = ingredients.join(", ");
    const spicesList = spices.join(", ");
    const dietaryList = dietaryRequirements.join(", ");

    alert(
      `Pantry: ${pantryList}\nFresh: ${freshList}\nSpices: ${spicesList}\nDietary: ${dietaryList}`
    );
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
                  className="hover:text-gray-300 p-2 rounded-md block"
                >
                  Favourites
                </Link>
              </li>
              <li className="mb-4">
                {/* Export page is highlighted with bg-secondary */}
                <Link
                  href="/export"
                  className="bg-secondary text-textPrimary p-2 rounded-md block"
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
          <h1 className="text-2xl font-bold mb-4">
            Export Pantry and Ingredients
          </h1>

          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-md bg-secondary text-textPrimary shadow-lg"
          >
            Export Data
          </button>

          {/* Display Data */}
          <div className="mt-6">
            <h2 className="text-lg font-bold">Pantry Items</h2>
            <p>
              {pantryItems.length > 0
                ? pantryItems.join(", ")
                : "No pantry items added yet."}
            </p>

            <h2 className="text-lg font-bold mt-4">Fresh Ingredients</h2>
            <p>
              {ingredients.length > 0
                ? ingredients.join(", ")
                : "No fresh ingredients added yet."}
            </p>

            <h2 className="text-lg font-bold mt-4">Spices</h2>
            <p>
              {spices.length > 0 ? spices.join(", ") : "No spices added yet."}
            </p>

            <h2 className="text-lg font-bold mt-4">Dietary Requirements</h2>
            <p>
              {dietaryRequirements.length > 0
                ? dietaryRequirements.join(", ")
                : "No dietary requirements added yet."}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
