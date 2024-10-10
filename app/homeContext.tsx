"use client"; // Ensure this is a client component

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { getFromLocalStorage, saveToLocalStorage } from './utils/storageUtils'; // Import storage utils

// Define the type for the HomeContext data
interface HomeContextType {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
}

// Create the HomeContext with the correct type
const HomeContext = createContext<HomeContextType | null>(null);

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);

  // Load cached ingredients from local storage on component mount
  useEffect(() => {
    const cachedIngredients = getFromLocalStorage("ingredients");
    if (cachedIngredients) {
      setIngredients(cachedIngredients);
    }
  }, []);

  // Save ingredients to local storage whenever they change
  useEffect(() => {
    if (ingredients.length > 0) {
      saveToLocalStorage("ingredients", ingredients);
    }
  }, [ingredients]);

  return (
    <HomeContext.Provider value={{ ingredients, setIngredients }}>
      {children}
    </HomeContext.Provider>
  );
};

// Hook to use the HomeContext in any component
export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error("useHome must be used within a HomeProvider");
  }
  return context;
};
