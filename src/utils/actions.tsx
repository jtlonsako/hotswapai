'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

export async function login(formData: {email: string, password: string}) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email,
    password: formData.password,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.error(error);
    return {
      success: false,
      error: error.message
    }
  }

  revalidatePath('/', 'layout')
  redirect('/chat')
  
  // This will only run if redirect() fails for some reason
  return { success: true }
}


export async function signup(formData: {firstname: string, lastname: string, email: string, password: string}) {
  try {
    const supabase = await createClient()

    const email = formData.email as string;
    const password = formData.password as string;
    const firstName = formData.firstname;
    const lastName = formData.lastname;

    const { data: {user}, error } = await supabase.auth.signUp({email, password})

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    //Insert the user's first and last name into the profiles table
    const userId = user?.id
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: userId, // Use the user's ID from Supabase Auth
        first_name: firstName,
        last_name: lastName,
      },
    ])
    
    if (profileError) {
      // Try to clean up the auth user if profile creation fails
      try {
        await supabase.auth.admin.deleteUser(userId!);
      } catch (deleteError) {
        console.error('Failed to delete user after profile creation error:', deleteError);
      }
      
      return {
        success: false,
        error: profileError.message
      }
    }
    
    console.log('User signed up successfully!')
    
    // Don't redirect, just return success
    return { success: true }
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred during signup'
    }
  }
}