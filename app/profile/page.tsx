"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { User, ArrowLeft } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const Profile = () => {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState({
    name: "John Smith",
    email: "john@example.com",
    phone: "(555) 123-4567",
    businessName: "Smith Tailoring Co.",
    bio: "Professional tailor with 15 years of experience in custom clothing.",
    address: "123 Fashion St, Design City, DC 12345",
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    // Save profile logic here
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                <HugeiconsIcon icon={ArrowLeft} className="mr-2 size-4" />
                Back
              </Button>
              <h1 className="text-xl font-bold text-foreground">Profile</h1>
            </div>
            <Button onClick={() => (isEditing ? handleSave() : setIsEditing(true))}>
              {isEditing ? "Save Changes" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border bg-card/70 p-8 backdrop-blur-sm">
          <div className="mb-8 flex items-center gap-6">
            <div className="flex size-24 items-center justify-center rounded-full bg-primary">
              <HugeiconsIcon icon={User} className="size-12 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{userProfile.name}</h2>
              <p className="text-muted-foreground">{userProfile.businessName}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <Label htmlFor="name" className="mb-2 block">
                Full Name
              </Label>
              <Input
                id="name"
                value={userProfile.name}
                onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email}
                onChange={(e) => setUserProfile({ ...userProfile, email: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="phone" className="mb-2 block">
                Phone
              </Label>
              <Input
                id="phone"
                value={userProfile.phone}
                onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div>
              <Label htmlFor="businessName" className="mb-2 block">
                Business Name
              </Label>
              <Input
                id="businessName"
                value={userProfile.businessName}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, businessName: e.target.value })
                }
                disabled={!isEditing}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="address" className="mb-2 block">
                Address
              </Label>
              <Input
                id="address"
                value={userProfile.address}
                onChange={(e) => setUserProfile({ ...userProfile, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="bio" className="mb-2 block">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={userProfile.bio}
                onChange={(e) => setUserProfile({ ...userProfile, bio: e.target.value })}
                disabled={!isEditing}
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
