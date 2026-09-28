import { searchFoods, SupabaseFood } from "@/services/foodService";
import { useCallback, useEffect, useRef, useState } from "react";

export function useFoodSearch() {
  const [foodSearch, setFoodSearch] = useState("");
  const [foodResults, setFoodResults] = useState<SupabaseFood[]>([]);
  const [isSearchingFoods, setIsSearchingFoods] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = useCallback((text: string) => {
    setFoodSearch(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const query = text.trim();

    if (!query) {
      searchRequestIdRef.current += 1;
      setFoodResults([]);
      setIsSearchingFoods(false);
      return;
    }

    setIsSearchingFoods(true);
    const requestId = (searchRequestIdRef.current += 1);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchFoods(query);
        if (searchRequestIdRef.current === requestId) {
          setFoodResults(results);
        }
      } catch (error) {
        if (searchRequestIdRef.current === requestId) {
          console.warn("Food search error in hook:", error);
          setFoodResults([]);
        }
      } finally {
        if (searchRequestIdRef.current === requestId) {
          setIsSearchingFoods(false);
        }
      }
    }, 300);
  }, []);

  const clearSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchRequestIdRef.current += 1;
    setFoodSearch("");
    setFoodResults([]);
    setIsSearchingFoods(false);
  }, []);

  return {
    foodSearch,
    foodResults,
    isSearchingFoods,
    handleSearch,
    clearSearch,
  };
}
