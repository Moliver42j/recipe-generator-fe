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
  const [pantryItems, setPantryItems] = useState<string[]>([]);
  const [pantryItemStatus, setPantryItemStatus] = useState<PantryItemStatus>({});
  const [spices, setSpices] = useState<string[]>([]);
  const [dietaryRequirements, setDietaryRequirements] = useState<string[]>([]);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  useEffect(() => {
    const cachedPantryItems = getFromLocalStorage<string[]>('pantryItems');
    const cachedPantryItemStatus = getFromLocalStorage<PantryItemStatus>('pantryItemStatus');
    const cachedSpices = getFromLocalStorage<string[]>('spices');
    const cachedDietaryRequirements = getFromLocalStorage<string[]>('dietaryRequirements');

    if (cachedPantryItems) {
      setPantryItems(cachedPantryItems);
    }
    if (cachedPantryItemStatus) {
      setPantryItemStatus(cachedPantryItemStatus);
    }
    if (cachedSpices) {
      setSpices(cachedSpices);
    }
    if (cachedDietaryRequirements) {
      setDietaryRequirements(cachedDietaryRequirements);
    }

    setHasLoadedFromStorage(true);
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorage) {
      return;
    }
    saveToLocalStorage('pantryItems', pantryItems);
  }, [hasLoadedFromStorage, pantryItems]);

  useEffect(() => {
    if (!hasLoadedFromStorage) {
      return;
    }
    saveToLocalStorage('pantryItemStatus', pantryItemStatus);
  }, [hasLoadedFromStorage, pantryItemStatus]);

  useEffect(() => {
    if (!hasLoadedFromStorage) {
      return;
    }
    saveToLocalStorage('spices', spices);
  }, [hasLoadedFromStorage, spices]);

  useEffect(() => {
    if (!hasLoadedFromStorage) {
      return;
    }
    saveToLocalStorage('dietaryRequirements', dietaryRequirements);
  }, [dietaryRequirements, hasLoadedFromStorage]);

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
