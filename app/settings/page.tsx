"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  User,
  Bell,
  Lock,
  Globe,
  Shield,
  HelpCircle,
  FileText,
  LogOut,
  ChevronRight,
  Moon,
  Smartphone,
  Mail,
  MapPin,
  Eye,
  Crown,
  Check,
  Loader2,
  Save,
} from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { updateUserPreferences, updateUserProfile, updateUserPassword } from "@/lib/auth"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [locationSharing, setLocationSharing] = useState(true)
  const [language, setLanguage] = useState("en")

  // Dialog states
  const [personalInfoDialog, setPersonalInfoDialog] = useState(false)
  const [passwordDialog, setPasswordDialog] = useState(false)
  const [privacyDialog, setPrivacyDialog] = useState(false)
  const [languageDialog, setLanguageDialog] = useState(false)
  const [helpDialog, setHelpDialog] = useState(false)
  const [termsDialog, setTermsDialog] = useState(false)

  // Form states
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [profileVisibility, setProfileVisibility] = useState("public")

  // Loading states
  const [isSaving, setIsSaving] = useState(false)

  const { user, logout, updateUser, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)

      // Load saved preferences from profile first, fallback to localStorage
      if (user.preferences) {
        setNotifications(user.preferences.notifications ?? true)
        setPushNotifications(user.preferences.pushNotifications ?? true)
        setEmailNotifications(user.preferences.emailNotifications ?? false)
        setLocationSharing(user.preferences.locationSharing ?? true)
        setLanguage(user.preferences.language ?? "en")
        setProfileVisibility(user.preferences.profileVisibility ?? "public")
        setTwoFactorEnabled(user.preferences.twoFactorEnabled ?? false)
        setPhone(user.preferences.phone ?? "")
      } else {
        const savedPrefs = localStorage.getItem(`user_preferences_${user.id}`)
        if (savedPrefs) {
          const prefs = JSON.parse(savedPrefs)
          setNotifications(prefs.notifications ?? true)
          setPushNotifications(prefs.pushNotifications ?? true)
          setEmailNotifications(prefs.emailNotifications ?? false)
          setLocationSharing(prefs.locationSharing ?? true)
          setLanguage(prefs.language ?? "en")
          setProfileVisibility(prefs.profileVisibility ?? "public")
          setTwoFactorEnabled(prefs.twoFactorEnabled ?? false)
          setPhone(prefs.phone ?? "")
        }
      }
    }
  }, [user])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#5B4B9E]/20 border-t-[#5B4B9E]" />
          </div>
          <p className="text-sm text-[#5B4B9E] font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  const savePreferences = async () => {
    if (!user) return
    const preferences = {
      notifications,
      pushNotifications,
      emailNotifications,
      locationSharing,
      language,
      profileVisibility,
      twoFactorEnabled,
      phone,
    }

    // Save to LocalStorage (as backup/instant)
    localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(preferences))

    // Save to Supabase via Auth Library
    try {
      await updateUserPreferences(user.id, preferences)
    } catch (e) {
      console.error("Failed to sync preferences to cloud:", e)
    }
  }

  const handleNotificationToggle = (value: boolean) => {
    setNotifications(value)
    if (!value) {
      setPushNotifications(false)
      setEmailNotifications(false)
    }
    setTimeout(savePreferences, 100)
    toast({
      title: "Notifications Updated",
      description: value ? "Notifications enabled" : "Notifications disabled",
    })
  }

  const handlePushToggle = (value: boolean) => {
    setPushNotifications(value)
    setTimeout(savePreferences, 100)
    toast({
      title: "Push Notifications",
      description: value ? "Push notifications enabled" : "Push notifications disabled",
    })
  }

  const handleEmailToggle = (value: boolean) => {
    setEmailNotifications(value)
    setTimeout(savePreferences, 100)
    toast({
      title: "Email Notifications",
      description: value ? "Email notifications enabled" : "Email notifications disabled",
    })
  }

  const handleLocationToggle = (value: boolean) => {
    setLocationSharing(value)
    setTimeout(savePreferences, 100)
    toast({
      title: "Location Sharing",
      description: value ? "Location sharing enabled" : "Location sharing disabled",
    })
  }

  const handleDarkModeToggle = (value: boolean) => {
    setTheme(value ? "dark" : "light")
    toast({
      title: "Theme Updated",
      description: value ? "Dark mode enabled" : "Light mode enabled",
    })
  }

  const handleUpdatePersonalInfo = async () => {
    setIsSaving(true)
    try {
      if (!user) return;

      // Update Profile (Name, Email)
      await updateUserProfile(user.id, { name, email })

      // Update Context
      if (updateUser) {
        updateUser({ name, email })
      }

      // Update Preferences (Phone)
      await savePreferences()

      toast({
        title: "Profile Updated",
        description: "Your personal information has been updated successfully",
      })
      setPersonalInfoDialog(false)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return;
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "New password and confirmation do not match",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      await updateUserPassword(user.id, newPassword)

      toast({
        title: "Password Changed",
        description: "Your password has been updated successfully",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordDialog(false)
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePrivacy = () => {
    savePreferences()
    toast({
      title: "Privacy Updated",
      description: "Your privacy settings have been saved",
    })
    setPrivacyDialog(false)
  }

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)

    // Apply immediate DOM changes
    if (typeof document !== 'undefined') {
      const dir = newLanguage === 'ar' ? 'rtl' : 'ltr'
      document.documentElement.dir = dir
      document.documentElement.lang = newLanguage
    }

    savePreferences()

    toast({
      title: "Language Changed",
      description: `Language set to ${newLanguage === "en" ? "English" : newLanguage === "ar" ? "العربية" : "Other"}`,
    })
    setLanguageDialog(false)
  }

  const handle2FAToggle = (value: boolean) => {
    setTwoFactorEnabled(value)
    setTimeout(() => {
      // Need to pass updated value because state might not be flushed yet in closure if using variable from scope? 
      // Actually savePreferences uses state variables. 
      // Better to pass the override to savePreferences or update state then save.
      // We will update state first (done above), then call savePreferences.
      // Creating a wrapper for savePreferences that accepts overrides would be cleaner, but simple timeout often works if setState is fast enough.
      // BUT, savePreferences captures closure 'notifications', 'twoFactorEnabled', etc. from Render scope?
      // Wait, 'savePreferences' is declared in the component body, so it captures state from THAT render.
      // If we call it in timeout, it might capture OLD state if dependencies aren't updated?
      // Actually savePreferences DOES NOT have user as dependency in the useCallback? It's not a useCallback.
      // It's a function recreated every render.
      // So setTimeout(savePreferences, 100) will call the OLD function from THIS render frame, which has OLD state?
      // NO. setTwoFactorEnabled triggers re-render. 
      // The setTimeout callback is defined in THIS render.
      // If we want to save the NEW value, we should update the preference object passed to save logic directly.
      // Or simpler: Just rely on useEffect to save when state changes? No, that causes loops if not careful.
      // Let's modify savePreferences to accept partial updates or manually construct the object here.

      if (!user) return
      const preferences = {
        notifications,
        pushNotifications,
        emailNotifications,
        locationSharing,
        language,
        profileVisibility,
        twoFactorEnabled: value, // Use the new value explicitly
        phone,
      }
      localStorage.setItem(`user_preferences_${user.id}`, JSON.stringify(preferences))
      updateUserPreferences(user.id, preferences).catch(console.error)
    }, 0)

    toast({
      title: "Security Updated",
      description: value ? "2FA Enabled" : "2FA Disabled",
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-[#312E81] sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-white/10 rounded-full">
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
              <p className="text-sm text-white/60">Manage your preferences</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 pb-24 space-y-4">
        {/* Account Settings */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Account</h2>
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-0">
              <button
                onClick={() => setPersonalInfoDialog(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Personal Information</p>
                    <p className="text-xs text-muted-foreground">Name, email, phone</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </button>

              <div className="border-t border-border" />

              <Link href="/subscription">
                <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                      <Crown className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Subscription</p>
                      <p className="text-xs text-muted-foreground">Upgrade to premium</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
                </div>
              </Link>

              <div className="border-t border-border" />

              <button
                onClick={() => setPasswordDialog(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-green-600 dark:text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Password & Security</p>
                    <p className="text-xs text-muted-foreground">Change password, 2FA</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </button>

              <div className="border-t border-border" />

              <button
                onClick={() => setPrivacyDialog(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Privacy</p>
                    <p className="text-xs text-muted-foreground">Who can see your profile</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            Notifications
          </h2>
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">All Notifications</p>
                    <p className="text-xs text-muted-foreground">Enable all notifications</p>
                  </div>
                </div>
                <Switch checked={notifications} onCheckedChange={handleNotificationToggle} />
              </div>

              <div className="border-t border-border" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-red-600 dark:text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Push Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive push alerts</p>
                  </div>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={handlePushToggle} />
              </div>

              <div className="border-t border-border" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Get updates via email</p>
                  </div>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={handleEmailToggle} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preferences */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Preferences</h2>
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Moon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Toggle dark theme</p>
                  </div>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={handleDarkModeToggle} />
              </div>

              <div className="border-t border-border" />

              <button
                onClick={() => setLanguageDialog(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Language</p>
                    <p className="text-xs text-muted-foreground">
                      {language === "en" ? "English" : language === "ar" ? "العربية" : "Other"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </button>

              <div className="border-t border-border" />

              <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Location Sharing</p>
                    <p className="text-xs text-muted-foreground">Share your location</p>
                  </div>
                </div>
                <Switch checked={locationSharing} onCheckedChange={handleLocationToggle} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Support & Legal */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">Support</h2>
          <Card className="border shadow-sm bg-card">
            <CardContent className="p-0">
              <button
                onClick={() => setHelpDialog(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Help Center</p>
                    <p className="text-xs text-muted-foreground">FAQs and support</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </button>

              <div className="border-t border-border" />

              <button
                onClick={() => setTermsDialog(true)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Terms & Privacy</p>
                    <p className="text-xs text-muted-foreground">Legal information</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50" />
              </button>

              <div className="border-t border-border" />

              <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">About PiAds</p>
                    <p className="text-xs text-muted-foreground">Version 1.0.0</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                  v1.0
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout */}
        <Card className="border shadow-sm bg-card">
          <CardContent className="p-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600 dark:text-red-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-red-600 dark:text-red-500">Sign Out</p>
                  <p className="text-xs text-muted-foreground">Sign out from your account</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={personalInfoDialog} onOpenChange={setPersonalInfoDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Personal Information</DialogTitle>
            <DialogDescription>Update your personal details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
                className="bg-background border-input"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPersonalInfoDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePersonalInfo} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Password & Security</DialogTitle>
            <DialogDescription>Change your password and manage security settings</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="bg-background border-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="bg-background border-input"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground">Add extra security</p>
              </div>
              <Switch checked={twoFactorEnabled} onCheckedChange={handle2FAToggle} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyDialog} onOpenChange={setPrivacyDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Privacy Settings</DialogTitle>
            <DialogDescription>Control who can see your information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Visibility</Label>
              <Select value={profileVisibility} onValueChange={setProfileVisibility}>
                <SelectTrigger className="bg-background border-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Everyone can see</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private - Only me</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Show Email</p>
                  <p className="text-xs text-muted-foreground">Display email on profile</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Show Phone</p>
                  <p className="text-xs text-muted-foreground">Display phone on profile</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium">Show Activity</p>
                  <p className="text-xs text-muted-foreground">Show when you're online</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleUpdatePrivacy} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Save Privacy Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={languageDialog} onOpenChange={setLanguageDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Language</DialogTitle>
            <DialogDescription>Choose your preferred language</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${language === "en" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">EN</span>
                </div>
                <span className="font-medium">English</span>
              </div>
              {language === "en" && <Check className="w-5 h-5 text-primary" />}
            </button>

            <button
              onClick={() => handleLanguageChange("ar")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${language === "ar" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-600">AR</span>
                </div>
                <span className="font-medium">العربية</span>
              </div>
              {language === "ar" && <Check className="w-5 h-5 text-primary" />}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={helpDialog} onOpenChange={setHelpDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Help Center</DialogTitle>
            <DialogDescription>Frequently asked questions and support</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">How do I post an ad?</h3>
                <p className="text-sm text-muted-foreground">
                  Click the "Post Ad" button on the home page, fill in the details, select a category and region, then
                  submit.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">How does payment work?</h3>
                <p className="text-sm text-muted-foreground">
                  We use Pi Network SDK for secure payments. All transactions are processed through Pi Network and
                  arrive directly to your wallet.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">What are featured ads?</h3>
                <p className="text-sm text-muted-foreground">
                  Featured ads appear at the top of listings and get more visibility. You can promote your ad for 1π per
                  day.
                </p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">How do I contact support?</h3>
                <p className="text-sm text-muted-foreground">
                  Email us at support@piads.com or send a message through the Messages section.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={termsDialog} onOpenChange={setTermsDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Terms & Privacy Policy</DialogTitle>
            <DialogDescription>Last updated: January 2025</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Terms of Service</h3>
              <p className="text-muted-foreground mb-2">
                By using PiAds, you agree to our terms of service. You must be at least 18 years old to use this
                platform.
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All ads must be accurate and not misleading</li>
                <li>No illegal content or services allowed</li>
                <li>Respect other users and maintain professional conduct</li>
                <li>Payment disputes will be handled according to Pi Network policies</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Privacy Policy</h3>
              <p className="text-muted-foreground mb-2">
                We take your privacy seriously. Here's how we handle your data:
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>We collect only necessary information to provide our services</li>
                <li>Your Pi Network data is processed according to Pi Network privacy policy</li>
                <li>We do not sell your personal information to third parties</li>
                <li>You can request data deletion at any time</li>
                <li>We use cookies to improve user experience</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
