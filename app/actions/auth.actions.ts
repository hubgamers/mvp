'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signup(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: "Veuillez remplir tous les champs." }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function login(prevState: any, formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: "Veuillez remplir tous les champs." }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function getCurrentUserWithProfile() {
  const supabase = await createClient()

  // 1. Récupère l'utilisateur connecté via Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, profile: null, error: "Non authentifié" }
  }

  // 2. Récupère les infos de la table `users` en même temps (ou via l'ID auth)
  const { data: profile, error: profileError } = await supabase
    .from('users') // Remplace par 'profiles' si c'est le nom de ta table
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return { user, profile: null, error: profileError.message }
  }

  return {
    user,
    profile, // Contient toutes tes infos custom (pseudo, rôle, structure_id, etc.)
    error: null,
  }
}