// src/components/ui/use-toast.ts
import * as React from "react"
import { toast as sonner } from "sonner"

export function useToast() {
  return {
    toast: sonner,
  }
}
