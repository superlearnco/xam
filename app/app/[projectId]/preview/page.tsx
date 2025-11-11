"use client";

import { ChevronLeft, Eye, Printer, Loader2 } from "lucide-react";
import { AppNavbar } from "@/components/app-navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function PreviewPage() {
  const params = useParams();
  const projectId = params.projectId as Id<"projects">;

  const projectData = useQuery(api.projects.getProjectWithQuestions, {
    projectId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (!projectData) {
    return (
      <div className="min-h-screen bg-background">
        <AppNavbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const questions = projectData.questions;
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  const renderQuestionField = (question: any, index: number) => {
    switch (question.type) {
      case "multipleChoice":
        return (
          <RadioGroup disabled>
            <div className="space-y-3">
              {question.options.map((option: any, optIndex: number) => (
                <div key={optIndex} className="flex items-center space-x-3">
                  <RadioGroupItem
                    value={optIndex.toString()}
                    id={`${question._id}-${optIndex}`}
                  />
                  <Label
                    htmlFor={`${question._id}-${optIndex}`}
                    className="cursor-pointer"
                  >
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "multipleSelect":
        return (
          <div className="space-y-3">
            {question.options.map((option: any, optIndex: number) => (
              <div key={optIndex} className="flex items-center space-x-3">
                <Checkbox id={`${question._id}-${optIndex}`} disabled />
                <Label
                  htmlFor={`${question._id}-${optIndex}`}
                  className="cursor-pointer"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "shortText":
        return (
          <Input
            placeholder="Type your answer here..."
            disabled
            className="max-w-2xl"
          />
        );

      case "longText":
        return (
          <Textarea
            placeholder="Type your answer here..."
            disabled
            className="min-h-32"
            rows={6}
          />
        );

      case "richText":
        return (
          <div className="border rounded-lg p-4 min-h-48 bg-muted/30">
            <p className="text-sm text-muted-foreground">
              Rich text editor (students can format their answer)
            </p>
          </div>
        );

      case "dropdown":
        return (
          <Select disabled>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option: any, optIndex: number) => (
                <SelectItem key={optIndex} value={optIndex.toString()}>
                  {option.text}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "imageChoice":
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {question.options.map((option: any, optIndex: number) => (
              <div
                key={optIndex}
                className="border rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer"
              >
                {option.imageUrl ? (
                  <img
                    src={option.imageUrl}
                    alt={option.text}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-muted rounded mb-2 flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">
                      Image {optIndex + 1}
                    </span>
                  </div>
                )}
                <p className="text-sm">{option.text}</p>
              </div>
            ))}
          </div>
        );

      case "fileUpload":
        return (
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <Button disabled variant="outline">
              Choose File
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              {question.fileTypes.length > 0
                ? `Allowed: ${question.fileTypes.join(", ")}`
                : "All file types allowed"}
              {question.maxFileSize && ` • Max size: ${question.maxFileSize}MB`}
            </p>
          </div>
        );

      case "ratingScale":
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                disabled
                className="w-10 h-10 rounded-full border-2 hover:border-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {rating}
              </button>
            ))}
          </div>
        );

      case "linearScale":
        return (
          <div className="space-y-4">
            <Slider
              disabled
              defaultValue={[
                Math.floor(
                  ((question.scaleMin || 1) + (question.scaleMax || 5)) / 2,
                ),
              ]}
              min={question.scaleMin || 1}
              max={question.scaleMax || 5}
              step={1}
              className="w-full max-w-md"
            />
            <div className="flex justify-between text-sm text-muted-foreground max-w-md">
              <span>{question.scaleMinLabel || question.scaleMin || 1}</span>
              <span>{question.scaleMaxLabel || question.scaleMax || 5}</span>
            </div>
          </div>
        );

      case "matrix":
        return (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border p-2"></th>
                  {question.matrixColumns.map((col: string, idx: number) => (
                    <th key={idx} className="border p-2 text-sm font-medium">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {question.matrixRows.map((row: string, rowIdx: number) => (
                  <tr key={rowIdx}>
                    <td className="border p-2 text-sm font-medium">{row}</td>
                    {question.matrixColumns.map((_: string, colIdx: number) => (
                      <td key={colIdx} className="border p-2 text-center">
                        <input
                          type="radio"
                          disabled
                          name={`matrix-${question._id}-${rowIdx}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case "sectionHeader":
        return (
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{question.questionText}</h2>
            {question.description && (
              <p className="text-muted-foreground">{question.description}</p>
            )}
          </div>
        );

      case "pageBreak":
        return (
          <div className="border-t-4 border-dashed border-muted-foreground/30 py-4">
            <p className="text-center text-sm text-muted-foreground">
              Page Break
            </p>
          </div>
        );

      case "infoBlock":
        return (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-bold">i</span>
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  {question.description || question.questionText}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <p className="text-sm text-muted-foreground">
            Question type: {question.type}
          </p>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="border-b border-border bg-background sticky top-0 z-10 print:hidden">
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
                  {projectData.name}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-2">
                <Eye className="w-4 h-4" />
                Preview Mode
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-2 bg-transparent"
              >
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <Link href={`/app/${projectId}/edit`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Edit
              </button>
            </Link>
            <Link href={`/app/${projectId}/options`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Options
              </button>
            </Link>
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">
              Preview
            </button>
            <Link href={`/app/${projectId}/mark`}>
              <button className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                Mark
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <Card className="p-8 print:shadow-none print:border-0">
          <div className="mb-8 pb-6 border-b print:border-b-2">
            <h1 className="text-3xl font-bold mb-2">{projectData.name}</h1>
            {projectData.description && (
              <p className="text-muted-foreground mb-4">
                {projectData.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span>
                Total Marks:{" "}
                <strong className="text-foreground">{totalPoints}</strong>
              </span>
              {projectData.settings.duration && (
                <>
                  <span>•</span>
                  <span>
                    Time Limit:{" "}
                    <strong className="text-foreground">
                      {projectData.settings.duration} minutes
                    </strong>
                  </span>
                </>
              )}
              <span>•</span>
              <span>
                {questions.length}{" "}
                {questions.length === 1 ? "Question" : "Questions"}
              </span>
            </div>
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No questions added yet. Add questions in the Edit tab.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {questions.map((question, index) => {
                // Skip rendering question number and points for non-question types
                const isNonQuestion =
                  question.type === "sectionHeader" ||
                  question.type === "pageBreak" ||
                  question.type === "infoBlock";

                return (
                  <div
                    key={question._id}
                    className={`${
                      !isNonQuestion
                        ? "border-b border-border pb-8 last:border-0 print:break-inside-avoid"
                        : "print:break-inside-avoid"
                    }`}
                  >
                    {!isNonQuestion && (
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Question {index + 1}
                            </span>
                            <Badge variant="outline">
                              {question.points}{" "}
                              {question.points === 1 ? "mark" : "marks"}
                            </Badge>
                            {question.required && (
                              <Badge variant="secondary" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-lg font-medium">
                            {question.questionText}
                          </h3>
                          {question.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {question.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="ml-0">
                      {renderQuestionField(question, index)}
                    </div>

                    {question.explanation && !isNonQuestion && (
                      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg print:hidden">
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Explanation:
                        </p>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-border print:hidden">
            <p className="text-sm text-muted-foreground text-center">
              This is a preview of how students will see the test. Changes made
              here will not be saved.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
