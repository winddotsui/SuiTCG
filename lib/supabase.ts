import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type Listing = {
  id: string;
  name: string;
  game: string;
  set_name: string;
  card_number: string;
  condition: string;
  price_usd: number;
  price_sui: number;
  description: string;
  image_url: string;
  seller_address: string;
  status: string;
  created_at: string;
};
