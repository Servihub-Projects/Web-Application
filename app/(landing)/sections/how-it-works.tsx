"use client"

import { Calendar, CheckCircle, Flag, Search, UserCheck2Icon } from "lucide-react"
import SectionHeader, { SectionTag, SubTitle, Title } from "../components/section-header"
import Workflow from "../components/workflow"
import { workflowType } from "@/src/types/landing-page-workflow"

const WorkflowProcess: workflowType[] = [
  {
    icon: Search,
    iconColor: "orange",
    title: "Search & Discover",
    description: "Browse verified professionals by service type, location, rating, and availability. Advanced filters help you find the perfect match."
  },
  {
    icon: UserCheck2Icon,
    iconColor: "blue",
    title: "Compare & Select",
    description: "Review detailed profiles with verified credentials, customer ratings, portfolio work, and transparent pricing. Make informed decisions."
  },
  {
    icon: Calendar,
    iconColor: "orange",
    title: "Book & Confirm",
    description: "Select your preferred time slot with real-time availability. Receive instant confirmation with service details and provider contact."
  },
  {
    icon: CheckCircle,
    iconColor: "green",
    title: "Complete & Review",
    description: "Track service progress in real-time. Pay securely upon completion and share your experience to help the community."
  },

]
export default function HowItWorks() {
  return <section>
    <SectionHeader>
      <SectionTag color="blue" text="SIMPLE PROCESS" />
      <Title text="How ServiHub Works" />
      <SubTitle text="Get the help you need in four simple steps. From search to completion, we've streamlined every part of the journey." />
    </SectionHeader>
    <section className="relative grid md:grid-cols-4 gap-12 container mx-auto px-4 before:absolute before:content-['']  lg:before:w-340  before:h-1 before:bg-red-400 before:top-30 before:right-4">
      {WorkflowProcess.map((data, index) => (
        <Workflow key={index} number={index + 1} {...data} />
      ))}
    </section>
  </section>
}
