import { useState, useEffect, useRef } from "react";
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
import type { Id } from "../../../convex/_generated/dataModel";

type TestField = {
  id: string;
  type: "shortInput" | "longInput" | "multipleChoice" | "checkboxes" | "dropdown" | "imageChoice" | "fileUpload" | "pageBreak" | "infoBlock";
  label: string;
  required?: boolean;
  options?: string[];
  order: number;
  placeholder?: string;
  helpText?: string;
  minLength?: number;
  maxLength?: number;
};

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
  const [testStartedAt, setTestStartedAt] = useState<number | null>(null);
  const [submissionResult, setSubmissionResult] = useState<{
    score?: number;
    maxScore?: number;
    percentage?: number;
  } | null>(null);

  const test = useQuery(
    api.tests.getPublicTest,
    testId ? { testId } : "skip"
  );

  // Handle password verification
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (test?.password && password === test.password) {
      setIsPasswordVerified(true);
      setPasswordError("");
      // If password is verified, skip name/email collection and go directly to test
      setShowTest(true);
      setTestStartedAt(Date.now());
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEmail.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      setIsEmailProvided(true);
      setShowTest(true);
      setTestStartedAt(Date.now());
    }
  };

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowTest(true);
      setTestStartedAt(Date.now());
    }
  };

  // Loading state
  if (!testId || test === undefined) {
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
                Start Test
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Name collection screen (only if auth not required, password verified or no password, and test not shown)
  if (!test.requireAuth && !showTest && (!test.password || isPasswordVerified)) {
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

  // Show test form or success screen
  if (showTest && !submissionResult) {
    return (
      <TestForm 
        test={test} 
        userName={test.requireAuth ? undefined : userName}
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

  // Browser restrictions
  useEffect(() => {
    // Disable copy/paste
    const handleCopy = (e: ClipboardEvent) => {
      if (test.disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      if (test.disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (test.disableCopyPaste) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    // Disable context menu
    const handleContextMenu = (e: MouseEvent) => {
      if (test.disableCopyPaste) {
        e.preventDefault();
        return false;
      }
    };

    // Block tab switching
    let tabSwitchWarningShown = false;
    const handleVisibilityChange = () => {
      if (test.blockTabSwitching && document.hidden) {
        if (!tabSwitchWarningShown) {
          alert("Please do not switch tabs during the test.");
          tabSwitchWarningShown = true;
        }
      }
    };

    // Fullscreen requirement
    const requestFullscreen = async () => {
      if (test.requireFullScreen) {
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
          }
        } catch (error) {
          console.warn("Fullscreen request failed:", error);
          alert("Please enable fullscreen mode for this test.");
        }
      }
    };

    // Monitor fullscreen exit
    const handleFullscreenChange = () => {
      if (test.requireFullScreen) {
        const isFullscreen = !!(
          document.fullscreenElement ||
          (document as any).webkitFullscreenElement ||
          (document as any).mozFullScreenElement ||
          (document as any).msFullscreenElement
        );
        if (!isFullscreen) {
          alert("Please return to fullscreen mode to continue the test.");
          requestFullscreen();
        }
      }
    };

    // Apply restrictions
    if (test.disableCopyPaste) {
      document.addEventListener("copy", handleCopy);
      document.addEventListener("cut", handleCut);
      document.addEventListener("paste", handlePaste);
      document.addEventListener("contextmenu", handleContextMenu);
    }

    if (test.blockTabSwitching) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    if (test.requireFullScreen) {
      requestFullscreen();
      document.addEventListener("fullscreenchange", handleFullscreenChange);
      document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.addEventListener("mozfullscreenchange", handleFullscreenChange);
      document.addEventListener("MSFullscreenChange", handleFullscreenChange);
    }

    // Cleanup
    return () => {
      if (test.disableCopyPaste) {
        document.removeEventListener("copy", handleCopy);
        document.removeEventListener("cut", handleCut);
        document.removeEventListener("paste", handlePaste);
        document.removeEventListener("contextmenu", handleContextMenu);
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitTest({
        testId,
        responses: formData,
        respondentName: userName,
        respondentEmail: userEmail,
        startedAt,
      });

      onSubmissionComplete({
        score: result.score,
        maxScore: result.maxScore,
        percentage: result.percentage,
      });
    } catch (error) {
      console.error("Failed to submit test:", error);
      alert("Failed to submit test. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  const handleContinue = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      // Scroll to top when moving to next page
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
                      "border-2 rounded-lg p-4 aspect-square flex flex-col items-center justify-center transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="text-sm text-center">
                      {option || `Image ${index + 1}`}
                    </div>
                  </button>
                );
              })}
            </div>
            {field.helpText && (
              <p className="text-sm text-muted-foreground">{field.helpText}</p>
            )}
          </div>
        );

      case "fileUpload":
        return (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Click to upload or drag and drop
              </p>
              <input
                type="file"
                id={field.id}
                onChange={(e) => handleInputChange(field.id, e.target.files?.[0]?.name || "")}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(field.id)?.click()}
              >
                Choose File
              </Button>
              {fieldValue && (
                <p className="text-sm text-muted-foreground mt-2">Selected: {fieldValue}</p>
              )}
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
          <div className="pt-6">
            {isLastPage ? (
              <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
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
                className="w-full"
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
