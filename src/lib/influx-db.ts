import {createClient, type SupabaseClient} from "@supabase/supabase-js";
let client:SupabaseClient|null=null;
export function influxDb():SupabaseClient{
 const url=process.env.INFLUX_SUPABASE_URL;
 const key=process.env.INFLUX_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key) throw new Error("Banco de inscrições não configurado.");
 if(!client)client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 return client;
}
