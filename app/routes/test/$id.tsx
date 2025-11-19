import { useState, useEffect, useRef, useCallback, memo } from "react";
import type { ReactNode } from "react";
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
import { Loader2, CheckCircle, Trophy, Home } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import katex from "katex";
import "katex/dist/katex.min.css";
import { motion } from "motion/react";

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
      <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-xl rounded-sm border-t-4 border-red-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Worksheet Not Found</h2>
            <p className="text-slate-500 font-serif italic">The worksheet you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  // Password protection screen (only show if password exists and not verified)
  if (test.password && !isPasswordVerified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-xl rounded-sm border-t-4 border-slate-900">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-12 object-contain grayscale opacity-80"
              />
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Password Required</h2>
            <p className="text-slate-500 font-serif italic">This worksheet is password protected.</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="font-serif font-bold text-slate-700">Password</Label>
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
                className="border-0 border-b-2 border-slate-200 rounded-none focus:ring-0 focus:border-slate-900 px-0 bg-transparent font-serif text-lg"
              />
              {passwordError && (
                <p className="text-sm text-red-500 font-serif italic">{passwordError}</p>
              )}
            </div>
            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-none font-serif h-12 text-lg">
              Continue
            </Button>
          </form>
        </div>
    </div>
    );
  }

  // Email collection screen (if requireAuth is enabled and email not provided, and password verified or no password)
  if (test.requireAuth && !isEmailProvided && (!test.password || isPasswordVerified)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-xl rounded-sm border-t-4 border-slate-900">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-12 object-contain grayscale opacity-80"
              />
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Email Required</h2>
            <p className="text-slate-500 font-serif italic">Please enter your email address to begin.</p>
          </div>
          
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-serif font-bold text-slate-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoFocus
                className="border-0 border-b-2 border-slate-200 rounded-none focus:ring-0 focus:border-slate-900 px-0 bg-transparent font-serif text-lg"
              />
            </div>
            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-none font-serif h-12 text-lg" disabled={!userEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())}>
              Continue
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // Fullscreen required screen (if fullscreen is required and not enabled yet)
  // Only show after name/email has been collected, but not after submission
  if (test.requireFullScreen && !isFullscreenEnabled && !submissionResult && (!test.password || isPasswordVerified) && 
      (test.requireAuth ? (isEmailProvided && isNameProvided) : isNameProvided)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-xl rounded-sm border-t-4 border-slate-900">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-12 object-contain grayscale opacity-80"
              />
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Fullscreen Required</h2>
            <p className="text-slate-500 font-serif italic">
              This worksheet requires fullscreen mode. Please enable fullscreen to continue.
            </p>
          </div>
          <div className="space-y-4">
            <Button
              className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-none font-serif h-12 text-lg"
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
            <p className="text-sm text-slate-400 text-center font-serif italic">
              You can also press F11 to enable fullscreen mode
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Name collection screen (show if name not provided yet)
  // If requireAuth is true, show after email is provided
  // If requireAuth is false, show after password (if any) is verified
  if (!isNameProvided && (!test.password || isPasswordVerified) && 
      (test.requireAuth ? isEmailProvided : true)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-xl rounded-sm border-t-4 border-slate-900">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="/superlearn full.png" 
                alt="Superlearn" 
                className="h-12 object-contain grayscale opacity-80"
              />
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 mb-2">Welcome</h2>
            <p className="text-slate-500 font-serif italic">Please enter your full name to begin.</p>
          </div>
          
          <form onSubmit={handleNameSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-serif font-bold text-slate-700">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                required
                autoFocus
                className="border-0 border-b-2 border-slate-200 rounded-none focus:ring-0 focus:border-slate-900 px-0 bg-transparent font-serif text-lg"
              />
            </div>
            <Button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-none font-serif h-12 text-lg" disabled={!userName.trim()}>
              Start Worksheet
            </Button>
          </form>
        </div>
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
    const percentage = submissionResult.percentage ?? 0;
    const score = submissionResult.score ?? 0;
    const maxScore = submissionResult.maxScore ?? 0;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md w-full"
        >
           <div className="bg-white shadow-xl rounded-sm border-t-4 border-slate-900 overflow-hidden relative">
             
             <div className="text-center pt-12 pb-4 relative z-10 px-8">
               <motion.div 
                 initial={{ scale: 0, rotate: -180 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ delay: 0.2, type: "spring", damping: 18, stiffness: 200 }}
                 className="mx-auto mb-6 w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center shadow-inner ring-1 ring-slate-200"
               >
                 {test.instantFeedback && submissionResult.score !== undefined && percentage >= 80 ? (
                   <Trophy className="h-12 w-12 text-slate-900 drop-shadow-sm" strokeWidth={1.5} />
                 ) : (
                   <CheckCircle className="h-12 w-12 text-slate-900 drop-shadow-sm" strokeWidth={2} />
                 )}
               </motion.div>
               
               <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
               >
                  <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight font-serif">Worksheet Completed</h2>
                  <p className="text-lg text-slate-500 font-serif italic">
                    Your responses have been recorded.
                  </p>
               </motion.div>
             </div>

             <div className="space-y-8 pb-10 px-8 relative z-10">
               {test.instantFeedback && submissionResult.score !== undefined ? (
                 <div className="flex flex-col items-center">
                   {/* Circular Progress */}
                   <div className="relative w-52 h-52 mb-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* Background circle */}
                        <circle 
                          cx="50" cy="50" r="42" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          className="text-slate-100" 
                        />
                        {/* Progress circle */}
                        <motion.circle 
                          cx="50" cy="50" r="42" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="6" 
                          strokeLinecap="round"
                          className={cn(
                            "transition-colors duration-300",
                            percentage >= 80 ? "text-slate-900" :
                            percentage >= 60 ? "text-slate-700" :
                            percentage >= 40 ? "text-slate-500" :
                            "text-slate-400"
                          )}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: percentage / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                          strokeDasharray="1"
                          strokeDashoffset="0"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span 
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1, type: "spring" }}
                          className="text-5xl font-black text-slate-900 tracking-tighter font-serif"
                        >
                          {percentage}%
                        </motion.span>
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Score</span>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 w-full">
                     <motion.div 
                       initial={{ opacity: 0, x: -20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.6 }}
                       className="bg-slate-50 rounded-sm p-4 text-center border border-slate-100"
                     >
                       <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">Correct</div>
                       <div className="text-2xl font-black text-slate-900 font-serif">{score}</div>
                     </motion.div>
                     <motion.div 
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       transition={{ delay: 0.7 }}
                       className="bg-slate-50 rounded-sm p-4 text-center border border-slate-100"
                     >
                       <div className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-1.5">Total</div>
                       <div className="text-2xl font-black text-slate-900 font-serif">{maxScore}</div>
                     </motion.div>
                   </div>
                 </div>
               ) : (
                 <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-50 rounded-sm p-8 text-center border border-slate-100 mx-2"
                 >
                   <p className="text-slate-600 leading-relaxed font-serif">
                     Thank you for completing this worksheet. Your instructor will review your submission.
                   </p>
                 </motion.div>
               )}

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.8 }}
                 className="pt-2"
               >
                 <Button 
                   className="w-full h-14 text-lg font-bold font-serif shadow-none hover:bg-slate-800 bg-slate-900 text-white rounded-none gap-2 group" 
                   onClick={() => navigate("/")}
                   size="lg"
                 >
                   <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                   Return to Home
                 </Button>
               </motion.div>
             </div>
           </div>
           
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1.2 }}
             className="text-center mt-8 text-sm font-bold text-slate-300 uppercase tracking-widest"
           >
             Powered by Superlearn
           </motion.div>
        </motion.div>
      </div>
    );
  }

  return null;
}

// Helper component to wrap questions in a consistent worksheet style
// Defined outside TestForm to prevent recreation on every render
const QuestionWrapper = memo(({ 
  children, 
  labelFor, 
  imageElement, 
  latexElement, 
  label, 
  required, 
  helpText,
  questionNumber
}: { 
  children: ReactNode; 
  labelFor?: string;
  imageElement?: ReactNode;
  latexElement?: ReactNode;
  label: string;
  required?: boolean;
  helpText?: string;
  questionNumber?: number;
}) => (
  <div className="mb-10 group">
    <div className="flex gap-4">
      {questionNumber !== undefined && (
        <div className="flex-none pt-1">
          <span className="font-serif text-lg font-bold text-slate-400 select-none">
            {questionNumber}.
          </span>
        </div>
      )}
      <div className="flex-1 space-y-4">
        {imageElement}
        {latexElement}
        <div className="space-y-2">
          <Label 
            htmlFor={labelFor} 
            className={cn(
              "text-lg font-medium leading-snug block text-slate-900 group-hover:text-black transition-colors font-serif",
              labelFor ? "cursor-pointer" : ""
            )}
          >
            {label}
            {required && <span className="text-red-500 ml-1" title="Required field">*</span>}
          </Label>
          {helpText && (
            <p className="text-sm text-slate-500 font-normal leading-relaxed italic">{helpText}</p>
          )}
        </div>
        <div className="pt-2">
          {children}
        </div>
      </div>
    </div>
  </div>
));

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

  const handleInputChange = useCallback((fieldId: string, value: any) => {
    setFormData((prev) => {
      // Create a new object to ensure React detects the change
      const newFormData = { ...prev };
      newFormData[fieldId] = value;
      return newFormData;
    });
  }, [setFormData]);

  // Split fields into pages based on page breaks
  // Ensure all field properties are preserved, including fileUrl and latexContent
  // Create fields array and preserve original index for stable sorting
  const fieldsWithIndex = ((test.fields || []) as any[]).map((f, index): TestField & { originalIndex: number } => ({
    id: f.id,
    type: f.type,
    label: f.label,
    required: f.required,
    options: f.options,
    // Ensure order is always a number - use provided order or fall back to index
    order: typeof f.order === 'number' && !isNaN(f.order) ? f.order : index,
    placeholder: f.placeholder,
    helpText: f.helpText,
    minLength: f.minLength,
    maxLength: f.maxLength,
    fileUrl: f.fileUrl,
    latexContent: f.latexContent,
    originalIndex: index, // Preserve original position for stable sort
  }));
  
  const fields = fieldsWithIndex.map(({ originalIndex, ...field }) => field) as TestField[];
  
  // Use shuffled order if available, otherwise sort by order
  let sortedFields: TestField[];
  if (shuffledFieldIds) {
    // Create a map for O(1) lookup
    const fieldMap = new Map(fieldsWithIndex.map(f => [f.id, f]));
    // Map shuffled IDs to fields, filtering out any that might be missing (shouldn't happen)
    const shuffledWithIndex = shuffledFieldIds
      .map(id => fieldMap.get(id))
      .filter((f): f is TestField & { originalIndex: number } => f !== undefined);
      
    // If for some reason shuffledFields is empty or missing fields (e.g. schema change), fall back to default sort
    if (shuffledWithIndex.length === 0 && fields.length > 0) {
      sortedFields = fieldsWithIndex
        .sort((a, b) => {
          // Primary sort: by order field
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          // Secondary sort: by original index (stable sort)
          return a.originalIndex - b.originalIndex;
        })
        .map(({ originalIndex, ...field }) => field) as TestField[];
    } else {
      sortedFields = shuffledWithIndex.map(({ originalIndex, ...field }) => field) as TestField[];
    }
  } else {
    // Stable sort by order, then by original index
    sortedFields = fieldsWithIndex
      .sort((a, b) => {
        // Primary sort: by order field
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        // Secondary sort: by original index (stable sort)
        return a.originalIndex - b.originalIndex;
      })
      .map(({ originalIndex, ...field }) => field) as TestField[];
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

  // Calculate question numbers
  const questionNumberMap = new Map<string, number>();
  let qNum = 1;
  sortedFields.forEach(f => {
    if (f.type !== 'pageBreak' && f.type !== 'infoBlock') {
      questionNumberMap.set(f.id, qNum++);
    }
  });

  const renderField = (field: TestField) => {
    // Get the raw value from formData
    const rawValue = formData[field.id];
    const questionNumber = questionNumberMap.get(field.id);
    
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
      <div className="mb-4 rounded-sm overflow-hidden flex justify-start">
        <img 
          src={fileUrl} 
          alt="Question attachment" 
          className="max-h-[400px] max-w-full object-contain"
        />
      </div>
    ) : null;

    const latexElement = latexContent ? (
      <div 
        className="mb-4 overflow-x-auto"
        dangerouslySetInnerHTML={{ 
          __html: katex.renderToString(latexContent, { 
            throwOnError: false,
            displayMode: true 
          }) 
        }}
      />
    ) : null;

    switch (field.type) {
      case "shortInput":
        const shortInputValue = rawValue != null ? String(rawValue) : "";
        return (
          <QuestionWrapper 
            labelFor={field.id}
            imageElement={imageElement}
            latexElement={latexElement}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            questionNumber={questionNumber}
          >
            <input
              id={field.id}
              value={shortInputValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Answer"}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className="w-full max-w-md border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-xl placeholder:text-slate-300 focus:ring-0 focus:border-slate-800 focus:outline-none rounded-none transition-colors font-serif text-slate-800"
              autoComplete="off"
            />
          </QuestionWrapper>
        );

      case "longInput":
        const longInputValue = rawValue != null ? String(rawValue) : "";
        return (
          <QuestionWrapper 
            labelFor={field.id}
            imageElement={imageElement}
            latexElement={latexElement}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            questionNumber={questionNumber}
          >
            <div className="relative">
              <textarea
                id={field.id}
                value={longInputValue}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder || "Write your answer here..."}
                required={field.required}
                minLength={field.minLength}
                maxLength={field.maxLength}
                className="w-full min-h-[160px] resize-y border-0 border-b-2 border-slate-200 bg-transparent px-0 py-2 text-xl leading-8 placeholder:text-slate-300 focus:ring-0 focus:border-slate-800 focus:outline-none rounded-none transition-colors font-serif text-slate-800"
                style={{
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e2e8f0 31px, #e2e8f0 32px)',
                  backgroundAttachment: 'local',
                  lineHeight: '32px',
                  paddingTop: '0px'
                }}
              />
            </div>
          </QuestionWrapper>
        );

      case "multipleChoice":
        return (
          <QuestionWrapper
            imageElement={imageElement}
            latexElement={latexElement}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            questionNumber={questionNumber}
          >
            <div className="grid gap-3 pt-2">
              {getOptionDisplayOrder(field.options).map((originalIndex) => {
                const option = field.options?.[originalIndex];
                const isSelected = rawValue === String(originalIndex);
                return (
                  <label
                    key={originalIndex}
                    className={cn(
                      "flex items-start space-x-4 cursor-pointer group/option"
                    )}
                  >
                    <div className="flex items-center justify-center shrink-0 mt-1">
                      <div className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        isSelected ? "border-slate-900" : "border-slate-300 group-hover/option:border-slate-400"
                      )}>
                        {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-slate-900" />}
                      </div>
                      <input
                        type="radio"
                        id={`${field.id}-${originalIndex}`}
                        name={field.id}
                        value={String(originalIndex)}
                        checked={isSelected}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                        className="sr-only"
                      />
                    </div>
                    <span className={cn(
                      "text-lg leading-relaxed font-serif",
                      isSelected ? "text-slate-900 font-medium" : "text-slate-700"
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
          <QuestionWrapper
            imageElement={imageElement}
            latexElement={latexElement}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            questionNumber={questionNumber}
          >
            <div className="grid gap-3 pt-2">
              {getOptionDisplayOrder(field.options).map((originalIndex) => {
                const option = field.options?.[originalIndex];
                const checkedValues = Array.isArray(rawValue) ? rawValue : [];
                const isChecked = checkedValues.includes(String(originalIndex));
                return (
                  <label
                    key={originalIndex}
                    className={cn(
                      "flex items-start space-x-4 cursor-pointer group/option"
                    )}
                  >
                     <div className="flex items-center justify-center shrink-0 mt-1">
                      <div className={cn(
                        "h-5 w-5 rounded-sm border-2 flex items-center justify-center transition-colors",
                        isChecked ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 group-hover/option:border-slate-400"
                      )}>
                        {isChecked && <CheckCircle className="h-3.5 w-3.5" />}
                      </div>
                      <Checkbox
                        id={`${field.id}-${originalIndex}`}
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const currentValues = Array.isArray(rawValue) ? rawValue : [];
                          if (checked) {
                            handleInputChange(field.id, [...currentValues, String(originalIndex)]);
                          } else {
                            handleInputChange(
                              field.id,
                              currentValues.filter((v) => v !== String(originalIndex))
                            );
                          }
                        }}
                        className="sr-only"
                      />
                    </div>
                    <span className={cn(
                      "text-lg leading-relaxed font-serif",
                      isChecked ? "text-slate-900 font-medium" : "text-slate-700"
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
        const dropdownValue = rawValue != null ? String(rawValue) : undefined;
        return (
          <QuestionWrapper 
            labelFor={field.id}
            imageElement={imageElement}
            latexElement={latexElement}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            questionNumber={questionNumber}
          >
            <Select
              value={dropdownValue}
              onValueChange={(value) => handleInputChange(field.id, value)}
              required={field.required}
            >
              <SelectTrigger id={field.id} className="w-full max-w-md h-12 border-0 border-b-2 border-slate-200 bg-transparent px-0 text-lg rounded-none focus:ring-0 focus:border-slate-900 focus:outline-none font-serif">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {getOptionDisplayOrder(field.options).map((originalIndex) => {
                  const option = field.options?.[originalIndex];
                  return (
                    <SelectItem key={originalIndex} value={String(originalIndex)} className="font-serif">
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
          <QuestionWrapper
            imageElement={imageElement}
            latexElement={latexElement}
            label={field.label}
            required={field.required}
            helpText={field.helpText}
            questionNumber={questionNumber}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {getOptionDisplayOrder(field.options).map((originalIndex) => {
                const option = field.options?.[originalIndex];
                const selectedValues = Array.isArray(rawValue) ? rawValue : [];
                const isSelected = selectedValues.includes(String(originalIndex));
                const imageUrl = option && option.startsWith("http") ? option : undefined;
                return (
                  <button
                    key={originalIndex}
                    type="button"
                    onClick={() => {
                      const currentValues = Array.isArray(rawValue) ? rawValue : [];
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
                      "group relative border-2 rounded-sm p-2 overflow-hidden transition-all duration-200 text-left",
                      isSelected
                        ? "border-slate-900 ring-1 ring-slate-900"
                        : "border-slate-200 hover:border-slate-400"
                    )}
                  >
                    <div className="aspect-video sm:aspect-square rounded-sm overflow-hidden bg-slate-50 relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={`Choice ${originalIndex + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-sm text-slate-400 font-serif">
                            Image {originalIndex + 1}
                          </div>
                        )}
                        
                        {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                            <div className="h-12 w-12 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                        </div>
                        )}
                    </div>
                    {!imageUrl && (
                        <div className="p-3 text-center font-medium text-lg font-serif">
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
        return null;

      case "infoBlock":
        return (
          <div className="mb-10 p-6 bg-slate-50 border-l-4 border-slate-300">
             {imageElement}
             {latexElement}
             <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-bold font-serif mb-2">{field.label}</h3>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans print:bg-white">
       {/* Clean minimal header */}
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50 print:hidden">
           <div className="flex items-center gap-4">
               <div className="h-8 w-8 bg-slate-900 rounded-none flex items-center justify-center text-white font-bold text-sm">S</div>
               <h1 className="text-lg font-bold text-slate-800 hidden sm:block font-serif">{test.name || "Test"}</h1>
           </div>
           <div className="flex items-center gap-4 text-sm text-slate-500 font-serif">
                {test.timeLimitMinutes && timeRemaining !== null && (
                    <div className={cn("font-mono font-bold px-3 py-1 rounded bg-slate-100 border border-slate-200", timeRemaining < 60 ? "text-red-600 bg-red-50 border-red-200" : "text-slate-700")}>
                        {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </div>
                )}
                <span>Page {currentPage + 1} of {pages.length}</span>
           </div>
       </div>

       <div className="flex-1 py-8 md:py-12 px-4 md:px-6 flex justify-center print:p-0">
         <div className="max-w-4xl w-full bg-white shadow-xl min-h-[800px] relative mx-auto print:shadow-none print:w-full print:min-h-0">
            {/* Worksheet Header */}
            <div className="border-b-2 border-slate-900 p-8 md:p-12 pb-6">
                <div className="flex justify-between items-start mb-8">
                    <div>
                         <h1 className="text-4xl font-black text-slate-900 mb-2 font-serif tracking-tight">{test.name || "Untitled Worksheet"}</h1>
                         {test.description && <p className="text-slate-500 italic font-serif max-w-2xl leading-relaxed">{test.description}</p>}
                    </div>
                    <div className="text-right hidden md:block">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Date</div>
                        <div className="h-8 border-b-2 border-slate-300 min-w-[160px] font-serif text-lg text-slate-800">
                            {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
                
                {(userName || userEmail) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Name</div>
                            <div className="border-b-2 border-slate-300 py-1 font-serif text-xl text-slate-900 min-h-[36px]">
                                {userName || "Anonymous"}
                            </div>
                        </div>
                        {userEmail && (
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Email</div>
                                <div className="border-b-2 border-slate-300 py-1 font-serif text-xl text-slate-900 min-h-[36px]">
                                    {userEmail}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-8 md:p-12">
                <form onSubmit={handleSubmit} className="space-y-10">
                    {currentPageFieldsToShow.map((field, index) => (
                         <div key={field.id}>
                            {renderField(field)}
                         </div>
                    ))}

                    {/* Navigation */}
                    <div className="pt-12 mt-12 border-t border-slate-100 flex justify-between items-center print:hidden">
                         {allowBackNavigation && currentPage > 0 ? (
                             <Button type="button" variant="ghost" onClick={handleBack} className="font-serif text-slate-500 hover:text-slate-900 hover:bg-slate-50">
                                 &larr; Previous Page
                             </Button>
                         ) : <div />}
                         
                         {isLastPage ? (
                            <Button type="submit" size="lg" disabled={isSubmitting} className="bg-slate-900 text-white hover:bg-slate-800 rounded-none px-8 font-serif shadow-none">
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                                Submit Worksheet
                            </Button>
                         ) : (
                             <Button type="button" variant="ghost" onClick={handleContinue} className="font-serif text-slate-900 hover:bg-slate-50 font-bold">
                                 Next Page &rarr;
                             </Button>
                         )}
                    </div>
                </form>
            </div>
         </div>
       </div>
    </div>
  );
}
