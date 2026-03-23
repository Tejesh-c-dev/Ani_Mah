"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bucketName = exports.supabase = void 0;
// Supabase client initialization
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase credentials in environment variables");
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
exports.bucketName = process.env.SUPABASE_BUCKET_NAME || "animah-uploads";
//# sourceMappingURL=supabase.js.map