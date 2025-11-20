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
import { Card } from "~/components/ui/card";
import { Loader2, CheckCircle, Trophy, Home, Clock, AlertCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "~/lib/utils";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import katex from "katex";
import "katex/dist/katex.min.css";
import { motion, AnimatePresence } from "motion/react";

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
  const authScreenAnimatedRef = useRef<string | null>(null);

  const test = useQuery(
    api.tests.getPublicTest,
    testId ? { testId } : "skip"
  );

  // Load saved progress
  useEffect(() => {
    if (!testId || test === undefined) {
      setIsLoadingSavedState(false);
      return;
    }
    
    const savedProgress = loadTestProgress(testId);
    
    if (savedProgress) {
      if (savedProgress.formData) setFormData(savedProgress.formData);
      if (savedProgress.isPasswordVerified !== undefined) setIsPasswordVerified(savedProgress.isPasswordVerified);
      if (savedProgress.isEmailProvided !== undefined) setIsEmailProvided(savedProgress.isEmailProvided);
      if (savedProgress.isNameProvided !== undefined) setIsNameProvided(savedProgress.isNameProvided);
      if (savedProgress.userName) setUserName(savedProgress.userName);
      if (savedProgress.userEmail) setUserEmail(savedProgress.userEmail);
      if (savedProgress.showTest !== undefined) setShowTest(savedProgress.showTest);
      if (savedProgress.testStartedAt !== undefined) setTestStartedAt(savedProgress.testStartedAt);
      if (savedProgress.shuffledFieldIds) setShuffledFieldIds(savedProgress.shuffledFieldIds);
      if (savedProgress.shuffledOptionsMapping) setShuffledOptionsMapping(savedProgress.shuffledOptionsMapping);
    }
    
    setIsLoadingSavedState(false);
    setTimeout(() => {
      hasInitialLoadCompletedRef.current = true;
    }, 100);
  }, [testId, test]);

  // Save progress
  useEffect(() => {
    if (!testId || isLoadingSavedState || !hasInitialLoadCompletedRef.current) return;
    
    const existing = loadTestProgress(testId) || {};
    const dataToSave = {
      ...existing,
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

  // Initialize randomization
  useEffect(() => {
    if (!test || isLoadingSavedState) return;

    let newShuffledFieldIds = shuffledFieldIds;
    let newShuffledOptionsMapping = shuffledOptionsMapping;
    let hasChanges = false;

    if (test.randomizeQuestions && !shuffledFieldIds && test.fields) {
      const fields = [...test.fields] as TestField[];
      const sortedFields = fields.sort((a, b) => a.order - b.order);
      
      const pages: TestField[][] = [];
      let currentPageFields: TestField[] = [];
      
      sortedFields.forEach((field) => {
        if (field.type === "pageBreak") {
          if (currentPageFields.length > 0) {
            pages.push(currentPageFields);
            currentPageFields = [];
          }
          pages.push([field]);
        } else {
          currentPageFields.push(field);
        }
      });
      
      if (currentPageFields.length > 0) pages.push(currentPageFields);

      const shuffledIds: string[] = [];
      
      pages.forEach(page => {
        if (page.length === 1 && page[0].type === "pageBreak") {
          shuffledIds.push(page[0].id);
        } else {
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

    if (hasChanges) {
      const existing = loadTestProgress(testId!) || {};
      saveTestProgress(testId!, {
        ...existing,
        shuffledFieldIds: newShuffledFieldIds,
        shuffledOptionsMapping: newShuffledOptionsMapping,
      });
    }
  }, [test, testId, isLoadingSavedState, shuffledFieldIds, shuffledOptionsMapping]);

  useEffect(() => {
    if (testId) {
      hasInitialLoadCompletedRef.current = false;
      authScreenAnimatedRef.current = null;
      setSubmissionResult(null);
    }
  }, [testId]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (test?.password && password === test.password) {
      setIsPasswordVerified(true);
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = userEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim());
    if (isValid) {
      setIsEmailProvided(true);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setIsNameProvided(true);
      if (!test?.requireFullScreen) {
        setShowTest(true);
        setTestStartedAt(Date.now());
      }
    }
  };

  useEffect(() => {
    const checkFullscreen = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );
      
      setIsFullscreenEnabled((prevFullscreen) => {
        if (test?.requireFullScreen && isFullscreen && !prevFullscreen && !showTest) {
          const hasPassword = !test.password || isPasswordVerified;
          const hasEmail = !test.requireAuth || isEmailProvided;
          const hasName = isNameProvided;

          if (hasPassword && hasEmail && hasName) {
            setShowTest(true);
            if (!testStartedAt) setTestStartedAt(Date.now());
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

  if (!testId || test === undefined || isLoadingSavedState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm font-medium">Loading assessment...</p>
        </div>
      </div>
    );
  }

  if (test === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <Card className="max-w-md w-full p-8 text-center border-t-4 border-red-600">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Worksheet Not Found</h2>
          <p className="text-gray-500">The assessment you're looking for doesn't exist or has been removed.</p>
        </Card>
      </div>
    );
  }

  // Auth Screen Wrapper
  const AuthScreen = ({ title, subtitle, children, image = true }: { title: string, subtitle: string, children: ReactNode, image?: boolean }) => {
    // Only animate if this is the first time we're showing this screen
    const shouldAnimate = authScreenAnimatedRef.current !== title;
    if (shouldAnimate) {
      authScreenAnimatedRef.current = title;
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50/50 px-4 py-12">
        <motion.div 
          key={title}
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
        <Card className="p-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center mb-8">
            {image && (
              <div className="flex justify-center mb-6">
                 <img 
                  src="/superlearn full.png" 
                  alt="Superlearn" 
                  className="h-8 object-contain opacity-90"
                />
              </div>
            )}
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500">{subtitle}</p>
          </div>
          {children}
        </Card>
      </motion.div>
    </div>
    );
  };

  if (test.password && !isPasswordVerified) {
    return (
      <AuthScreen title="Password Required" subtitle="This assessment is password protected.">
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError(""); }}
              placeholder="Enter access code"
              required
              autoFocus
              className="h-11"
            />
            {passwordError && <p className="text-sm text-red-500 font-medium">{passwordError}</p>}
          </div>
          <Button type="submit" className="w-full h-11 text-base">Continue</Button>
        </form>
      </AuthScreen>
    );
  }

  if (test.requireAuth && !isEmailProvided && (!test.password || isPasswordVerified)) {
    return (
      <AuthScreen title="Email Required" subtitle="Please enter your email address to begin.">
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoFocus
              className="h-11"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full h-11 text-base"
            disabled={!userEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())}
          >
            Continue
          </Button>
        </form>
      </AuthScreen>
    );
  }

  if (test.requireFullScreen && !isFullscreenEnabled && !submissionResult && (!test.password || isPasswordVerified) && 
      (test.requireAuth ? (isEmailProvided && isNameProvided) : isNameProvided)) {
    return (
      <AuthScreen title="Fullscreen Required" subtitle="This assessment requires fullscreen mode to ensure integrity.">
        <div className="space-y-4">
          <Button
            className="w-full h-11 text-base"
            onClick={async () => {
              try {
                const element = document.documentElement;
                if (element.requestFullscreen) await element.requestFullscreen();
                else if ((element as any).webkitRequestFullscreen) await (element as any).webkitRequestFullscreen();
                else if ((element as any).mozRequestFullScreen) await (element as any).mozRequestFullScreen();
                else if ((element as any).msRequestFullscreen) await (element as any).msRequestFullscreen();
                else toast.error("Fullscreen not supported");
              } catch (error) {
                toast.error("Please enable fullscreen manually (F11)");
              }
            }}
          >
            Enable Fullscreen
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Or press F11 on your keyboard
          </p>
        </div>
      </AuthScreen>
    );
  }

  if (!isNameProvided && (!test.password || isPasswordVerified) && (test.requireAuth ? isEmailProvided : true)) {
    return (
      <AuthScreen title="Welcome" subtitle="Please enter your full name to begin the assessment.">
        <form onSubmit={handleNameSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              required
              autoFocus
              className="h-11"
            />
          </div>
          <Button type="submit" className="w-full h-11 text-base" disabled={!userName.trim()}>
            Start Assessment
          </Button>
        </form>
      </AuthScreen>
    );
  }

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

  if (submissionResult) {
    const percentage = submissionResult.percentage ?? 0;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="max-w-md w-full"
        >
           <Card className="overflow-hidden shadow-xl border-0">
             <div className="bg-primary/5 p-8 text-center border-b border-border/50">
               <motion.div 
                 initial={{ scale: 0, rotate: -180 }}
                 animate={{ scale: 1, rotate: 0 }}
                 transition={{ type: "spring", damping: 20, stiffness: 200 }}
                 className="mx-auto mb-6 w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-black/5"
               >
                 {test.instantFeedback && submissionResult.score !== undefined && percentage >= 80 ? (
                   <Trophy className="h-10 w-10 text-yellow-500" />
                 ) : (
                   <CheckCircle className="h-10 w-10 text-primary" />
                 )}
               </motion.div>
               
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Completed</h2>
               <p className="text-gray-500">Your responses have been recorded successfully.</p>
             </div>

             <div className="p-8 space-y-8">
               {test.instantFeedback && submissionResult.score !== undefined ? (
                 <div className="flex flex-col items-center">
                   <div className="relative w-40 h-40 mb-8">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100" />
                        <motion.circle 
                          cx="50" cy="50" r="42" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          strokeLinecap="round"
                          className={cn("transition-colors duration-500", 
                            percentage >= 80 ? "text-green-500" :
                            percentage >= 60 ? "text-primary" : "text-orange-500"
                          )}
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: percentage / 100 }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          strokeDasharray="1"
                          strokeDashoffset="0"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900">{percentage}%</span>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Score</span>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4 w-full">
                     <div className="bg-gray-50 rounded-lg p-4 text-center">
                       <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Correct</div>
                       <div className="text-2xl font-bold text-gray-900">{submissionResult.score}</div>
                     </div>
                     <div className="bg-gray-50 rounded-lg p-4 text-center">
                       <div className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-1">Total</div>
                       <div className="text-2xl font-bold text-gray-900">{submissionResult.maxScore}</div>
                     </div>
                   </div>
                 </div>
               ) : (
                 <div className="bg-gray-50 rounded-lg p-6 text-center">
                   <p className="text-gray-600">
                     Thank you for completing this assessment. Your instructor will review your submission.
                   </p>
                 </div>
               )}

               <Button 
                 className="w-full h-12 text-base font-medium" 
                 onClick={() => navigate("/")}
                 size="lg"
               >
                 <Home className="w-4 h-4 mr-2" />
                 Return to Home
               </Button>
             </div>
           </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}

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
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-8 group"
  >
    <Card className="border shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6 md:p-8">
        <div className="flex gap-5">
          {questionNumber !== undefined && (
            <div className="flex-none">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                {questionNumber}
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            {imageElement}
            {latexElement}
            <div className="mb-6">
              <Label 
                htmlFor={labelFor} 
                className="text-lg font-semibold text-gray-900 block leading-relaxed mb-2"
              >
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {helpText && (
                <p className="text-sm text-gray-500">{helpText}</p>
              )}
            </div>
            <div className="space-y-4">
              {children}
            </div>
          </div>
        </div>
      </div>
    </Card>
  </motion.div>
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
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const submitTest = useMutation(api.tests.submitTest);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAutoSubmittedRef = useRef(false);
  const headerRef = useRef<HTMLDivElement>(null);
  
  const allowBackNavigation = test.allowBackNavigation !== undefined ? test.allowBackNavigation : true;

  useEffect(() => {
    isInitialLoadRef.current = true;
  }, [testId]);

  useEffect(() => {
    const savedProgress = loadTestProgress(testId);
    if (savedProgress && savedProgress.currentPage !== undefined) {
      setCurrentPage(savedProgress.currentPage);
    }
    setTimeout(() => {
      isInitialLoadRef.current = false;
    }, 100);
  }, [testId]);

  useEffect(() => {
    if (isInitialLoadRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const existing = loadTestProgress(testId) || {};
      saveTestProgress(testId, {
        ...existing,
        formData,
        currentPage,
      });
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [formData, testId, currentPage]);

  useEffect(() => {
    if (!test.timeLimitMinutes || isSubmitting) return;

    const updateTimeRemaining = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);
      const totalSeconds = test.timeLimitMinutes! * 60;
      const remaining = Math.max(0, totalSeconds - elapsed);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0 && !hasAutoSubmittedRef.current && !isSubmitting) {
        hasAutoSubmittedRef.current = true;
        toast.error("Time's up! Auto-submitting...");
        setTimeout(() => {
          const form = document.querySelector('form');
          if (form) form.requestSubmit();
        }, 500);
      }
    };

    updateTimeRemaining();
    timerIntervalRef.current = setInterval(updateTimeRemaining, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [test.timeLimitMinutes, startedAt, isSubmitting]);

  // Browser restrictions (Copy/Paste/Tab)
  useEffect(() => {
    const preventDefault = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) toast.warning("Please do not switch tabs during the assessment.");
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
        toast.warning("Please return to fullscreen mode.");
      }
    };

    if (test.disableCopyPaste) {
      document.addEventListener("copy", preventDefault as any, true);
      document.addEventListener("cut", preventDefault as any, true);
      document.addEventListener("paste", preventDefault as any, true);
      document.addEventListener("contextmenu", preventDefault as any, true);
    }

    if (test.blockTabSwitching) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    if (test.requireFullScreen) {
      document.addEventListener("fullscreenchange", handleFullscreenChange);
    }

    return () => {
      document.removeEventListener("copy", preventDefault as any, true);
      document.removeEventListener("cut", preventDefault as any, true);
      document.removeEventListener("paste", preventDefault as any, true);
      document.removeEventListener("contextmenu", preventDefault as any, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [test]);

  const handleInputChange = useCallback((fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  }, [setFormData]);

  const fieldsWithIndex = ((test.fields || []) as any[]).map((f, index): TestField & { originalIndex: number } => ({
    id: f.id,
    type: f.type,
    label: f.label,
    required: f.required,
    options: f.options,
    order: typeof f.order === 'number' && !isNaN(f.order) ? f.order : index,
    placeholder: f.placeholder,
    helpText: f.helpText,
    minLength: f.minLength,
    maxLength: f.maxLength,
    fileUrl: f.fileUrl,
    latexContent: f.latexContent,
    originalIndex: index,
  }));
  
  const fields = fieldsWithIndex.map(({ originalIndex, ...field }) => field) as TestField[];
  let sortedFields: TestField[];

  if (shuffledFieldIds) {
    const fieldMap = new Map(fieldsWithIndex.map(f => [f.id, f]));
    const shuffledWithIndex = shuffledFieldIds
      .map(id => fieldMap.get(id))
      .filter((f): f is TestField & { originalIndex: number } => f !== undefined);
      
    sortedFields = (shuffledWithIndex.length > 0 ? shuffledWithIndex : fieldsWithIndex)
      .map(({ originalIndex, ...field }) => field) as TestField[];
  } else {
    sortedFields = fieldsWithIndex
      .sort((a, b) => (a.order !== b.order ? a.order - b.order : a.originalIndex - b.originalIndex))
      .map(({ originalIndex, ...field }) => field) as TestField[];
  }
  
  const pages: TestField[][] = [];
  let currentPageFields: TestField[] = [];
  
  sortedFields.forEach((field) => {
    if (field.type === "pageBreak") {
      if (currentPageFields.length > 0) {
        pages.push(currentPageFields);
        currentPageFields = [];
      }
    } else {
      currentPageFields.push(field);
    }
  });
  
  if (currentPageFields.length > 0) pages.push(currentPageFields);
  const currentPageFieldsToShow = pages[currentPage] || [];
  const isLastPage = currentPage === pages.length - 1;

  const validateRequiredFields = (fieldsToValidate: TestField[]) => {
    const missingFields: string[] = [];
    for (const field of fieldsToValidate) {
      if (field.required) {
        const fieldValue = formData[field.id];
        let isEmpty = false;
        if (field.type === "shortInput" || field.type === "longInput") {
          isEmpty = !fieldValue || (typeof fieldValue === "string" && fieldValue.trim() === "");
        } else if (field.type === "multipleChoice" || field.type === "dropdown") {
          isEmpty = fieldValue === undefined || fieldValue === null || fieldValue === "";
        } else if (field.type === "checkboxes" || field.type === "imageChoice") {
          isEmpty = !fieldValue || (Array.isArray(fieldValue) && fieldValue.length === 0);
        }
        if (isEmpty) missingFields.push(field.label || field.id);
      }
    }
    return { isValid: missingFields.length === 0, missingFields };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allFields = sortedFields.filter(f => f.type !== "pageBreak" && f.type !== "infoBlock");
    const validation = validateRequiredFields(allFields);
    
    if (!validation.isValid) {
      toast.error(`Please complete: ${validation.missingFields.join(", ")}`);
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
      clearTestProgress(testId);
      onSubmissionComplete({
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
      });
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      const validation = validateRequiredFields(currentPageFieldsToShow);
      if (!validation.isValid) {
        toast.error(`Please complete: ${validation.missingFields.join(", ")}`);
        return;
      }
      if (currentPage < pages.length - 1) {
        setCurrentPage(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const questionNumberMap = new Map<string, number>();
  let qNum = 1;
  sortedFields.forEach(f => {
    if (f.type !== 'pageBreak' && f.type !== 'infoBlock') questionNumberMap.set(f.id, qNum++);
  });

  const renderField = (field: TestField) => {
    const rawValue = formData[field.id];
    const questionNumber = questionNumberMap.get(field.id);
    
    const getOptionDisplayOrder = (options: string[] = []) => {
      if (shuffledOptionsMapping && shuffledOptionsMapping[field.id]) {
        return shuffledOptionsMapping[field.id];
      }
      return options.map((_, i) => i);
    };

    const imageElement = field.fileUrl ? (
      <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
        <img src={field.fileUrl} alt="Attachment" className="max-h-[400px] w-full object-contain bg-gray-50" />
      </div>
    ) : null;

    const latexElement = field.latexContent ? (
      <div className="mb-4 overflow-x-auto p-2" dangerouslySetInnerHTML={{ 
        __html: katex.renderToString(field.latexContent, { throwOnError: false, displayMode: true }) 
      }} />
    ) : null;

    const commonProps = {
      labelFor: field.id,
      imageElement,
      latexElement,
      label: field.label,
      required: field.required,
      helpText: field.helpText,
      questionNumber,
    };

    switch (field.type) {
      case "shortInput":
        return (
          <QuestionWrapper {...commonProps}>
            <Input
              id={field.id}
              value={rawValue != null ? String(rawValue) : ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Your answer"}
              required={field.required}
              className="max-w-lg text-base"
              autoComplete="off"
            />
          </QuestionWrapper>
        );

      case "longInput":
        return (
          <QuestionWrapper {...commonProps}>
            <Textarea
              id={field.id}
              value={rawValue != null ? String(rawValue) : ""}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Type your answer here..."}
              required={field.required}
              className="min-h-[120px] text-base resize-y"
            />
          </QuestionWrapper>
        );

      case "multipleChoice":
        return (
          <QuestionWrapper {...commonProps}>
            <div className="space-y-2">
              {getOptionDisplayOrder(field.options).map((idx) => {
                const option = field.options?.[idx];
                const isSelected = rawValue === String(idx);
                return (
                  <div 
                    key={idx}
                    onClick={() => handleInputChange(field.id, String(idx))}
                    className={cn(
                      "flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors",
                      isSelected ? "border-primary bg-primary" : "border-gray-300"
                    )}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <span className="text-gray-800">{option || `Option ${idx + 1}`}</span>
                  </div>
                );
              })}
            </div>
          </QuestionWrapper>
        );

      case "checkboxes":
        return (
          <QuestionWrapper {...commonProps}>
            <div className="space-y-2">
              {getOptionDisplayOrder(field.options).map((idx) => {
                const option = field.options?.[idx];
                const checkedValues = Array.isArray(rawValue) ? rawValue : [];
                const isChecked = checkedValues.includes(String(idx));
                return (
                  <div 
                    key={idx}
                    onClick={() => {
                      const newValues = isChecked 
                        ? checkedValues.filter((v: string) => v !== String(idx))
                        : [...checkedValues, String(idx)];
                      handleInputChange(field.id, newValues);
                    }}
                    className={cn(
                      "flex items-center p-3 rounded-lg border cursor-pointer transition-all duration-200",
                      isChecked ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors",
                      isChecked ? "border-primary bg-primary text-white" : "border-gray-300"
                    )}>
                      {isChecked && <CheckCircle className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-gray-800">{option || `Option ${idx + 1}`}</span>
                  </div>
                );
              })}
            </div>
          </QuestionWrapper>
        );

      case "dropdown":
        return (
          <QuestionWrapper {...commonProps}>
            <Select
              value={rawValue != null ? String(rawValue) : undefined}
              onValueChange={(value) => handleInputChange(field.id, value)}
              required={field.required}
            >
              <SelectTrigger className="max-w-lg text-base h-11">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {getOptionDisplayOrder(field.options).map((idx) => (
                  <SelectItem key={idx} value={String(idx)}>
                    {field.options?.[idx] || `Option ${idx + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </QuestionWrapper>
        );

      case "imageChoice":
        return (
          <QuestionWrapper {...commonProps}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {getOptionDisplayOrder(field.options).map((idx) => {
                const option = field.options?.[idx];
                const currentValues = Array.isArray(rawValue) ? rawValue : [];
                const isSelected = currentValues.includes(String(idx));
                const isUrl = option && option.startsWith("http");

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      const newValues = isSelected
                        ? currentValues.filter((v: string) => v !== String(idx))
                        : [...currentValues, String(idx)];
                      handleInputChange(field.id, newValues);
                    }}
                    className={cn(
                      "relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:shadow-md group",
                      isSelected ? "border-primary ring-1 ring-primary" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="aspect-square bg-gray-50 relative">
                      {isUrl ? (
                        <img src={option} alt={`Option ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Option {idx + 1}
                        </div>
                      )}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                          <div className="bg-primary text-white rounded-full p-1 shadow-sm">
                            <CheckCircle className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                    </div>
                    {!isUrl && (
                      <div className="p-2 text-center text-sm font-medium border-t bg-white">
                        {option}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </QuestionWrapper>
        );

      case "infoBlock":
        return (
          <div className="mb-8 p-6 bg-blue-50/50 rounded-lg border border-blue-100">
             {imageElement}
             {latexElement}
             <h3 className="text-lg font-semibold text-gray-900 mb-2">{field.label}</h3>
             <div className="prose prose-sm text-gray-600 max-w-none">
               {/* Additional info content could go here if we had a description field */}
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  const progress = Math.round(((currentPage + 1) / pages.length) * 100);

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
       {/* Sticky Header */}
       <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
         <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                   S
                 </div>
                 <div className="hidden sm:block">
                   <h1 className="font-semibold text-gray-900 text-sm leading-tight truncate max-w-[200px]">
                     {test.name || "Assessment"}
                   </h1>
                 </div>
             </div>

             <div className="flex items-center gap-4">
                {test.timeLimitMinutes && timeRemaining !== null && (
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium font-mono transition-colors",
                    timeRemaining < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-gray-100 text-gray-700"
                  )}>
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:
                      {(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-end min-w-[60px]">
                   <span className="text-xs font-medium text-gray-500">
                     {Math.round(progress)}%
                   </span>
                   <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                     <div 
                       className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                       style={{ width: `${progress}%` }}
                     />
                   </div>
                </div>
             </div>
         </div>
       </div>

       <div className="flex-1 py-8 px-4" ref={headerRef}>
         <div className="max-w-3xl mx-auto">
            {/* Intro/Context for the current page */}
            <div className="mb-8">
               <h2 className="text-2xl font-bold text-gray-900 mb-2">
                 {pages.length > 1 ? `Section ${currentPage + 1}` : (test.name || "Questions")}
               </h2>
               {currentPage === 0 && test.description && (
                 <p className="text-gray-600 leading-relaxed">{test.description}</p>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentPageFieldsToShow.map((field) => (
                    <div key={field.id}>
                       {renderField(field)}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200">
                 <div>
                   {allowBackNavigation && currentPage > 0 && (
                     <Button 
                       type="button" 
                       variant="outline" 
                       onClick={() => handlePageChange('prev')}
                       className="gap-2 pl-2.5"
                     >
                       <ChevronLeft className="w-4 h-4" />
                       Back
                     </Button>
                   )}
                 </div>
                 
                 {isLastPage ? (
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="min-w-[140px] gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Assessment"}
                    </Button>
                 ) : (
                     <Button 
                       type="button" 
                       onClick={() => handlePageChange('next')}
                       className="gap-2 pr-2.5"
                     >
                       Next
                       <ChevronRight className="w-4 h-4" />
                     </Button>
                 )}
              </div>
            </form>
         </div>
       </div>
    </div>
  );
}
