import { supabase } from "@/lib/supabase";

export type SupabaseFood = {
  id: number;
  name: string;
  aliases: string | null;
  category: string | null;
  default_serving_unit: string | null;
  default_serving_weight_g: number | null;
  calories_per_serving: number | null;
  carbs_per_serving: number | null;
  protein_per_serving: number | null;
  fat_per_serving: number | null;
  fiber_per_serving: number | null;
};

export async function searchFoods(searchTerm: string): Promise<SupabaseFood[]> {
  const term = searchTerm.trim();

  if (!term) {
    return [];
  }

  // Updated to search 'name' or 'aliases' instead of 'hindi_name'
  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.%${term}%,aliases.ilike.%${term}%`)
    .order("name", { ascending: true })
    .limit(30);

  if (error) {
    console.error("Error searching foods:", error);
    throw error;
  }

  return data ?? [];
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
