import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { useParams, useNavigate } from "react-router";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

type TestField = {
  id: string;
  type: "shortInput" | "longInput" | "multipleChoice" | "checkboxes" | "dropdown" | "imageChoice" | "pageBreak" | "infoBlock";
  label: string;
  required?: boolean;
  options?: string[];
  order: number;
  placeholder?: string;
  helpText?: string;
  minLength?: number;
  maxLength?: number;
};

// localStorage utility functions for test progress
type TestProgressData = {
  formData: Record<string, any>;
  currentPage: number;
  // Authentication/flow state
  isPasswordVerified?: boolean;
  isEmailProvided?: boolean;
  isNameProvided?: boolean;
  userName?: string;
  userEmail?: string;
  showTest?: boolean;
  testStartedAt?: number | null;
};

function getTestProgressKey(testId: Id<"tests">): string {
  return `test-progress-${testId}`;
}

function saveTestProgress(testId: Id<"tests">, data: TestProgressData): void {
  try {
    const key = getTestProgressKey(testId);
    console.log("🔵 [DEBUG] Saving test progress:", {
      testId,
      key,
      data: {
        isPasswordVerified: data.isPasswordVerified,
        isEmailProvided: data.isEmailProvided,
        isNameProvided: data.isNameProvided,
        userName: data.userName,
        userEmail: data.userEmail,
        showTest: data.showTest,
        testStartedAt: data.testStartedAt,
        hasFormData: !!data.formData,
        currentPage: (data as any).currentPage,
      },
    });
    localStorage.setItem(key, JSON.stringify(data));
    console.log("🔵 [DEBUG] Successfully saved to localStorage");
  } catch (error) {
    // Handle quota exceeded or other localStorage errors gracefully
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, unable to save test progress");
    } else {
      console.warn("Failed to save test progress to localStorage:", error);
    }
  }
}

function loadTestProgress(testId: Id<"tests">): TestProgressData | null {
  try {
    const key = getTestProgressKey(testId);
    const saved = localStorage.getItem(key);
    console.log("🟢 [DEBUG] Loading test progress:", {
      testId,
      key,
      found: !!saved,
    });
    if (saved) {
      const parsed = JSON.parse(saved) as TestProgressData;
      console.log("🟢 [DEBUG] Loaded data:", {
        isPasswordVerified: parsed.isPasswordVerified,
        isEmailProvided: parsed.isEmailProvided,
        isNameProvided: parsed.isNameProvided,
        userName: parsed.userName,
        userEmail: parsed.userEmail,
        showTest: parsed.showTest,
        testStartedAt: parsed.testStartedAt,
        hasFormData: !!parsed.formData,
        currentPage: (parsed as any).currentPage,
      });
      return parsed;
    } else {
      console.log("🟢 [DEBUG] No saved data found");
    }
  } catch (error) {
    console.warn("Failed to load test progress from localStorage:", error);
  }
  return null;
}

function clearTestProgress(testId: Id<"tests">): void {
  try {
    const key = getTestProgressKey(testId);
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear test progress from localStorage:", error);
  }
}

export default function TestPage() {
  const params = useParams();
  const navigate = useNavigate();
  const testId = params.id as Id<"tests"> | undefined;

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showTest, setShowTest] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [isEmailProvided, setIsEmailProvided] = useState(false);
  const [isNameProvided, setIsNameProvided] = useState(false);
  const [testStartedAt, setTestStartedAt] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    score?: number;
    maxScore?: number;
    percentage?: number;
  } | null>(null);
  const [isFullscreenEnabled, setIsFullscreenEnabled] = useState(false);
  const [isLoadingSavedState, setIsLoadingSavedState] = useState(true);
  const hasInitialLoadCompletedRef = useRef(false);

  const test = useQuery(
    api.tests.getPublicTest,
    testId ? { testId } : "skip"
  );

  // Load saved progress (including authentication state) on mount - do this synchronously
  useEffect(() => {
    console.log("🟡 [DEBUG] Load effect triggered:", { testId, testLoaded: test !== undefined });
    if (!testId || test === undefined) {
      console.log("🟡 [DEBUG] Skipping load - no testId or test not loaded");
      setIsLoadingSavedState(false);
      return;
    }
    
    // Load immediately
    const savedProgress = loadTestProgress(testId);
    console.log("🟡 [DEBUG] Restoring state from saved progress:", {
      hasSavedProgress: !!savedProgress,
      savedProgress,
    });
    
    if (savedProgress) {
      // Restore form data
      if (savedProgress.formData) {
        console.log("🟡 [DEBUG] Restoring formData");
        setFormData(savedProgress.formData);
      }
      
      // Restore authentication/flow state
      if (savedProgress.isPasswordVerified !== undefined) {
        console.log("🟡 [DEBUG] Restoring isPasswordVerified:", savedProgress.isPasswordVerified);
        setIsPasswordVerified(savedProgress.isPasswordVerified);
      }
      if (savedProgress.isEmailProvided !== undefined) {
        console.log("🟡 [DEBUG] Restoring isEmailProvided:", savedProgress.isEmailProvided);
        setIsEmailProvided(savedProgress.isEmailProvided);
      }
      if (savedProgress.isNameProvided !== undefined) {
        console.log("🟡 [DEBUG] Restoring isNameProvided:", savedProgress.isNameProvided);
        setIsNameProvided(savedProgress.isNameProvided);
      }
      if (savedProgress.userName) {
        console.log("🟡 [DEBUG] Restoring userName:", savedProgress.userName);
        setUserName(savedProgress.userName);
      }
      if (savedProgress.userEmail) {
        console.log("🟡 [DEBUG] Restoring userEmail:", savedProgress.userEmail);
        setUserEmail(savedProgress.userEmail);
      }
      if (savedProgress.showTest !== undefined) {
        console.log("🟡 [DEBUG] Restoring showTest:", savedProgress.showTest);
        setShowTest(savedProgress.showTest);
      }
      if (savedProgress.testStartedAt !== undefined) {
        console.log("🟡 [DEBUG] Restoring testStartedAt:", savedProgress.testStartedAt);
        setTestStartedAt(savedProgress.testStartedAt);
      }
    } else {
      console.log("🟡 [DEBUG] No saved progress to restore");
    }
    
    setIsLoadingSavedState(false);
    // Mark initial load as complete after a brief delay to ensure state updates have been applied
    setTimeout(() => {
      hasInitialLoadCompletedRef.current = true;
      console.log("🟡 [DEBUG] Initial load completed, saves now enabled");
    }, 100);
    console.log("🟡 [DEBUG] Load complete, isLoadingSavedState set to false");
  }, [testId, test]);

  // Save authentication/flow state when it changes
  // This merges with any existing saved state (including formData and currentPage from TestForm)
  useEffect(() => {
    console.log("🟠 [DEBUG] Save effect triggered:", {
      testId,
      isLoadingSavedState,
      hasInitialLoadCompleted: hasInitialLoadCompletedRef.current,
      isPasswordVerified,
      isEmailProvided,
      isNameProvided,
      userName,
      userEmail,
      showTest,
      testStartedAt,
    });
    
    if (!testId || isLoadingSavedState || !hasInitialLoadCompletedRef.current) {
      console.log("🟠 [DEBUG] Skipping save - no testId, still loading, or initial load not completed");
      return; // Don't save during initial load
    }
    
    // Always save authentication state once user has started the flow
    // This ensures password, email, and name are persisted on refresh
    const existing = loadTestProgress(testId) || {};
    const dataToSave = {
      ...existing, // Preserve formData and currentPage
      isPasswordVerified,
      isEmailProvided,
      isNameProvided,
      userName,
      userEmail,
      showTest,
      testStartedAt,
    };
    console.log("🟠 [DEBUG] Saving state:", dataToSave);
    saveTestProgress(testId, dataToSave);
  }, [testId, isLoadingSavedState, isPasswordVerified, isEmailProvided, isNameProvided, userName, userEmail, showTest, testStartedAt, formData, test]);

  // Clear formData when testId changes (navigating to a different test)
  useEffect(() => {
    if (testId) {
      // Reset initial load flag when testId changes
      hasInitialLoadCompletedRef.current = false;
      // Don't clear everything - let the load effect handle restoration
      // Only clear submission result
      setSubmissionResult(null);
    }
  }, [testId]);

  // Handle password verification
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔴 [DEBUG] Password submit:", {
      hasPassword: !!test?.password,
      passwordMatch: test?.password && password === test.password,
    });
    if (test?.password && password === test.password) {
      console.log("🔴 [DEBUG] Password correct, setting isPasswordVerified to true");
      setIsPasswordVerified(true);
      setPasswordError("");
      // Don't set showTest here - let the flow logic determine what to show next
      // (email screen, name screen, or test directly)
      // State will be saved automatically by the useEffect
    } else {
      console.log("🔴 [DEBUG] Password incorrect");
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = userEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
    console.log("🔴 [DEBUG] Email submit:", { userEmail, isValid });
    if (isValid) {
      console.log("🔴 [DEBUG] Email valid, setting isEmailProvided to true");
      setIsEmailProvided(true);
      // When requireAuth is true, we need both email and name, so don't show test yet
      // The name screen will be shown next
      // State will be saved automatically by the useEffect
    }
  };

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔴 [DEBUG] Name submit:", { userName, hasName: !!userName.trim() });
    if (userName.trim()) {
      console.log("🔴 [DEBUG] Name provided, setting isNameProvided to true");
      setIsNameProvided(true);
      // Check if fullscreen is required before showing test
      if (test?.requireFullScreen) {
        console.log("🔴 [DEBUG] Fullscreen required, waiting for fullscreen");
        // Don't set showTest yet - wait for fullscreen
      } else {
        console.log("🔴 [DEBUG] No fullscreen required, showing test");
        setShowTest(true);
        setTestStartedAt(Date.now());
        // State will be saved automatically by the useEffect
      }
    }
  };

  // Check fullscreen status
  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      setIsFullscreenEnabled((prevFullscreen) => {
        // If fullscreen is required and just got enabled, show test
        if (test?.requireFullScreen && isFullscreen && !prevFullscreen && !showTest) {
          // Check if we have all prerequisites
          const hasPassword = !test.password || isPasswordVerified;
          const hasEmail = !test.requireAuth || isEmailProvided;
          // When requireAuth is true, we need both email and name
          const hasName = isNameProvided;

          if (hasPassword && hasEmail && hasName) {
            setShowTest(true);
            if (!testStartedAt) {
              setTestStartedAt(Date.now());
            }
            // State will be saved automatically by the useEffect
          }
        }
        return isFullscreen;
      });
    };

    checkFullscreen();
    document.addEventListener("fullscreenchange", checkFullscreen);
    document.addEventListener("webkitfullscreenchange", checkFullscreen);
    document.addEventListener("mozfullscreenchange", checkFullscreen);
    document.addEventListener("MSFullscreenChange", checkFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", checkFullscreen);
      document.removeEventListener("webkitfullscreenchange", checkFullscreen);
      document.removeEventListener("mozfullscreenchange", checkFullscreen);
      document.removeEventListener("MSFullscreenChange", checkFullscreen);
    };
  }, [test, showTest, isPasswordVerified, isEmailProvided, isNameProvided]);

  // Loading state
  if (!testId || test === undefined || isLoadingSavedState) {
    console.log("🟣 [DEBUG] Loading state:", { testId, testLoaded: test !== undefined, isLoadingSavedState });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    );
  }

  // Test not found
  if (test === null) {
    console.log("🟣 [DEBUG] Test not found");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Test Not Found</CardTitle>
            <CardDescription>The test you're looking for doesn't exist or has been removed.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Debug: Log current state before rendering
  console.log("🟣 [DEBUG] Current state before render:", {
    isPasswordVerified,
    isEmailProvided,
    isNameProvided,
    userName,
    userEmail,
    showTest,
    testStartedAt,
    testHasPassword: !!test.password,
    testRequireAuth: test.requireAuth,
    testRequireFullScreen: test.requireFullScreen,
    isFullscreenEnabled,
    submissionResult: !!submissionResult,
  });

  // Password protection screen (only show if password exists and not verified)
  console.log("🟣 [DEBUG] Render check - Password screen:", {
    hasPassword: !!test.password,
    isPasswordVerified,
    shouldShow: test.password && !isPasswordVerified,
  });
  if (test.password && !isPasswordVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-16 object-contain"
              />
            </div>
            <CardTitle>Password Required</CardTitle>
            <CardDescription>This test is password protected. Please enter the password to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError("");
                  }}
                  placeholder="Enter password"
                  required
                  autoFocus
                />
                {passwordError && (
                  <p className="text-sm text-destructive">{passwordError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email collection screen (if requireAuth is enabled and email not provided, and password verified or no password)
  console.log("🟣 [DEBUG] Render check - Email screen:", {
    requireAuth: test.requireAuth,
    isEmailProvided,
    hasPassword: !!test.password,
    isPasswordVerified,
    shouldShow: test.requireAuth && !isEmailProvided && (!test.password || isPasswordVerified),
  });
  if (test.requireAuth && !isEmailProvided && (!test.password || isPasswordVerified)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-16 object-contain"
              />
            </div>
            <CardTitle>Email Required</CardTitle>
            <CardDescription>Please enter your email address to begin the test.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={!userEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())}>
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fullscreen required screen (if fullscreen is required and not enabled yet)
  // Only show after name/email has been collected, but not after submission
  if (test.requireFullScreen && !isFullscreenEnabled && !submissionResult && (!test.password || isPasswordVerified) && 
      (test.requireAuth ? (isEmailProvided && isNameProvided) : isNameProvided)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-16 object-contain"
              />
            </div>
            <CardTitle>Fullscreen Required</CardTitle>
            <CardDescription>
              This test requires fullscreen mode. Please enable fullscreen to continue.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full"
              onClick={async () => {
                try {
                  const element = document.documentElement;
                  if (element.requestFullscreen) {
                    await element.requestFullscreen();
                  } else if ((element as any).webkitRequestFullscreen) {
                    await (element as any).webkitRequestFullscreen();
                  } else if ((element as any).mozRequestFullScreen) {
                    await (element as any).mozRequestFullScreen();
                  } else if ((element as any).msRequestFullscreen) {
                    await (element as any).msRequestFullscreen();
                  } else {
                    toast.error("Fullscreen is not supported in your browser. Please enable it manually using F11 or your browser's fullscreen option.");
                  }
                } catch (error) {
                  console.warn("Fullscreen request failed:", error);
                  toast.error("Please enable fullscreen mode manually using F11 or your browser's fullscreen option.");
                }
              }}
            >
              Enable Fullscreen
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              You can also press F11 to enable fullscreen mode
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Name collection screen (show if name not provided yet)
  // If requireAuth is true, show after email is provided
  // If requireAuth is false, show after password (if any) is verified
  console.log("🟣 [DEBUG] Render check - Name screen:", {
    isNameProvided,
    hasPassword: !!test.password,
    isPasswordVerified,
    requireAuth: test.requireAuth,
    isEmailProvided,
    shouldShow: !isNameProvided && (!test.password || isPasswordVerified) && 
      (test.requireAuth ? isEmailProvided : true),
  });
  if (!isNameProvided && (!test.password || isPasswordVerified) && 
      (test.requireAuth ? isEmailProvided : true)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-16 object-contain"
              />
            </div>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Please enter your full name to begin the test.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={!userName.trim()}>
                Start Test
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show test form or success screen (only if fullscreen is enabled if required)
  if (showTest && !submissionResult && (!test.requireFullScreen || isFullscreenEnabled)) {
    return (
      <TestForm 
        test={test} 
        userName={userName}
        userEmail={test.requireAuth ? userEmail : undefined}
        formData={formData}
        setFormData={setFormData}
        testId={testId!}
        startedAt={testStartedAt || Date.now()}
        onSubmissionComplete={setSubmissionResult}
      />
    );
  }

  // Show success screen
  if (submissionResult) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30 px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle>Test Submitted Successfully</CardTitle>
            <CardDescription>
              {test.instantFeedback && submissionResult.score !== undefined
                ? `Your score: ${submissionResult.score}${submissionResult.maxScore ? `/${submissionResult.maxScore}` : ""}${submissionResult.percentage !== undefined ? ` (${submissionResult.percentage}%)` : ""}`
                : "Thank you for completing the test."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {test.instantFeedback && submissionResult.score !== undefined && (
              <div className="text-center py-4">
                <div className="text-3xl font-bold text-primary">
                  {submissionResult.percentage !== undefined ? `${submissionResult.percentage}%` : ""}
                </div>
                {submissionResult.maxScore && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {submissionResult.score} out of {submissionResult.maxScore} points
                  </div>
                )}
              </div>
            )}
            <Button 
              className="w-full" 
              onClick={() => navigate("/")}
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

function TestForm({
  test,
  userName,
  userEmail,
  formData,
  setFormData,
  testId,
  startedAt,
  onSubmissionComplete,
}: {
  test: NonNullable<ReturnType<typeof useQuery<typeof api.tests.getPublicTest>>>;
  userName?: string;
  userEmail?: string;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  testId: Id<"tests">;
  startedAt: number;
  onSubmissionComplete: (result: { score?: number; maxScore?: number; percentage?: number }) => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitTest = useMutation(api.tests.submitTest);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  
  // Check if back navigation is allowed (default to true if not set)
  const allowBackNavigation = test.allowBackNavigation !== undefined ? test.allowBackNavigation : true;

  // Reset initial load flag when testId changes
  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [testId]);

  // Load saved progress on mount
  // Note: Parent component loads formData, TestForm only loads currentPage
  useEffect(() => {
    const savedProgress = loadTestProgress(testId);
    if (savedProgress && savedProgress.currentPage !== undefined) {
      setCurrentPage(savedProgress.currentPage);
    }
    // Set flag to false after a brief delay to ensure save effect doesn't run immediately
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 100);
  }, [testId]);

  // Clear old test data when testId changes
  useEffect(() => {
    return () => {
      // Clear progress when component unmounts (user navigates away)
      // Note: We don't clear here because user might refresh, we only clear on submission
    };
  }, [testId]);

  // Debounced save of formData and currentPage
  // This merges with any existing saved state (including auth state from parent)
  useEffect(() => {
    // Don't save on initial load
    if (isInitialLoadRef.current) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout to save after 500ms of no changes
    saveTimeoutRef.current = setTimeout(() => {
      // Load existing saved state to preserve auth state
      const existing = loadTestProgress(testId) || {};
      saveTestProgress(testId, {
        ...existing, // Preserve auth state and other fields
        formData,
        currentPage,
      });
    }, 500);

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, testId, currentPage]);

  // Browser restrictions
  useEffect(() => {
    // Disable copy/paste handlers
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    // Disable context menu handler
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block tab switching
    let tabSwitchWarningShown = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (!tabSwitchWarningShown) {
          toast.warning("Please do not switch tabs during the test.");
          tabSwitchWarningShown = true;
        }
      }
    };

    // Monitor fullscreen exit
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      if (!isFullscreen) {
        toast.warning("Please return to fullscreen mode to continue the test.");
      }
    };

    // Apply restrictions only if enabled
    if (test.disableCopyPaste) {
      document.addEventListener("copy", handleCopy, true);
      document.addEventListener("cut", handleCut, true);
      document.addEventListener("paste", handlePaste, true);
      document.addEventListener("contextmenu", handleContextMenu, true);
    }

    if (test.blockTabSwitching) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    if (test.requireFullScreen) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    }

    // Cleanup - always remove handlers to prevent stale closures
    return () => {
      // Always remove copy/paste handlers if they were added
      document.removeEventListener("copy", handleCopy, true);
      document.removeEventListener("cut", handleCut, true);
      document.removeEventListener("paste", handlePaste, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      
      if (test.blockTabSwitching) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (test.requireFullScreen) {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
        document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
        document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
      }
    };
  }, [test.disableCopyPaste, test.blockTabSwitching, test.requireFullScreen]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Split fields into pages based on page breaks
  const fields = (test.fields || []) as TestField[];
  const sortedFields = fields.sort((a, b) => a.order - b.order);
  
  const pages: TestField[][] = [];
  let currentPageFields: TestField[] = [];
  
  sortedFields.forEach((field) => {
    if (field.type === "pageBreak") {
      // End current page and start a new one
      if (currentPageFields.length > 0) {
        pages.push(currentPageFields);
        currentPageFields = [];
      }
    } else {
      currentPageFields.push(field);
    }
  });
  
  // Add the last page if it has fields
  if (currentPageFields.length > 0) {
    pages.push(currentPageFields);
  }

  const currentPageFieldsToShow = pages[currentPage] || [];
  const isLastPage = currentPage === pages.length - 1;

  // Validate required fields
  const validateRequiredFields = (fieldsToValidate: TestField[]): { isValid: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];
    
    for (const field of fieldsToValidate) {
      if (field.required) {
        const fieldValue = formData[field.id];
        
        // Check if field is empty or invalid
        let isEmpty = false;
        
        if (field.type === "shortInput" || field.type === "longInput") {
          isEmpty = !fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === "");
        } else if (field.type === "multipleChoice" || field.type === "dropdown") {
          isEmpty = fieldValue === undefined || fieldValue === null || fieldValue === "";
        } else if (field.type === "checkboxes" || field.type === "imageChoice") {
          isEmpty = !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
        }
        
        if (isEmpty) {
          missingFields.push(field.label || field.id);
        }
      }
    }
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields across all pages
    const allFields = sortedFields.filter(f => f.type !== "pageBreak" && f.type !== "infoBlock");
    const validation = validateRequiredFields(allFields);
    
    if (!validation.isValid) {
      toast.error(
        `Please fill out all required fields before submitting: ${validation.missingFields.join(", ")}`,
        { duration: 5000 }
      );
      return;
    }
    
    setIsSubmitting(true);

    try {
      const result = await submitTest({
        testId,
        responses: formData,
        respondentName: userName,
        respondentEmail: userEmail,
        startedAt,
      });

      // Clear localStorage after successful submission
      clearTestProgress(testId);

      onSubmissionComplete({
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
      });
    } catch (error) {
      console.error("Failed to submit test:", error);
      toast.error("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinue = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Validate required fields on current page
    const validation = validateRequiredFields(currentPageFieldsToShow);
    if (!validation.isValid) {
      toast.error(
        `Please fill out all required fields: ${validation.missingFields.join(", ")}`,
        { duration: 5000 }
      );
      return;
    }
    
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      // Scroll to top when moving to next page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Scroll to top when moving to previous page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderField = (field: TestField) => {
    const fieldValue = formData[field.id] || "";

    switch (field.type) {
      case "shortInput":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "longInput":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className="resize-none"
            />
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "multipleChoice":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${field.id}-${index}`}
                    name={field.id}
                    value={String(index)}
                    checked={fieldValue === String(index)}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    required={field.required}
                    className="h-4 w-4 border-primary text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                  <Label htmlFor={`${field.id}-${index}`} className="font-normal cursor-pointer">
                    {option || `Option ${index + 1}`}
                  </Label>
                </div>
              ))}
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "checkboxes":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="space-y-2">
              {(field.options || []).map((option, index) => {
                const checkedValues = Array.isArray(fieldValue) ? fieldValue : [];
                const isChecked = checkedValues.includes(String(index));
                return (
                  <div key={index} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${field.id}-${index}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                        if (checked) {
                          handleInputChange(field.id, [...currentValues, String(index)]);
                        } else {
                          handleInputChange(
                            field.id,
                            currentValues.filter((v) => v !== String(index))
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`${field.id}-${index}`} className="font-normal cursor-pointer">
                      {option || `Option ${index + 1}`}
                    </Label>
                  </div>
                );
              })}
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "dropdown":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleInputChange(field.id, value)}
              required={field.required}
            >
              <SelectTrigger id={field.id}>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, index) => (
                  <SelectItem key={index} value={String(index)}>
                    {option || `Option ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "imageChoice":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="grid grid-cols-2 gap-4">
              {(field.options || []).map((option, index) => {
                const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
                const isSelected = selectedValues.includes(String(index));
                const imageUrl = option && option.startsWith("http") ? option : undefined;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (isSelected) {
                        handleInputChange(
                          field.id,
                          currentValues.filter((v) => v !== String(index))
                        );
                      } else {
                        handleInputChange(field.id, [...currentValues, String(index)]);
                      }
                    }}
                    className={cn(
                      "border-2 rounded-lg p-2 aspect-square overflow-hidden transition-all relative",
                      isSelected
                        ? "border-primary bg-primary/10 ring-2 ring-primary ring-offset-2"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={`Choice ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                        Image {index + 1}
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <CheckCircle className="h-3 w-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "pageBreak":
        // Page breaks are handled by page splitting logic, not rendered
        return null;

      case "infoBlock":
        return (
          <div key={field.id} className="p-4 bg-muted rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{field.label}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="space-y-2 mb-6">
          <h1 className="text-2xl font-bold">{test.name || "Untitled Test"}</h1>
          {test.description && (
            <p className="text-muted-foreground">{test.description}</p>
          )}
          {userName && (
            <p className="text-sm text-muted-foreground">Name: {userName}</p>
          )}
          {userEmail && (
            <p className="text-sm text-muted-foreground">Email: {userEmail}</p>
          )}
          {pages.length > 1 && (
            <p className="text-sm text-muted-foreground">
              Page {currentPage + 1} of {pages.length}
            </p>
          )}
        </div>
        <Separator className="mb-6" />
        <form onSubmit={handleSubmit} className="space-y-6">
          {currentPageFieldsToShow.map((field) => (
            <div key={field.id}>
              {renderField(field)}
            </div>
          ))}
          <div className="pt-6 flex gap-3">
            {allowBackNavigation && currentPage > 0 && (
              <Button 
                type="button" 
                size="lg" 
                variant="outline"
                className="flex-1"
                onClick={handleBack}
              >
                Back
              </Button>
            )}
            {isLastPage ? (
              <Button type="submit" size="lg" className={allowBackNavigation && currentPage > 0 ? "flex-1" : "w-full"} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Test"
                )}
              </Button>
            ) : (
              <Button 
                type="button" 
                size="lg" 
                className={allowBackNavigation && currentPage > 0 ? "flex-1" : "w-full"}
                onClick={handleContinue}
              >
                Continue
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
