"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Copy,
  Check,
  QrCode,
  Download,
  Eye,
  Share2,
  Loader2,
} from "lucide-react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import QRCode from "qrcode";

export default function OptionsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const projectId = params.projectId as Id<"projects">;

  const [activeTab, setActiveTab] = useState("general");
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load project data
  const project = useQuery(api.projects.getProject, { projectId });
  const updateProject = useMutation(api.projects.updateProject);
  const updateSettings = useMutation(api.projects.updateProjectSettings);
  const updateStatus = useMutation(api.projects.updateProjectStatus);

  // Local state for settings
  const [settings, setSettings] = useState({
    duration: undefined as number | undefined,
    maxAttempts: 1,
    passingGrade: 70,
    requireAuth: false,
    requireEmailVerification: false,
    passwordProtected: false,
    password: undefined as string | undefined,
    disableCopyPaste: false,
    fullScreenRequired: false,
    blockTabSwitching: false,
    autoGrade: true,
    enableAIMarking: false,
    instantFeedback: false,
    showAnswerKey: false,
    showExplanations: false,
    notifyTeacherOnSubmission: true,
    notifyTeacherDailySummary: false,
    notifyTeacherWhenMarked: false,
    notifyStudentOnSubmission: true,
    notifyStudentOnGradeRelease: true,
    notifyStudentDeadlineReminders: false,
  });

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  // Initialize state when project loads
  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectDescription(project.description || "");
      setSettings({
        duration: project.settings.duration,
        maxAttempts: project.settings.maxAttempts || 1,
        passingGrade: project.settings.passingGrade || 70,
        requireAuth: project.settings.requireAuth || false,
        requireEmailVerification:
          project.settings.requireEmailVerification || false,
        passwordProtected: project.settings.passwordProtected || false,
        password: project.settings.password,
        disableCopyPaste: project.settings.disableCopyPaste || false,
        fullScreenRequired: project.settings.fullScreenRequired || false,
        blockTabSwitching: project.settings.blockTabSwitching || false,
        autoGrade: project.settings.autoGrade !== false,
        enableAIMarking: project.settings.enableAIMarking || false,
        instantFeedback: project.settings.instantFeedback || false,
        showAnswerKey: project.settings.showAnswerKey || false,
        showExplanations: project.settings.showExplanations || false,
        notifyTeacherOnSubmission:
          project.settings.notifyTeacherOnSubmission !== false,
        notifyTeacherDailySummary:
          project.settings.notifyTeacherDailySummary || false,
        notifyTeacherWhenMarked:
          project.settings.notifyTeacherWhenMarked || false,
        notifyStudentOnSubmission:
          project.settings.notifyStudentOnSubmission !== false,
        notifyStudentOnGradeRelease:
          project.settings.notifyStudentOnGradeRelease !== false,
        notifyStudentDeadlineReminders:
          project.settings.notifyStudentDeadlineReminders || false,
      });
    }
  }, [project]);

  const testLink = project
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/test/${project.accessCode}`
    : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(testLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link copied",
        description: "Test link has been copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateQrCode = async () => {
    try {
      const qrUrl = await QRCode.toDataURL(testLink, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(qrUrl);
      setShowQrCode(true);
      toast({
        title: "QR Code generated",
        description: "QR code has been generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `${project?.name || "test"}-qr-code.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: "QR Code downloaded",
      description: "QR code has been saved to your downloads.",
    });
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      // Update project name and description
      await updateProject({
        projectId,
        name: projectName,
        description: projectDescription,
      });

      // Update settings
      await updateSettings({
        projectId,
        settings,
      });

      toast({
        title: "Settings saved",
        description: "Your test settings have been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!project) return;

    try {
      if (project.status === "published") {
        await updateStatus({ projectId, status: "draft" });
        toast({
          title: "Test unpublished",
          description: "Your test has been unpublished and is now a draft.",
        });
      } else {
        await updateStatus({ projectId, status: "published" });
        toast({
          title: "Test published",
          description: "Your test is now live and accessible to students.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
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
                <span className="text-foreground font-medium">
                  {project.name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/app/${projectId}/preview`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </Link>
              <Button size="sm" className="gap-2" onClick={handlePublish}>
                <Share2 className="w-4 h-4" />
                {project.status === "published" ? "Unpublish" : "Publish"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Link href={`/app/${projectId}/edit`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Edit
              </button>
            </Link>
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">
              Options
            </button>
            <Link href={`/app/${projectId}/preview`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Preview
              </button>
            </Link>
            <Link href={`/app/${projectId}/mark`}>
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
                    activeTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
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
                  <h3 className="text-lg font-semibold mb-4">
                    Test Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="test-name">Test Name</Label>
                      <Input
                        id="test-name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={projectDescription}
                        onChange={(e) => setProjectDescription(e.target.value)}
                        className="mt-2"
                        rows={3}
                        placeholder="Add instructions or description for students..."
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="duration">Duration (minutes)</Label>
                        <Input
                          id="duration"
                          type="number"
                          value={settings.duration || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              duration: e.target.value
                                ? Number.parseInt(e.target.value)
                                : undefined,
                            })
                          }
                          placeholder="No limit"
                          className="mt-2"
                          min={1}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave empty for no time limit
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="attempts">Max Attempts</Label>
                        <Input
                          id="attempts"
                          type="number"
                          value={settings.maxAttempts}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              maxAttempts: Number.parseInt(e.target.value) || 1,
                            })
                          }
                          className="mt-2"
                          min={1}
                        />
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
                        <Button
                          onClick={handleCopy}
                          variant="outline"
                          className="gap-2 bg-transparent"
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Access Code:{" "}
                        <span className="font-mono font-semibold">
                          {project.accessCode}
                        </span>
                      </p>
                    </div>
                    <div>
                      <Button
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={handleGenerateQrCode}
                      >
                        <QrCode className="w-4 h-4" />
                        Generate QR Code
                      </Button>
                    </div>
                    {showQrCode && qrCodeUrl && (
                      <div className="border rounded-lg p-4 space-y-3">
                        <img
                          src={qrCodeUrl}
                          alt="QR Code"
                          className="w-64 h-64 mx-auto"
                        />
                        <Button
                          variant="outline"
                          className="w-full gap-2 bg-transparent"
                          onClick={handleDownloadQrCode}
                        >
                          <Download className="w-4 h-4" />
                          Download QR Code
                        </Button>
                      </div>
                    )}
                    <div>
                      <Label>Embed Code</Label>
                      <Textarea
                        readOnly
                        value={`<iframe src="${testLink}" width="100%" height="600" frameborder="0"></iframe>`}
                        className="mt-2 font-mono text-xs"
                        rows={3}
                      />
                    </div>
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
                        <p className="text-sm text-muted-foreground">
                          Students must log in to take the test
                        </p>
                      </div>
                      <Switch
                        checked={settings.requireAuth}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, requireAuth: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email Verification</Label>
                        <p className="text-sm text-muted-foreground">
                          Verify student email addresses
                        </p>
                      </div>
                      <Switch
                        checked={settings.requireEmailVerification}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            requireEmailVerification: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Password Protection
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Enable Password</Label>
                      <Switch
                        checked={settings.passwordProtected}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            passwordProtected: checked,
                          })
                        }
                      />
                    </div>
                    {settings.passwordProtected && (
                      <div>
                        <Label htmlFor="password">Test Password</Label>
                        <Input
                          id="password"
                          type="text"
                          value={settings.password || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              password: e.target.value || undefined,
                            })
                          }
                          placeholder="Enter password"
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Students will need this password to start the test
                        </p>
                      </div>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Browser Restrictions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Disable Copy/Paste</Label>
                        <p className="text-sm text-muted-foreground">
                          Prevent copying and pasting
                        </p>
                      </div>
                      <Switch
                        checked={settings.disableCopyPaste}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            disableCopyPaste: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Full-screen Mode Required</Label>
                        <p className="text-sm text-muted-foreground">
                          Force students to use fullscreen
                        </p>
                      </div>
                      <Switch
                        checked={settings.fullScreenRequired}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            fullScreenRequired: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Block Tab Switching</Label>
                        <p className="text-sm text-muted-foreground">
                          Track and warn when students switch tabs
                        </p>
                      </div>
                      <Switch
                        checked={settings.blockTabSwitching}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            blockTabSwitching: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "grading" && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Marking Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Auto-grade Where Possible</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically grade multiple choice questions
                        </p>
                      </div>
                      <Switch
                        checked={settings.autoGrade}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, autoGrade: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Enable AI Marking</Label>
                        <p className="text-sm text-muted-foreground">
                          AI grades open-ended responses (~5 credits per
                          submission)
                        </p>
                      </div>
                      <Switch
                        checked={settings.enableAIMarking}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, enableAIMarking: checked })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="passing-grade">Passing Grade (%)</Label>
                      <Input
                        id="passing-grade"
                        type="number"
                        value={settings.passingGrade}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            passingGrade: Number.parseInt(e.target.value) || 70,
                          })
                        }
                        className="mt-2"
                        min={0}
                        max={100}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Feedback Options
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Instant Feedback</Label>
                        <p className="text-sm text-muted-foreground">
                          Show results immediately after submission
                        </p>
                      </div>
                      <Switch
                        checked={settings.instantFeedback}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, instantFeedback: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Show Answer Key</Label>
                        <p className="text-sm text-muted-foreground">
                          Display correct answers to students
                        </p>
                      </div>
                      <Switch
                        checked={settings.showAnswerKey}
                        onCheckedChange={(checked) =>
                          setSettings({ ...settings, showAnswerKey: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Display Detailed Explanations</Label>
                        <p className="text-sm text-muted-foreground">
                          Show explanations for each answer
                        </p>
                      </div>
                      <Switch
                        checked={settings.showExplanations}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            showExplanations: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}

            {activeTab === "notifications" && (
              <>
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Teacher Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Email on Submission</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when a student submits
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyTeacherOnSubmission}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifyTeacherOnSubmission: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Daily Summary Report</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive daily submission summary
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyTeacherDailySummary}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifyTeacherDailySummary: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Notify When All Marked</Label>
                        <p className="text-sm text-muted-foreground">
                          Alert when all submissions are graded
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyTeacherWhenMarked}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifyTeacherWhenMarked: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Student Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Submission Confirmation</Label>
                        <p className="text-sm text-muted-foreground">
                          Confirm test submission via email
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyStudentOnSubmission}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifyStudentOnSubmission: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Grade Release Notification</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when grades are released
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyStudentOnGradeRelease}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifyStudentOnGradeRelease: checked,
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Deadline Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Send reminders before deadline
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifyStudentDeadlineReminders}
                        onCheckedChange={(checked) =>
                          setSettings({
                            ...settings,
                            notifyStudentDeadlineReminders: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              </>
            )}

            <div className="flex justify-end">
              <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
