import { useState } from "react";
import { Form, useNavigate } from "react-router";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Clock, FileCheck, Eye, EyeOff } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

interface TestStartScreenProps {
  project: Doc<"projects">;
  options: Doc<"project_options"> | null;
  fieldsCount: number;
}

export function TestStartScreen({
  project,
  options,
  fieldsCount,
}: TestStartScreenProps) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createSubmission = useMutation(api.submissions.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!name.trim()) {
        setError("Please enter your name");
        setIsSubmitting(false);
        return;
      }

      if (options?.requireLogin && !email.trim()) {
        setError("Please enter your email");
        setIsSubmitting(false);
        return;
      }

      // Check password if required
      if (options?.password && password !== options.password) {
        setError("Incorrect password");
        setIsSubmitting(false);
        return;
      }

      // Check email domain restriction
      if (options?.allowedDomain && email) {
        const emailDomain = email.split("@")[1];
        if (emailDomain !== options.allowedDomain) {
          setError(`Only ${options.allowedDomain} emails are allowed`);
          setIsSubmitting(false);
          return;
        }
      }

      // Create submission
      const submissionId = await createSubmission({
        projectId: project._id,
        respondentName: name,
        respondentEmail: email || undefined,
      });

      // Navigate to test taking view
      navigate(
        `/take/${project.publishedUrl}/${submissionId}`,
        { replace: true }
      );
    } catch (err) {
      console.error("Error starting test:", err);
      setError("Failed to start test. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-muted-foreground">
              {project.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Test Information */}
          <div className="space-y-3 rounded-lg border bg-secondary/50 p-4">
            <h3 className="font-medium">Test Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Questions:</span>
                <span className="font-medium text-foreground">
                  {fieldsCount}
                </span>
              </div>
              {options?.timeLimit && (
                <div className="flex items-center justify-between">
                  <span>Time Limit:</span>
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <Clock className="h-3 w-3" />
                    {options.timeLimit} minutes
                  </span>
                </div>
              )}
              {options?.showProgressBar && (
                <div className="flex items-center justify-between">
                  <span>Progress Bar:</span>
                  <span className="font-medium text-foreground">Enabled</span>
                </div>
              )}
            </div>
          </div>

          {/* Start Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Email (conditional) */}
            {(options?.requireLogin || options?.allowedDomain) && (
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email {options?.requireLogin && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    options?.allowedDomain
                      ? `Enter your @${options.allowedDomain} email`
                      : "Enter your email"
                  }
                  required={options?.requireLogin}
                  disabled={isSubmitting}
                />
                {options?.allowedDomain && (
                  <p className="text-xs text-muted-foreground">
                    Only @{options.allowedDomain} emails are allowed
                  </p>
                )}
              </div>
            )}

            {/* Password (conditional) */}
            {options?.password && (
              <div className="space-y-2">
                <Label htmlFor="password">
                  Test Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter test password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This test is password-protected
                </p>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Starting..." : "Start Test"}
            </Button>
          </form>

          {/* Additional notes */}
          {!options?.allowMultipleSubmissions && (
            <p className="text-center text-xs text-muted-foreground">
              You can only submit this test once
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

