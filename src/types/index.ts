export interface UserMetrics {
  id: string
  user_id: string
  height_cm: number
  weight_kg: number
  age: number
  gender: 'male' | 'female' | 'other'
  activity_level: 'low' | 'medium' | 'high'
  bmr: number
  tdee: number
  suggested_calories: number
  suggested_protein: number
  suggested_fat: number
  suggested_carbs: number
  recorded_at: string
}

export interface FoodLog {
  id: string
  user_id: string
  image_url: string | null
  food_name: string
  calories: number
  protein: number
  fat: number
  carbohydrates: number
  fiber: number
  sugar: number
  sodium: number
  serving_grams: number
  ai_raw_response: Record<string, unknown> | null
  created_at: string
}

export interface NutritionAnalysis {
  food_name: string
  serving_grams: number
  calories: number
  protein: number
  fat: number
  carbohydrates: number
  fiber: number
  sugar: number
  sodium: number
}

export interface DailyTotals {
  calories: number
  protein: number
  fat: number
  carbohydrates: number
}
