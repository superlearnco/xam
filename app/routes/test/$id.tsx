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
import katex from "katex";
import "katex/dist/katex.min.css";

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
  fileUrl?: string;
  latexContent?: string;
};

// localStorage utility functions for test progress
type TestProgressData = {
  formData?: Record<string, any>;
  currentPage?: number;
  // Authentication/flow state
  isPasswordVerified?: boolean;
  isEmailProvided?: boolean;
  isNameProvided?: boolean;
  userName?: string;
  userEmail?: string;
  showTest?: boolean;
  testStartedAt?: number | null;
  shuffledFieldIds?: string[];
  shuffledOptionsMapping?: Record<string, number[]>;
};

function getTestProgressKey(testId: Id<"tests">): string {
  return `test-progress-${testId}`;
}

function saveTestProgress(testId: Id<"tests">, data: TestProgressData): void {
  try {
    const key = getTestProgressKey(testId);
    localStorage.setItem(key, JSON.stringify(data));
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
    if (saved) {
      const parsed = JSON.parse(saved) as TestProgressData;
      return parsed;
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
  const [shuffledFieldIds, setShuffledFieldIds] = useState<string[] | undefined>(undefined);
  const [shuffledOptionsMapping, setShuffledOptionsMapping] = useState<Record<string, number[]> | undefined>(undefined);
  const hasInitialLoadCompletedRef = useRef(false);

  const test = useQuery(
    api.tests.getPublicTest,
    testId ? { testId } : "skip"
  );

  // Load saved progress (including authentication state) on mount - do this synchronously
  useEffect(() => {
    if (!testId || test === undefined) {
      setIsLoadingSavedState(false);
      return;
    }
    
    // Load immediately
    const savedProgress = loadTestProgress(testId);
    
    if (savedProgress) {
      // Restore form data
      if (savedProgress.formData) {
        setFormData(savedProgress.formData);
      }
      
      // Restore authentication/flow state
      if (savedProgress.isPasswordVerified !== undefined) {
        setIsPasswordVerified(savedProgress.isPasswordVerified);
      }
      if (savedProgress.isEmailProvided !== undefined) {
        setIsEmailProvided(savedProgress.isEmailProvided);
      }
      if (savedProgress.isNameProvided !== undefined) {
        setIsNameProvided(savedProgress.isNameProvided);
      }
      if (savedProgress.userName) {
        setUserName(savedProgress.userName);
      }
      if (savedProgress.userEmail) {
        setUserEmail(savedProgress.userEmail);
      }
      if (savedProgress.showTest !== undefined) {
        setShowTest(savedProgress.showTest);
      }
      if (savedProgress.testStartedAt !== undefined) {
        setTestStartedAt(savedProgress.testStartedAt);
      }
      if (savedProgress.shuffledFieldIds) {
        setShuffledFieldIds(savedProgress.shuffledFieldIds);
      }
      if (savedProgress.shuffledOptionsMapping) {
        setShuffledOptionsMapping(savedProgress.shuffledOptionsMapping);
      }
    }
    
    setIsLoadingSavedState(false);
    // Mark initial load as complete after a brief delay to ensure state updates have been applied
    setTimeout(() => {
      hasInitialLoadCompletedRef.current = true;
    }, 100);
  }, [testId, test]);

  // Save authentication/flow state when it changes
  // This merges with any existing saved state (including formData and currentPage from TestForm)
  useEffect(() => {
    if (!testId || isLoadingSavedState || !hasInitialLoadCompletedRef.current) {
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
      shuffledFieldIds,
      shuffledOptionsMapping,
    };
    saveTestProgress(testId, dataToSave);
  }, [testId, isLoadingSavedState, isPasswordVerified, isEmailProvided, isNameProvided, userName, userEmail, showTest, testStartedAt, formData, test, shuffledFieldIds, shuffledOptionsMapping]);

  // Initialize randomization if needed
  useEffect(() => {
    if (!test || isLoadingSavedState) return;

    let newShuffledFieldIds = shuffledFieldIds;
    let newShuffledOptionsMapping = shuffledOptionsMapping;
    let hasChanges = false;

    // Randomize questions if enabled and not yet randomized
    if (test.randomizeQuestions && !shuffledFieldIds && test.fields) {
      const fields = [...test.fields] as TestField[];
      const sortedFields = fields.sort((a, b) => a.order - b.order);
      
      // Split into pages
      const pages: TestField[][] = [];
      let currentPageFields: TestField[] = [];
      
      sortedFields.forEach((field) => {
        if (field.type === "pageBreak") {
          if (currentPageFields.length > 0) {
            pages.push(currentPageFields);
            currentPageFields = [];
          }
          // Keep page break as a separate "page" containing just itself to preserve structure
          pages.push([field]);
        } else {
          currentPageFields.push(field);
        }
      });
      
      if (currentPageFields.length > 0) {
        pages.push(currentPageFields);
      }

      // Shuffle questions within pages (excluding page breaks)
      const shuffledIds: string[] = [];
      
      pages.forEach(page => {
        if (page.length === 1 && page[0].type === "pageBreak") {
          shuffledIds.push(page[0].id);
        } else {
          // Shuffle fields in this page
          const pageFields = [...page];
          for (let i = pageFields.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [pageFields[i], pageFields[j]] = [pageFields[j], pageFields[i]];
          }
          pageFields.forEach(f => shuffledIds.push(f.id));
        }
      });

      newShuffledFieldIds = shuffledIds;
      setShuffledFieldIds(shuffledIds);
      hasChanges = true;
    }

    // Shuffle options if enabled and not yet shuffled
    if (test.shuffleOptions && !shuffledOptionsMapping && test.fields) {
      const mapping: Record<string, number[]> = {};
      
      test.fields.forEach((field) => {
        if (
          (field.type === "multipleChoice" || 
           field.type === "checkboxes" || 
           field.type === "dropdown" || 
           field.type === "imageChoice") && 
          field.options && 
          field.options.length > 0
        ) {
          const indices = field.options.map((_, i) => i);
          // Fisher-Yates shuffle
          for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
          }
          mapping[field.id] = indices;
        }
      });

      if (Object.keys(mapping).length > 0) {
        newShuffledOptionsMapping = mapping;
        setShuffledOptionsMapping(mapping);
        hasChanges = true;
      }
    }

    // Save immediately if we generated new randomizations
    if (hasChanges) {
      const existing = loadTestProgress(testId!) || {};
      saveTestProgress(testId!, {
        ...existing,
        shuffledFieldIds: newShuffledFieldIds,
        shuffledOptionsMapping: newShuffledOptionsMapping,
      });
    }
  }, [test, testId, isLoadingSavedState, shuffledFieldIds, shuffledOptionsMapping]);

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
    if (test?.password && password === test.password) {
      setIsPasswordVerified(true);
      setPasswordError("");
      // Don't set showTest here - let the flow logic determine what to show next
      // (email screen, name screen, or test directly)
      // State will be saved automatically by the useEffect
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = userEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
    if (isValid) {
      setIsEmailProvided(true);
      // When requireAuth is true, we need both email and name, so don't show test yet
      // The name screen will be shown next
      // State will be saved automatically by the useEffect
    }
  };

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsNameProvided(true);
      // Check if fullscreen is required before showing test
      if (test?.requireFullScreen) {
        // Don't set showTest yet - wait for fullscreen
      } else {
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

  // Password protection screen (only show if password exists and not verified)
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
        shuffledFieldIds={shuffledFieldIds}
        shuffledOptionsMapping={shuffledOptionsMapping}
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
  shuffledFieldIds,
  shuffledOptionsMapping,
}: {
  test: NonNullable<ReturnType<typeof useQuery<typeof api.tests.getPublicTest>>>;
  userName?: string;
  userEmail?: string;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  testId: Id<"tests">;
  startedAt: number;
  onSubmissionComplete: (result: { score?: number; maxScore?: number; percentage?: number }) => void;
  shuffledFieldIds?: string[];
  shuffledOptionsMapping?: Record<string, number[]>;
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // in seconds
  const submitTest = useMutation(api.tests.submitTest);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSubmittedRef = useRef(false);
  
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

  // Countdown timer for enforced time limits
  useEffect(() => {
    // Only run if test has a time limit
    if (!test.timeLimitMinutes || isSubmitting) {
      return;
    }

    // Calculate time remaining
    const updateTimeRemaining = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000); // elapsed in seconds
      const totalSeconds = test.timeLimitMinutes! * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      
      setTimeRemaining(remaining);
      
      // Auto-submit when time expires
      if (remaining === 0 && !hasAutoSubmittedRef.current && !isSubmitting) {
        hasAutoSubmittedRef.current = true;
        toast.error("Time's up! Auto-submitting your test...");
        // Trigger form submission after a brief delay
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) {
            form.requestSubmit();
          }
        }, 500);
      }
    };

    // Initial calculation
    updateTimeRemaining();

    // Update every second
    timerIntervalRef.current = setInterval(updateTimeRemaining, 1000);

    // Cleanup
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [test.timeLimitMinutes, startedAt, isSubmitting]);

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
  // Ensure all field properties are preserved, including fileUrl and latexContent
  const fields = ((test.fields || []) as any[]).map((f): TestField => ({
    id: f.id,
    type: f.type,
    label: f.label,
    required: f.required,
    options: f.options,
    order: f.order,
    placeholder: f.placeholder,
    helpText: f.helpText,
    minLength: f.minLength,
    maxLength: f.maxLength,
    fileUrl: f.fileUrl,
    latexContent: f.latexContent,
  })) as TestField[];
  
  // Use shuffled order if available, otherwise sort by order
  let sortedFields: TestField[];
  if (shuffledFieldIds) {
    // Create a map for O(1) lookup
    const fieldMap = new Map(fields.map(f => [f.id, f]));
    // Map shuffled IDs to fields, filtering out any that might be missing (shouldn't happen)
    sortedFields = shuffledFieldIds
      .map(id => fieldMap.get(id))
      .filter((f): f is TestField => f !== undefined);
      
    // If for some reason shuffledFields is empty or missing fields (e.g. schema change), fall back to default sort
    if (sortedFields.length === 0 && fields.length > 0) {
      sortedFields = fields.sort((a, b) => a.order - b.order);
    }
  } else {
    sortedFields = fields.sort((a, b) => a.order - b.order);
  }
  
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
    
    // Get display order for options if shuffled
    const getOptionDisplayOrder = (options: string[] = []) => {
      if (shuffledOptionsMapping && shuffledOptionsMapping[field.id]) {
        return shuffledOptionsMapping[field.id];
      }
      return options.map((_, i) => i);
    };

    // Access fileUrl and latexContent from the field
    const fileUrl = field.fileUrl;
    const latexContent = field.latexContent;

    const imageElement = fileUrl ? (
      <div className="mb-6 rounded-lg overflow-hidden border bg-muted/30 flex justify-center p-4">
        <img 
          src={fileUrl} 
          alt="Question attachment" 
          className="max-h-[500px] max-w-full object-contain shadow-sm rounded"
        />
      </div>
    ) : null;

    const latexElement = latexContent ? (
      <div 
        className="mb-6 overflow-x-auto p-4 bg-muted/30 rounded-lg border"
        dangerouslySetInnerHTML={{ 
          __html: katex.renderToString(latexContent, { 
            throwOnError: false,
            displayMode: true 
          }) 
        }}
      />
    ) : null;

    // Helper to wrap questions in a consistent card style
    const QuestionWrapper = ({ children, labelFor }: { children: React.ReactNode; labelFor?: string }) => (
      <Card className="mb-8 shadow-sm border-border/60 hover:border-border transition-all duration-200 group">
        <CardHeader className="bg-muted/5 pb-4 space-y-4 border-b border-border/40">
          {imageElement}
          {latexElement}
          <div className="flex gap-2">
             <div className="flex-1 space-y-1.5">
              <Label 
                htmlFor={labelFor} 
                className={cn(
                  "text-lg font-semibold leading-snug block text-foreground/90 group-hover:text-foreground transition-colors",
                  labelFor ? "cursor-pointer" : ""
                )}
              >
                {field.label}
                {field.required && <span className="text-destructive ml-1" title="Required field">*</span>}
              </Label>
              {field.helpText && (
                <p className="text-sm text-muted-foreground font-normal leading-relaxed">{field.helpText}</p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-6">
          {children}
        </CardContent>
      </Card>
    );

    switch (field.type) {
      case "shortInput":
        return (
          <QuestionWrapper labelFor={field.id}>
            <Input
              id={field.id}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Your answer..."}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className="max-w-md h-11"
            />
          </QuestionWrapper>
        );

      case "longInput":
        return (
          <QuestionWrapper labelFor={field.id}>
            <Textarea
              id={field.id}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Type your answer here..."}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className="min-h-[140px] resize-y text-base leading-relaxed p-4"
            />
          </QuestionWrapper>
        );

      case "multipleChoice":
        return (
          <QuestionWrapper>
            <div className="grid gap-3">
              {getOptionDisplayOrder(field.options).map((originalIndex) => {
                const option = field.options?.[originalIndex];
                const isSelected = fieldValue === String(originalIndex);
                return (
                  <label
                    key={originalIndex}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden",
                      isSelected 
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                        : "border-input hover:bg-accent/50 hover:border-accent-foreground/30"
                    )}
                  >
                    <div className="flex items-center justify-center shrink-0">
                      <input
                        type="radio"
                        id={`${field.id}-${originalIndex}`}
                        name={field.id}
                        value={String(originalIndex)}
                        checked={isSelected}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className="peer h-4 w-4 border-primary text-primary shadow focus:ring-2 focus:ring-primary focus:ring-offset-2 accent-primary"
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1",
                      isSelected ? "text-foreground" : "text-foreground/80"
                    )}>
                      {option || `Option ${originalIndex + 1}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </QuestionWrapper>
        );

      case "checkboxes":
        return (
          <QuestionWrapper>
            <div className="grid gap-3">
              {getOptionDisplayOrder(field.options).map((originalIndex) => {
                const option = field.options?.[originalIndex];
                const checkedValues = Array.isArray(fieldValue) ? fieldValue : [];
                const isChecked = checkedValues.includes(String(originalIndex));
                return (
                  <label
                    key={originalIndex}
                    className={cn(
                      "flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer select-none",
                      isChecked 
                        ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20" 
                        : "border-input hover:bg-accent/50 hover:border-accent-foreground/30"
                    )}
                  >
                    <Checkbox
                      id={`${field.id}-${originalIndex}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                        if (checked) {
                          handleInputChange(field.id, [...currentValues, String(originalIndex)]);
                        } else {
                          handleInputChange(
                            field.id,
                            currentValues.filter((v) => v !== String(originalIndex))
                          );
                        }
                      }}
                      className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <span className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex-1",
                      isChecked ? "text-foreground" : "text-foreground/80"
                    )}>
                      {option || `Option ${originalIndex + 1}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </QuestionWrapper>
        );

      case "dropdown":
        return (
          <QuestionWrapper labelFor={field.id}>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleInputChange(field.id, value)}
              required={field.required}
            >
              <SelectTrigger id={field.id} className="h-11">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {getOptionDisplayOrder(field.options).map((originalIndex) => {
                  const option = field.options?.[originalIndex];
                  return (
                    <SelectItem key={originalIndex} value={String(originalIndex)}>
                      {option || `Option ${originalIndex + 1}`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </QuestionWrapper>
        );

      case "imageChoice":
        return (
          <QuestionWrapper>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {getOptionDisplayOrder(field.options).map((originalIndex) => {
                const option = field.options?.[originalIndex];
                const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
                const isSelected = selectedValues.includes(String(originalIndex));
                const imageUrl = option && option.startsWith("http") ? option : undefined;
                return (
                  <button
                    key={originalIndex}
                    type="button"
                    onClick={() => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (isSelected) {
                        handleInputChange(
                          field.id,
                          currentValues.filter((v) => v !== String(originalIndex))
                        );
                      } else {
                        handleInputChange(field.id, [...currentValues, String(originalIndex)]);
                      }
                    }}
                    className={cn(
                      "group relative border-2 rounded-xl p-1 overflow-hidden transition-all duration-200 text-left",
                      isSelected
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20 ring-offset-0"
                        : "border-muted hover:border-primary/50 hover:bg-accent/50"
                    )}
                  >
                    <div className="aspect-video sm:aspect-square rounded-lg overflow-hidden bg-muted/20 relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Choice ${originalIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground bg-muted/30">
                            Image {originalIndex + 1}
                          </div>
                        )}
                        
                        {/* Selection indicator overlay */}
                        <div className={cn(
                            "absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity duration-200",
                            isSelected ? "opacity-100" : "opacity-0"
                        )}>
                            <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg transform scale-100">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                    {!imageUrl && (
                        <div className="p-3 text-center font-medium text-sm">
                            {option || `Option ${originalIndex + 1}`}
                        </div>
                    )}
                  </button>
                );
              })}
            </div>
          </QuestionWrapper>
        );

      case "pageBreak":
        // Page breaks are handled by page splitting logic, not rendered
        return null;

      case "infoBlock":
        return (
          <Card className="mb-8 shadow-sm border-l-4 border-l-primary bg-muted/10">
            <CardContent className="pt-6 pb-6">
                {imageElement}
                {latexElement}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                   <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
                </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Sticky Header with Progress */}
      <div className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b shadow-sm transition-all">
           <div className="max-w-3xl mx-auto px-4 md:px-6 py-3">
               <div className="flex items-center justify-between mb-2">
                   <h1 className="text-sm font-semibold truncate pr-4 max-w-[200px] sm:max-w-md text-foreground/80">
                     {test.name || "Test"}
                   </h1>
                   <span className="text-xs text-muted-foreground font-medium whitespace-nowrap bg-secondary px-2 py-0.5 rounded-full">
                     Page {currentPage + 1} of {pages.length}
                   </span>
               </div>
               <div className="h-1.5 w-full bg-secondary/50 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-primary transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                    style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
                 />
               </div>
           </div>
       </div>

      <div className="flex-1 py-8 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-2 mb-10 animate-in fade-in slide-in-from-top-2 duration-500">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">{test.name || "Untitled Test"}</h1>
            {test.description && (
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{test.description}</p>
            )}
            
            {(userName || userEmail) && (
              <div className="flex flex-wrap gap-4 pt-3 text-sm text-muted-foreground/80 border-t mt-4 w-fit pr-8">
                  {userName && (
                      <div className="flex items-center gap-1.5">
                           <span className="font-medium text-foreground">Name:</span> {userName}
                      </div>
                  )}
                  {userEmail && (
                      <div className="flex items-center gap-1.5">
                          <span className="font-medium text-foreground">Email:</span> {userEmail}
                      </div>
                  )}
              </div>
            )}
          </div>

          {/* Countdown Timer */}
          {test.timeLimitMinutes && timeRemaining !== null && (
            <div className="mb-8 sticky top-20 z-30 pointer-events-none">
              <Card className={cn(
                "border shadow-md inline-block pointer-events-auto transition-colors duration-300",
                timeRemaining > 300 ? "border-green-500/20 bg-green-50/90 dark:bg-green-950/90" : 
                timeRemaining > 60 ? "border-yellow-500/20 bg-yellow-50/90 dark:bg-yellow-950/90" : 
                "border-red-500/20 bg-red-50/90 dark:bg-red-950/90 animate-pulse"
              )}>
                <CardContent className="py-2 px-4 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    Time Left
                  </span>
                  <span className={cn(
                    "text-xl font-bold tabular-nums font-mono",
                    timeRemaining > 300 ? "text-green-700 dark:text-green-400" : 
                    timeRemaining > 60 ? "text-yellow-700 dark:text-yellow-400" : 
                    "text-red-700 dark:text-red-400"
                  )}>
                    {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </CardContent>
              </Card>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 pb-24">
            {currentPageFieldsToShow.map((field, index) => (
              <div 
                key={field.id} 
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-backwards" 
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {renderField(field)}
              </div>
            ))}
            
            <div className="pt-8 flex gap-4 border-t mt-8 sticky bottom-0 bg-background/95 backdrop-blur p-4 -mx-4 md:-mx-6 md:px-6 border-t-border/50 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] z-30">
              {allowBackNavigation && currentPage > 0 && (
                <Button 
                  type="button" 
                  size="lg" 
                  variant="outline"
                  className="flex-1 md:flex-none min-w-[120px] h-12 text-base shadow-sm"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              {isLastPage ? (
                <Button 
                  type="submit" 
                  size="lg" 
                  className={cn(
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all h-12 text-base font-semibold",
                    allowBackNavigation && currentPage > 0 ? "flex-1" : "w-full"
                  )}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Submitting Test...
                    </>
                  ) : (
                    "Submit Test"
                  )}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  size="lg" 
                  className={cn(
                    "flex-1 md:flex-none min-w-[120px] h-12 text-base shadow-md ml-auto",
                    allowBackNavigation && currentPage > 0 ? "" : "w-full"
                  )}
                  onClick={handleContinue}
                >
                  Continue
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
