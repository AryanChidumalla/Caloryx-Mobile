import { supabase } from "@/lib/supabase";

export type SupabaseFood = {
  id: number;
  name: string;
  hindi_name: string | null;
  aliases: string[] | string | null;
  category: string | null;
  sub_category: string | null;
  serving_basis: string | null;
  default_serving_unit: string | null;
  default_serving_weight_g: number | null;
  calories_per_100g: number | null;
  carbs_per_100g: number | null;
  protein_per_100g: number | null;
  fat_per_100g: number | null;
  fiber_per_100g: number | null;
  calories_per_serving: number | null;
  carbs_per_serving: number | null;
  protein_per_serving: number | null;
  fat_per_serving: number | null;
  fiber_per_serving: number | null;
  verification_status: string | null;
  variability_notes: string | null;
  data_source: string | null;
};

export async function searchFoods(searchTerm: string): Promise<SupabaseFood[]> {
  const term = searchTerm.trim();

  if (!term) {
    return [];
  }

  const { data, error } = await supabase
    .from("foods")
    .select("*")
    .or(`name.ilike.%${term}%,hindi_name.ilike.%${term}%`)
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
