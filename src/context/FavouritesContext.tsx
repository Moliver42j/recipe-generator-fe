import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { Recipe } from '../types';
import { getFromLocalStorage, saveToLocalStorage } from '../utils/storageUtils';

interface FavouritesContextType {
  favourites: Recipe[];
  setFavourites: Dispatch<SetStateAction<Recipe[]>>;
}

const FavouritesContext = createContext<FavouritesContextType | null>(null);

export const FavouritesProvider = ({ children }: { children: ReactNode }) => {
  const [favourites, setFavourites] = useState<Recipe[]>(() => getFromLocalStorage<Recipe[]>('favourites') ?? []);

  useEffect(() => {
    saveToLocalStorage('favourites', favourites);
  }, [favourites]);

  return (
    <FavouritesContext.Provider value={{ favourites, setFavourites }}>
      {children}
    </FavouritesContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useFavourites = () => {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites must be used within a FavouritesProvider');
  }
  return context;
};
