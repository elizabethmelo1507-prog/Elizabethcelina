
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzosrylmfkjrfbiwopvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56b3NyeWxtZmtqcmZiaXdvcHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjA5MTUsImV4cCI6MjA4NTgzNjkxNX0.N1-NcBwZmmxWERPb3U3tGBfYGqhQ1QJoBEBXKl8jXvc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTempAdmin() {
    console.log('Testing temp admin login...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@elizabeth.com',
        password: 'password123',
    });

    if (error) {
        console.error('Login Error:', error.message);
    } else {
        console.log('Login Successful!');
        console.log('Session User:', data.session?.user?.email);
    }
}

testTempAdmin();
