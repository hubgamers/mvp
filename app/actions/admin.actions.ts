"use server"

import { revalidatePath } from "next/cache"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin"

const taskStatuses = ["todo", "in_progress", "done"] as const
const taskPriorities = ["low", "medium", "high"] as const
const crmStatuses = ["new", "lead", "active", "customer", "churned"] as const
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function getString(formData: FormData, key: string, maxLength: number) {
  const value = formData.get(key)
  if (typeof value !== "string") {
    throw new Error(`Le champ ${key} est invalide.`)
  }
  const trimmed = value.trim()
  if (trimmed.length > maxLength) {
    throw new Error(`Le champ ${key} dépasse ${maxLength} caractères.`)
  }
  return trimmed
}

function getTaskId(formData: FormData) {
  const id = getString(formData, "id", 36)
  if (!uuidPattern.test(id)) {
    throw new Error("Identifiant de tâche invalide.")
  }
  return id
}

function refreshAdminPages() {
  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/admin/tasks")
  revalidatePath("/dashboard/admin/crm")
  revalidatePath("/dashboard/admin/subscriptions")
}

export async function createAdminTask(formData: FormData) {
  await requireAdmin()

  const title = getString(formData, "title", 160)
  const description = getString(formData, "description", 2000)
  const priority = getString(formData, "priority", 10)
  const dueDate = getString(formData, "due_date", 10)

  if (!title) {
    throw new Error("Le titre de la tâche est obligatoire.")
  }
  if (!taskPriorities.includes(priority as (typeof taskPriorities)[number])) {
    throw new Error("Priorité de tâche invalide.")
  }
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    throw new Error("La date d'échéance est invalide.")
  }

  await prisma.$executeRaw`
    INSERT INTO admin.tasks (title, description, priority, due_date)
    VALUES (${title}, ${description || null}, ${priority}, ${dueDate || null}::date)
  `
  refreshAdminPages()
}

export async function updateAdminTaskStatus(formData: FormData) {
  await requireAdmin()
  const id = getTaskId(formData)
  const status = getString(formData, "status", 20)
  if (!taskStatuses.includes(status as (typeof taskStatuses)[number])) {
    throw new Error("Statut de tâche invalide.")
  }

  const updated = await prisma.$executeRaw`
    UPDATE admin.tasks
    SET status = ${status}, updated_at = now()
    WHERE id = ${id}::uuid
  `
  if (updated !== 1) {
    throw new Error("La tâche demandée est introuvable.")
  }
  refreshAdminPages()
}

export async function deleteAdminTask(formData: FormData) {
  await requireAdmin()
  const id = getTaskId(formData)
  const deleted = await prisma.$executeRaw`
    DELETE FROM admin.tasks
    WHERE id = ${id}::uuid
  `
  if (deleted !== 1) {
    throw new Error("La tâche demandée est introuvable.")
  }
  refreshAdminPages()
}

export async function updateCrmContact(formData: FormData) {
  await requireAdmin()
  const userId = getString(formData, "user_id", 36)
  const status = getString(formData, "status", 20)
  const notes = getString(formData, "notes", 2000)

  if (!uuidPattern.test(userId)) {
    throw new Error("Identifiant d'utilisateur invalide.")
  }
  if (!crmStatuses.includes(status as (typeof crmStatuses)[number])) {
    throw new Error("Statut CRM invalide.")
  }

  const userExists = await prisma.users.count({ where: { id: userId } })
  if (!userExists) {
    throw new Error("L'utilisateur demandé est introuvable.")
  }

  await prisma.$executeRaw`
    INSERT INTO admin.crm_contacts (user_id, status, notes, updated_at)
    VALUES (${userId}::uuid, ${status}, ${notes || null}, now())
    ON CONFLICT (user_id)
    DO UPDATE SET status = EXCLUDED.status, notes = EXCLUDED.notes, updated_at = now()
  `
  refreshAdminPages()
}

export async function updateAdminStripeSubscription(formData: FormData) {
  await requireAdmin()

  const subscriptionId = getString(formData, "subscription_id", 255)
  const action = getString(formData, "action", 20)
  if (!/^sub_[A-Za-z0-9]+$/.test(subscriptionId)) {
    throw new Error("Identifiant d'abonnement Stripe invalide.")
  }
  if (action !== "schedule_cancel" && action !== "resume") {
    throw new Error("Action d'abonnement invalide.")
  }

  const localSubscription = await prisma.stripe_subscriptions.findUnique({
    where: { stripe_subscription_id: subscriptionId },
  })
  if (!localSubscription || !localSubscription.is_current) {
    throw new Error("L'abonnement actif demandé est introuvable.")
  }
  if (!["active", "trialing", "past_due"].includes(localSubscription.status)) {
    throw new Error("Cet abonnement ne peut plus être modifié.")
  }
  if (
    !localSubscription.stripe_metadata ||
    typeof localSubscription.stripe_metadata !== "object" ||
    !("platform" in localSubscription.stripe_metadata) ||
    localSubscription.stripe_metadata.platform !== "hubgamers"
  ) {
    throw new Error("Cet abonnement n'appartient pas à HubGamers.")
  }

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY manquant.")
  }

  const stripe = new Stripe(secretKey)
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: action === "schedule_cancel",
  })
  const item = subscription.items.data[0]
  const isCurrent = !["canceled", "incomplete_expired"].includes(subscription.status)

  await prisma.stripe_subscriptions.update({
    where: { id: localSubscription.id },
    data: {
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000)
        : null,
      current_period_start: item?.current_period_start
        ? new Date(item.current_period_start * 1000)
        : null,
      current_period_end: item?.current_period_end
        ? new Date(item.current_period_end * 1000)
        : null,
      is_current: isCurrent,
    },
  })

  revalidatePath("/dashboard/admin")
  revalidatePath("/dashboard/admin/subscriptions")
  revalidatePath("/dashboard/billing")
}
