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
  const [ingredients, setIngredients] = useState<string[]>(() => getFromLocalStorage<string[]>('ingredients') ?? []);

  useEffect(() => {
    saveToLocalStorage('ingredients', ingredients);
  }, [ingredients]);

  return <HomeContext.Provider value={{ ingredients, setIngredients }}>{children}</HomeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useHome = () => {
  const context = useContext(HomeContext);
  if (!context) {
    throw new Error('useHome must be used within a HomeProvider');
  }
  return context;
};
