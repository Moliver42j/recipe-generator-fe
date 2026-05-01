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

interface HomeContextType {
  ingredients: string[];
  setIngredients: Dispatch<SetStateAction<string[]>>;
}

const HomeContext = createContext<HomeContextType | null>(null);

export const HomeProvider = ({ children }: { children: ReactNode }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);

  useEffect(() => {
    const cachedIngredients = getFromLocalStorage<string[]>('ingredients');
    if (cachedIngredients) {
      setIngredients(cachedIngredients);
    }
  }, []);

  useEffect(() => {
    if (ingredients.length > 0) {
      saveToLocalStorage('ingredients', ingredients);
    }
  }, [ingredients]);

  return <HomeContext.Provider value={{ ingredients, setIngredients }}>{children}</HomeContext.Provider>;
};

export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};
