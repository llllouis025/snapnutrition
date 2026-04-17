-- 1. profiles table (triggered by new auth user)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. user_metrics table
CREATE TABLE public.user_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  height_cm NUMERIC(5,1),
  weight_kg NUMERIC(5,1),
  age INT,
  gender TEXT CHECK (gender IN ('male','female','other')),
  activity_level TEXT CHECK (activity_level IN ('low','medium','high')),
  bmr INT,
  tdee INT,
  suggested_calories INT,
  suggested_protein INT,
  suggested_fat INT,
  suggested_carbs INT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own metrics" ON public.user_metrics
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. food_log table
CREATE TABLE public.food_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT,
  food_name TEXT,
  calories NUMERIC(7,1),
  protein NUMERIC(6,1),
  fat NUMERIC(6,1),
  carbohydrates NUMERIC(6,1),
  fiber NUMERIC(6,1),
  sugar NUMERIC(6,1),
  sodium NUMERIC(6,1),
  serving_grams NUMERIC(6,1),
  ai_raw_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.food_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own food logs" ON public.food_log
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Supabase Storage bucket for food images
INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Users can upload own food images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Food images are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'food-images');

CREATE POLICY "Users can delete own food images" ON storage.objects
  FOR DELETE USING (bucket_id = 'food-images' AND auth.uid()::text = (storage.foldername(name))[1]);
