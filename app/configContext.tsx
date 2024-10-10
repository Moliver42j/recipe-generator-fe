import { createContext, useState, ReactNode, useContext } from 'react';

interface ConfigContextType {
  pantryItems: string[]; // List of all pantry items
  setPantryItems: React.Dispatch<React.SetStateAction<string[]>>;
  pantryItemStatus: { [key: string]: boolean }; // Checkbox status for each pantry item
  setPantryItemStatus: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  spices: string[];
  setSpices: React.Dispatch<React.SetStateAction<string[]>>;
  dietaryRequirements: string[];
  setDietaryRequirements: React.Dispatch<React.SetStateAction<string[]>>;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [pantryItemStatus, setPantryItemStatus] = useState<{ [key: string]: boolean }>({});
  const [spices, setSpices] = useState<string[]>([]);
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);

  return (
    <ConfigContext.Provider
      value={{
        pantryItems,
        setPantryItems,
        pantryItemStatus,
        setPantryItemStatus,
        spices,
        setSpices,
        dietaryRequirements,
        setDietaryRequirements,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
