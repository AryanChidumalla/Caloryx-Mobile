import { supabase } from "@/lib/supabase";
import type { SupabaseFood } from "@/types/nutrition";

export type { SupabaseFood };

/**
 * Sanitizes user input for PostgREST .or() filter queries.
 * Strips characters that break PostgREST query syntax or act as unescaped wildcards.
 */
export function sanitizeSearchTerm(rawTerm: string): string {
  return rawTerm
    .replace(/[(),."'\\[\]%_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SEARCH_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const searchCache = new Map<string, { timestamp: number; data: SupabaseFood[] }>();

/**
 * Clears the in-memory food search cache.
 */
export function clearFoodSearchCache(): void {
  searchCache.clear();
}

export async function searchFoods(searchTerm: string): Promise<SupabaseFood[]> {
  const term = sanitizeSearchTerm(searchTerm).toLowerCase();

  if (term.length < 2) {
    return [];
  }

  // Check in-memory cache
  const cached = searchCache.get(term);
  if (cached && Date.now() - cached.timestamp < SEARCH_CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const { data, error } = await supabase
      .from("foods")
      .select("*")
      .or(`name.ilike.%${term}%,aliases.ilike.%${term}%`)
      .order("name", { ascending: true })
      .limit(30);

    if (error) {
      console.warn("Supabase food search warning:", error.message);
      return [];
    }

    const results = data ?? [];
    searchCache.set(term, { timestamp: Date.now(), data: results });
    return results;
  } catch (networkError) {
    console.warn("Network error during food search:", networkError);
    return [];
  }
}

export async function getFoodById(
  foodId: number,
): Promise<SupabaseFood | null> {
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .eq("id", foodId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching food:", error);
    throw error;
  }

  return data;
}
