import { LucideIcon } from "lucide-react"

export type workflowType = {
  number?: number,
  icon: LucideIcon,
  iconColor: "blue" | "orange" | "green",
  title: string,
  description: string
}
