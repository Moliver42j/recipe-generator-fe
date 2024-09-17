import { createContext, useState, ReactNode, useContext } from 'react';

// Define the type for the context data
interface ConfigContextType {
  pantryItems: string[];
  setPantryItems: React.Dispatch<React.SetStateAction<string[]>>;
  spices: string[];
  setSpices: React.Dispatch<React.SetStateAction<string[]>>;
  dietaryRequirements: string[];
  setDietaryRequirements: React.Dispatch<React.SetStateAction<string[]>>;
}

// Create context with the proper type
const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [spices, setSpices] = useState<string[]>([]);
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);

  return (
    <ConfigContext.Provider value={{ pantryItems, setPantryItems, spices, setSpices, dietaryRequirements, setDietaryRequirements }}>
      {children}
    </ConfigContext.Provider>
  );
};

// Hook to use configuration data in any component
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
