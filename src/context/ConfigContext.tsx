import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/storageUtils';

type PantryItemStatus = Record<string, boolean>;

interface ConfigContextType {
  pantryItems: string[];
  setPantryItems: Dispatch<SetStateAction<string[]>>;
  pantryItemStatus: PantryItemStatus;
  setPantryItemStatus: Dispatch<SetStateAction<PantryItemStatus>>;
  spices: string[];
  setSpices: Dispatch<SetStateAction<string[]>>;
  dietaryRequirements: string[];
  setDietaryRequirements: Dispatch<SetStateAction<string[]>>;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export const ConfigProvider = ({ children }: { children: ReactNode }) => {
  const [pantryItems, setPantryItems] = useState<string[]>(
    () => getFromLocalStorage<string[]>('pantryItems') ?? [],
  );
  const [pantryItemStatus, setPantryItemStatus] = useState<PantryItemStatus>(
    () => getFromLocalStorage<PantryItemStatus>('pantryItemStatus') ?? {},
  );
  const [spices, setSpices] = useState<string[]>(
    () => getFromLocalStorage<string[]>('spices') ?? [],
  );
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>(
    () => getFromLocalStorage<string[]>('dietaryRequirements') ?? [],
  );

  useEffect(() => {
    saveToLocalStorage('pantryItems', pantryItems);
  }, [pantryItems]);

  useEffect(() => {
    saveToLocalStorage('pantryItemStatus', pantryItemStatus);
  }, [pantryItemStatus]);

  useEffect(() => {
    saveToLocalStorage('spices', spices);
  }, [spices]);

  useEffect(() => {
    saveToLocalStorage('dietaryRequirements', dietaryRequirements);
  }, [dietaryRequirements]);

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

// eslint-disable-next-line react-refresh/only-export-components
export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
