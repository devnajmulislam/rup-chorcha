import type { SalonCategory } from "@/lib/constants"

export type DemoService = {
  id: string
  serviceName: string
  category: SalonCategory
  description: string
  price: number
  duration: number
  image: string
}

export const demoServices: DemoService[] = [
  {
    id: "signature-cut",
    serviceName: "Signature Cut & Finish",
    category: "Haircut & Styling",
    description:
      "A considered consultation, precision cut, and polished finish shaped around your everyday rhythm.",
    price: 4500,
    duration: 60,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "luminous-color",
    serviceName: "Luminous Color",
    category: "Hair Coloring",
    description:
      "Dimensional color with a soft, lived-in feel, tailored to your tone and maintained with care.",
    price: 12000,
    duration: 120,
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "silk-repair",
    serviceName: "Silk Repair Ritual",
    category: "Hair Treatment",
    description:
      "A restoring treatment for tired hair, finished with a slow scalp massage and a weightless shine.",
    price: 7500,
    duration: 75,
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "rose-quartz-facial",
    serviceName: "Rose Quartz Facial",
    category: "Facial & Skincare",
    description:
      "A calm, glow-focused facial with gentle exfoliation, hydration, and a restorative facial massage.",
    price: 9500,
    duration: 60,
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "soft-glam",
    serviceName: "Soft Glam Makeup",
    category: "Makeup",
    description:
      "An elevated, skin-first look for celebrations, photographs, or an evening that deserves a little more.",
    price: 8000,
    duration: 60,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "sculpted-manicure",
    serviceName: "Sculpted Manicure",
    category: "Manicure & Pedicure",
    description:
      "Detailed nail shaping, cuticle care, and a flawless finish in the shade that feels most like you.",
    price: 5500,
    duration: 60,
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
  },
]
