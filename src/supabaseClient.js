import { createClient } from "@supabase/supabase-js";

// Leemos las "llaves" desde nuestro archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Creamos el "teléfono" (el cliente)
// y lo "exportamos" para que otros archivos puedan usarlo.
export const supabase = createClient(supabaseUrl, supabaseKey);
