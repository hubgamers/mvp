"use client"

import { useSyncExternalStore } from "react"

const subscribe = () => () => {}
const getCurrentYear = () => new Date().getFullYear()
const getServerYear = () => null

export function CurrentYear() {
  const year = useSyncExternalStore(subscribe, getCurrentYear, getServerYear)
  return year ?? ""
}
