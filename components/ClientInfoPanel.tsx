"use client"

import React, { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { User, Ruler, Calendar, DollarSign } from "@hugeicons/core-free-icons"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Canvas } from "@/lib/types"

interface ClientInfoPanelProps {
  canvas?: Canvas
}

export const ClientInfoPanel: React.FC<ClientInfoPanelProps> = ({ canvas }) => {
  const [clientData, setClientData] = useState({
    name: canvas?.clientName || "",
    email: "",
    phone: "",
    measurements: {
      chest: "",
      waist: "",
      hips: "",
      height: "",
      weight: "",
    },
    preferences: "",
    budget: "",
    deadline: "",
    specialRequirements: "",
    pricing: {
      basePrice: "",
      materialCost: "",
      laborCost: "",
      additionalCharges: "",
      totalCost: "",
    },
  })

  const handleMeasurementChange = (field: string, value: string) => {
    setClientData({
      ...clientData,
      measurements: { ...clientData.measurements, [field]: value },
    })
  }

  const handlePricingChange = (field: string, value: string) => {
    const updatedPricing = { ...clientData.pricing, [field]: value }

    // Auto-calculate total cost
    if (field !== "totalCost") {
      const base = parseFloat(updatedPricing.basePrice) || 0
      const material = parseFloat(updatedPricing.materialCost) || 0
      const labor = parseFloat(updatedPricing.laborCost) || 0
      const additional = parseFloat(updatedPricing.additionalCharges) || 0
      updatedPricing.totalCost = (base + material + labor + additional).toString()
    }

    setClientData({
      ...clientData,
      pricing: updatedPricing,
    })
  }

  return (
    <div className="flex flex-col gap-8 rounded-xl border border-border bg-card/70 p-6 backdrop-blur-sm">
      {/* Personal Information */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-foreground">
          <HugeiconsIcon icon={User} className="mr-2 size-5" />
          Personal Information
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="client-name" className="mb-2 block">
              Full Name
            </Label>
            <Input
              id="client-name"
              value={clientData.name}
              onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
              placeholder="Client's full name"
            />
          </div>
          <div>
            <Label htmlFor="client-email" className="mb-2 block">
              Email
            </Label>
            <Input
              id="client-email"
              type="email"
              value={clientData.email}
              onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
              placeholder="client@example.com"
            />
          </div>
          <div>
            <Label htmlFor="client-phone" className="mb-2 block">
              Phone
            </Label>
            <Input
              id="client-phone"
              type="tel"
              value={clientData.phone}
              onChange={(e) => setClientData({ ...clientData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>
          <div>
            <Label htmlFor="client-budget" className="mb-2 block">
              Budget
            </Label>
            <Input
              id="client-budget"
              value={clientData.budget}
              onChange={(e) => setClientData({ ...clientData, budget: e.target.value })}
              placeholder="$500 - $1000"
            />
          </div>
        </div>
      </div>

      {/* Measurements */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-foreground">
          <HugeiconsIcon icon={Ruler} className="mr-2 size-5" />
          Measurements
        </h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="m-chest" className="mb-2 block">
              Chest (in)
            </Label>
            <Input
              id="m-chest"
              value={clientData.measurements.chest}
              onChange={(e) => handleMeasurementChange("chest", e.target.value)}
              placeholder="36"
            />
          </div>
          <div>
            <Label htmlFor="m-waist" className="mb-2 block">
              Waist (in)
            </Label>
            <Input
              id="m-waist"
              value={clientData.measurements.waist}
              onChange={(e) => handleMeasurementChange("waist", e.target.value)}
              placeholder="32"
            />
          </div>
          <div>
            <Label htmlFor="m-hips" className="mb-2 block">
              Hips (in)
            </Label>
            <Input
              id="m-hips"
              value={clientData.measurements.hips}
              onChange={(e) => handleMeasurementChange("hips", e.target.value)}
              placeholder="38"
            />
          </div>
          <div>
            <Label htmlFor="m-height" className="mb-2 block">
              Height (ft)
            </Label>
            <Input
              id="m-height"
              value={clientData.measurements.height}
              onChange={(e) => handleMeasurementChange("height", e.target.value)}
              placeholder="5'8&quot;"
            />
          </div>
          <div>
            <Label htmlFor="m-weight" className="mb-2 block">
              Weight (lbs)
            </Label>
            <Input
              id="m-weight"
              value={clientData.measurements.weight}
              onChange={(e) => handleMeasurementChange("weight", e.target.value)}
              placeholder="150"
            />
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-foreground">
          <HugeiconsIcon icon={DollarSign} className="mr-2 size-5" />
          Project Pricing
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="p-base" className="mb-2 block">
              Base Price ($)
            </Label>
            <Input
              id="p-base"
              type="number"
              value={clientData.pricing.basePrice}
              onChange={(e) => handlePricingChange("basePrice", e.target.value)}
              placeholder="500"
            />
          </div>
          <div>
            <Label htmlFor="p-material" className="mb-2 block">
              Material Cost ($)
            </Label>
            <Input
              id="p-material"
              type="number"
              value={clientData.pricing.materialCost}
              onChange={(e) => handlePricingChange("materialCost", e.target.value)}
              placeholder="150"
            />
          </div>
          <div>
            <Label htmlFor="p-labor" className="mb-2 block">
              Labor Cost ($)
            </Label>
            <Input
              id="p-labor"
              type="number"
              value={clientData.pricing.laborCost}
              onChange={(e) => handlePricingChange("laborCost", e.target.value)}
              placeholder="200"
            />
          </div>
          <div>
            <Label htmlFor="p-additional" className="mb-2 block">
              Additional Charges ($)
            </Label>
            <Input
              id="p-additional"
              type="number"
              value={clientData.pricing.additionalCharges}
              onChange={(e) => handlePricingChange("additionalCharges", e.target.value)}
              placeholder="50"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="p-total" className="mb-2 block">
              Total Cost ($)
            </Label>
            <Input
              id="p-total"
              value={clientData.pricing.totalCost}
              readOnly
              className="bg-muted text-lg font-semibold"
              placeholder="Total will be calculated automatically"
            />
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div>
        <h3 className="mb-4 flex items-center text-lg font-semibold text-foreground">
          <HugeiconsIcon icon={Calendar} className="mr-2 size-5" />
          Project Details
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="deadline" className="mb-2 block">
              Deadline
            </Label>
            <Input
              id="deadline"
              type="date"
              value={clientData.deadline}
              onChange={(e) => setClientData({ ...clientData, deadline: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="preferences" className="mb-2 block">
              Style Preferences
            </Label>
            <Textarea
              id="preferences"
              value={clientData.preferences}
              onChange={(e) =>
                setClientData({ ...clientData, preferences: e.target.value })
              }
              placeholder="Describe preferred styles, colors, materials..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="special" className="mb-2 block">
              Special Requirements
            </Label>
            <Textarea
              id="special"
              value={clientData.specialRequirements}
              onChange={(e) =>
                setClientData({ ...clientData, specialRequirements: e.target.value })
              }
              placeholder="Any special requirements, allergies, or considerations..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
