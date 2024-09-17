// homeContext.tsx
"use client"; // Ensure this is a client component

import { createContext, useState, ReactNode, useContext } from 'react';

// Define the type for the HomeContext data
interface HomeContextType {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
}

// Create the HomeContext with the correct type
const HomeContext = createContext<HomeContextType | null>(null);

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);

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
