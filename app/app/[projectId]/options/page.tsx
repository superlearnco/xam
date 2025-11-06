"use client"

import { useState } from "react"
import { ChevronLeft, Copy, Check, QrCode } from "lucide-react"
import { AppNavbar } from "@/components/app-navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function OptionsPage() {
  const params = useParams()
  const [activeTab, setActiveTab] = useState("general")
  const [copied, setCopied] = useState(false)
  const testLink = `https://xam.app/test/${params.projectId}`

  const handleCopy = () => {
    navigator.clipboard.writeText(testLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="border-b border-border bg-background sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/app">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>My Tests</span>
                <span>/</span>
                <span className="text-foreground font-medium">Biology Midterm Exam</span>
              </div>
            </div>

            <Button size="sm" className="gap-2">
              Publish
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Link href={`/app/${params.projectId}/edit`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Edit
              </button>
            </Link>
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">Options</button>
            <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
              Preview
            </button>
            <Link href={`/app/${params.projectId}/mark`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Mark
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-5xl">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-1 sticky top-24">
              {["general", "access", "grading", "notifications"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === "general" && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Test Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-name">Test Name</Label>
                      <Input id="test-name" defaultValue="Biology Midterm Exam" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" className="mt-2" rows={3} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input id="duration" type="number" defaultValue="45" className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="attempts">Max Attempts</Label>
                        <Input id="attempts" type="number" defaultValue="1" className="mt-2" />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Share Test</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Test Link</Label>
                      <div className="flex gap-2 mt-2">
                        <Input value={testLink} readOnly className="flex-1" />
                        <Button onClick={handleCopy} variant="outline" className="gap-2 bg-transparent">
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="gap-2 bg-transparent">
                      <QrCode className="w-4 h-4" />
                      Generate QR Code
                    </Button>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "access" && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Account Sign-in</Label>
                        <p className="text-sm text-muted-foreground">Students must log in to take the test</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Verification</Label>
                        <p className="text-sm text-muted-foreground">Verify student email addresses</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Password Protection</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Password</Label>
                      <Switch />
                    </div>
                    <div>
                      <Label htmlFor="password">Test Password</Label>
                      <Input id="password" type="password" placeholder="Enter password" className="mt-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Browser Restrictions</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Disable Copy/Paste</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Full-screen Mode Required</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Block Tab Switching</Label>
                      <Switch />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "grading" && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Marking Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-grade Where Possible</Label>
                        <p className="text-sm text-muted-foreground">Automatically grade multiple choice questions</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable AI Marking</Label>
                        <p className="text-sm text-muted-foreground">
                          AI grades open-ended responses (~5 credits per submission)
                        </p>
                      </div>
                      <Switch />
                    </div>
                    <div>
                      <Label htmlFor="passing-grade">Passing Grade (%)</Label>
                      <Input id="passing-grade" type="number" defaultValue="60" className="mt-2" />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Feedback Options</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Instant Feedback</Label>
                        <p className="text-sm text-muted-foreground">Show results immediately after submission</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Answer Key</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Display Detailed Explanations</Label>
                      <Switch />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Teacher Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Email on Submission</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Daily Summary Report</Label>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Notify When All Marked</Label>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Student Notifications</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Submission Confirmation</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Grade Release Notification</Label>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Deadline Reminders</Label>
                      <Switch />
                    </div>
                  </div>
                </Card>
              </>
            )}

            <div className="flex justify-end">
              <Button size="lg">Save Changes</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
