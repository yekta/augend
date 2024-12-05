-- Custom SQL migration file, put your code below! --
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- Drop the trigger
DROP TRIGGER IF EXISTS create_main_dashboard_after_user_insert ON public.users;


-- Drop the function
DROP FUNCTION IF EXISTS create_main_dashboard;


-- Create a function to handle the insertion of a main dashboard
CREATE
OR REPLACE FUNCTION create_main_dashboard () RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO dashboards (id, user_id, title, slug, icon, is_main, is_public, created_at, updated_at, deleted_at)
  VALUES (
    uuid_generate_v4(), -- Generate a UUID for the dashboard
    NEW.id,            -- Use the ID of the newly inserted user
    'Main',            -- Default title
    'main',            -- Default slug
    'default',    -- Default icon (replace 'default_icon' as needed)
    TRUE,              -- Set is_main to true
    FALSE,             -- Set is_public to false
    NOW(),             -- Current timestamp for created_at
    NOW(),              -- Current timestamp for updated_at
    NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Create a trigger to call the function after each insert on the users table
CREATE TRIGGER create_main_dashboard_after_user_insert
AFTER INSERT ON public.users FOR EACH ROW
EXECUTE FUNCTION create_main_dashboard ();