
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nzosrylmfkjrfbiwopvq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56b3NyeWxtZmtqcmZiaXdvcHZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNjA5MTUsImV4cCI6MjA4NTgzNjkxNX0.N1-NcBwZmmxWERPb3U3tGBfYGqhQ1QJoBEBXKl8jXvc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTempAdmin() {
    console.log('Creating temp admin...');
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@elizabeth.com',
        password: 'password123',
    });

    if (error) {
        console.error('Error creating user:', error.message);
    } else {
        console.log('User created:', data.user?.email);
    }
}

createTempAdmin();
