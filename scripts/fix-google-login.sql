-- Drop existing trigger to avoid conflicts
drop trigger if exists on_auth_user_created on auth.users;

-- Recreate the function with better error handling and conflict resolution
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, avatar, verified)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'user'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    true -- Auto-verify social logins
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    avatar = excluded.avatar,
    updated_at = now();
    
  return new;
exception
  when others then
    -- Log error but don't fail the transaction, allowing the user to be created in auth.users
    -- The profile can be created later by the app if needed
    raise warning 'Error in handle_new_user: %', SQLERRM;
    return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Ensure RLS allows the trigger (Security Definer bypasses RLS, but let's be safe for client-side inserts if any)
-- These might already exist, but running them assumes idempotent policy creation or we just add if not exists logic implicitly by not erroring hard?
-- Actually, simple policies are better not to duplicate blindly. 
-- The "Security Definer" on the function is the key fix here.
