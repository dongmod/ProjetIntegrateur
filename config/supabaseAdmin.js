// This file is used to create a Supabase client with the service role key, 
// which allows us to perform admin operations on the database.

import { createClient } from "@supabase/supabase-js";
import { auto } from "async";
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY


if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL env variable'); 
if (!SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY env variable');  

export const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, 
    {auth:{persistSession: false,autoRefreshToken:false}}
    );

export default supabaseAdmin;