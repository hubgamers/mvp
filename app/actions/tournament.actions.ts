// app/actions/tournament.ts
'use server'

import { createClient } from '@/utils/supabase/server' // ou ton chemin vers le client server

export async function createTournament(formData: FormData) {
  // 1. On attend que le client Supabase soit résolu
  const supabase = await createClient()
  
  const name = formData.get('name') as string
  const game = formData.get('game') as string

  // 2. Maintenant .from() fonctionne correctement
  const { data, error } = await supabase
    .from('tournaments')
    .insert([{ name, game, status: 'DRAFT' }])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}