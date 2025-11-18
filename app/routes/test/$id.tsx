import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { useParams, useNavigate } from "react-router";
import { useAuth } from "@clerk/react-router";
import { api } from "../../../convex/_generated/api";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Loader2 } from "lucide-react";
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
  const { isSignedIn, userId } = useAuth();
  const testId = params.id as Id<"tests"> | undefined;

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [showTest, setShowTest] = useState(false);
  const [isPasswordVerified, setIsPasswordVerified] = useState(false);

  const test = useQuery(
    api.tests.getPublicTest,
    testId ? { testId } : "skip"
  );

  // Handle authentication requirement
  useEffect(() => {
    if (test && test.requireAuth && !isSignedIn) {
      const returnUrl = `/test/${testId}`;
      navigate(`/sign-in?redirect_url=${encodeURIComponent(returnUrl)}`);
    }
  }, [test, isSignedIn, testId, navigate]);

  // If auth is required and user is signed in, or auth is not required, proceed
  const canProceed = test && (
    (test.requireAuth && isSignedIn) || 
    (!test.requireAuth)
  );

  // Handle password verification
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (test?.password && password === test.password) {
      setIsPasswordVerified(true);
      setPasswordError("");
      if (!test.requireAuth) {
        setShowTest(true);
      }
    } else {
      setPasswordError("Incorrect password. Please try again.");
    }
  };

  // Handle name submission
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) {
      setShowTest(true);
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

  // Password protection screen
  if (test.password && !isPasswordVerified && canProceed) {
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

  // Name collection screen (only if auth not required and password verified or no password)
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

  // Show test form
  if (showTest || (test.requireAuth && isSignedIn && (!test.password || isPasswordVerified))) {
    return (
      <TestForm 
        test={test} 
        userName={test.requireAuth ? undefined : userName}
        formData={formData}
        setFormData={setFormData}
      />
    );
  }

  return null;
}

function TestForm({
  test,
  userName,
  formData,
  setFormData,
}: {
  test: NonNullable<ReturnType<typeof useQuery<typeof api.tests.getPublicTest>>>;
  userName?: string;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
}) {
  const [currentPage, setCurrentPage] = useState(0);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit test responses
    console.log("Test submitted:", formData);
    alert("Test submitted! (This is a placeholder - submission logic to be implemented)");
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
              <Button type="submit" size="lg" className="w-full">
                Submit Test
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

