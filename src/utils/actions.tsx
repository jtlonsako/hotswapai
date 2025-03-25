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
    console.log(error)
    // redirect('/error')
    return
  }

  revalidatePath('/', 'layout')
  redirect('/chat')
}

// export async function signup({formData}: {formData: FormData}) {
//   const supabase = await createClient()

//   // type-casting here for convenience
//   // in practice, you should validate your inputs
//   console.log(formData);
//   const data = {
//     email: formData.get('email') as string,
//     password: formData.get('password') as string,
//   }

//   console.log(data)

//   const { error } = await supabase.auth.signUp(data)

//   if (error) {
//     // console.log(error);
//     redirect('/error')
//   }

//   revalidatePath('/', 'layout')
//   redirect('/chat')
// }

export async function signup(formData: {firstname: string, lastname: string, email: string, password: string}) {
  const supabase = await createClient()

  const email = formData.email as string;
  const password = formData.password as string;
  const firstName = formData.firstname;
  const lastName = formData.lastname;

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.email as string,
    password: formData.password as string,
  }

  const { data: {user}, error } = await supabase.auth.signUp({email, password})

  if (error) {
    redirect('/error')
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
    console.error('Error inserting profile:', profileError.message)
    return
  }
  
    console.log('User signed up successfully!')

  revalidatePath('/', 'layout')
  redirect('/')
}