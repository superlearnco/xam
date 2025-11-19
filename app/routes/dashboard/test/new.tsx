"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { FieldTypesSidebar, type FieldType } from "~/components/test-editor/field-types";
import { TestBuilder, type TestField } from "~/components/test-editor/test-builder";
import { FieldPropertiesPanel } from "~/components/test-editor/field-properties-panel";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Loader2, Copy, Check, Printer } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

function generateFieldId(): string {
  return `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function TestEditorPage() {
  const [testNameParam, setTestNameParam] = useState("");
  const [testTypeParam, setTestTypeParam] = useState("test");

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testIdParam = params.get("testId");
    if (testIdParam) {
      setTestId(testIdParam as Id<"tests">);
    }
    setTestNameParam(params.get("name") || "");
    setTestTypeParam(params.get("type") || "test");
    const tabParam = params.get("tab");
    if (tabParam && ["editor", "preview", "options", "marking"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, []);

  const [testId, setTestId] = useState<Id<"tests"> | null>(null);
  const [testName, setTestName] = useState("");
  const [testDescription, setTestDescription] = useState("");
  const [fields, setFields] = useState<TestField[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [selectedFieldForProperties, setSelectedFieldForProperties] = useState<TestField | null>(null);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  
  // Options state
  const [maxAttempts, setMaxAttempts] = useState<number | undefined>(undefined);
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>(undefined);
  const [requireAuth, setRequireAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordProtectionEnabled, setPasswordProtectionEnabled] = useState(false);
  const [disableCopyPaste, setDisableCopyPaste] = useState(false);
  const [requireFullScreen, setRequireFullScreen] = useState(false);
  const [blockTabSwitching, setBlockTabSwitching] = useState(false);
  const [allowBackNavigation, setAllowBackNavigation] = useState(true);
  const [passingGrade, setPassingGrade] = useState<number | undefined>(undefined);
  const [instantFeedback, setInstantFeedback] = useState(false);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  const createTest = useMutation(api.tests.createTest);
  const updateTest = useMutation(api.tests.updateTest);
  const test = useQuery(
    api.tests.getTest,
    testId ? { testId } : "skip"
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Create test on mount if we have name from URL params
  useEffect(() => {
    if (!testId && testNameParam && !isCreating) {
      setIsCreating(true);
      createTest({
        name: testNameParam,
        type: testTypeParam as "test" | "survey" | "essay",
      })
        .then((id) => {
          setTestId(id);
          setTestName(testNameParam);
        })
        .catch((error) => {
          console.error("Failed to create test:", error);
        })
        .finally(() => {
          setIsCreating(false);
        });
    }
  }, [testId, testNameParam, testTypeParam, createTest, isCreating]);

  // Load test data when testId is available
  useEffect(() => {
    if (test && testId) {
      setTestName(test.name);
      setTestDescription(test.description || "");
      setFields(
        (test.fields || []).sort((a, b) => a.order - b.order) as TestField[]
      );
      setMaxAttempts(test.maxAttempts);
      setEstimatedDuration(test.estimatedDuration);
      setRequireAuth(test.requireAuth || false);
      setPassword(test.password || "");
      setPasswordProtectionEnabled(!!test.password);
      setDisableCopyPaste(test.disableCopyPaste || false);
      setRequireFullScreen(test.requireFullScreen || false);
      setBlockTabSwitching(test.blockTabSwitching || false);
      setAllowBackNavigation(test.allowBackNavigation !== undefined ? test.allowBackNavigation : true);
      setPassingGrade(test.passingGrade);
      setInstantFeedback(test.instantFeedback || false);
      setShowAnswerKey(test.showAnswerKey || false);
      setTimeLimitMinutes(test.timeLimitMinutes);
    }
  }, [test, testId]);

  // Debounced auto-save
  const debouncedUpdate = useCallback(
    debounce(
      async (
        id: Id<"tests">,
        name: string,
        description: string,
        fields: TestField[],
        options: {
          maxAttempts?: number;
          estimatedDuration?: number;
          requireAuth: boolean;
          password: string;
          passwordProtectionEnabled: boolean;
          disableCopyPaste: boolean;
          requireFullScreen: boolean;
          blockTabSwitching: boolean;
          allowBackNavigation: boolean;
          passingGrade?: number;
          instantFeedback: boolean;
          showAnswerKey: boolean;
          timeLimitMinutes?: number;
        }
      ) => {
        try {
          await updateTest({
            testId: id,
            name,
            description,
            fields: fields.map((f, index) => ({
              ...f,
              order: index,
            })),
            maxAttempts: options.maxAttempts,
            estimatedDuration: options.estimatedDuration,
            requireAuth: options.requireAuth,
            password: options.passwordProtectionEnabled ? (options.password || undefined) : "",
            disableCopyPaste: options.disableCopyPaste,
            requireFullScreen: options.requireFullScreen,
            blockTabSwitching: options.blockTabSwitching,
            allowBackNavigation: options.allowBackNavigation,
            passingGrade: options.passingGrade,
            instantFeedback: options.instantFeedback,
            showAnswerKey: options.showAnswerKey,
            timeLimitMinutes: options.timeLimitMinutes,
          });
        } catch (error) {
          console.error("Failed to update test:", error);
        }
      },
      500
    ),
    [updateTest]
  );

  // Auto-save when test data changes
  useEffect(() => {
    if (testId && test) {
      debouncedUpdate(testId, testName, testDescription, fields, {
        maxAttempts,
        estimatedDuration,
        requireAuth,
        password,
        passwordProtectionEnabled,
        disableCopyPaste,
        requireFullScreen,
        blockTabSwitching,
        allowBackNavigation,
        passingGrade,
        instantFeedback,
        showAnswerKey,
        timeLimitMinutes,
      });
    }
  }, [
    testId,
    testName,
    testDescription,
    fields,
    maxAttempts,
    estimatedDuration,
    requireAuth,
    password,
    passwordProtectionEnabled,
    disableCopyPaste,
    requireFullScreen,
    blockTabSwitching,
    allowBackNavigation,
    passingGrade,
    instantFeedback,
    showAnswerKey,
    timeLimitMinutes,
    debouncedUpdate,
    test,
  ]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Handle dropping a field type from sidebar
    if (
      active.data.current?.type === "field-type" &&
      (over.id === "test-builder-drop-zone" || typeof over.id === "string" && over.id.startsWith("field-"))
    ) {
      const fieldType = active.data.current.fieldType as FieldType;
      const newField: TestField = {
        id: generateFieldId(),
        type: fieldType,
        label: "",
        required: fieldType !== "pageBreak" && fieldType !== "infoBlock",
        options:
          fieldType === "multipleChoice" ||
          fieldType === "checkboxes" ||
          fieldType === "dropdown" ||
          fieldType === "imageChoice"
            ? [""]
            : undefined,
        order: fields.length,
        marks: 1,
      };
      
      // If dropped on a specific field, insert before it
      if (typeof over.id === "string" && over.id.startsWith("field-")) {
        const targetIndex = fields.findIndex((f) => f.id === over.id);
        if (targetIndex !== -1) {
          const newFields = [...fields];
          newFields.splice(targetIndex, 0, newField);
          setFields(newFields.map((f, index) => ({ ...f, order: index })));
        } else {
          setFields([...fields, newField].map((f, index) => ({ ...f, order: index })));
        }
      } else {
        setFields([...fields, newField].map((f, index) => ({ ...f, order: index })));
      }
      return;
    }

    // Handle reordering fields
    if (active.id !== over.id && typeof active.id === "string" && typeof over.id === "string") {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newFields = [...fields];
        const [movedField] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, movedField);
        setFields(
          newFields.map((f, index) => ({ ...f, order: index }))
        );
      }
    }
  };

  const handleFieldUpdate = (updatedField: TestField) => {
    setFields(
      fields.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
  };

  const handleFieldDelete = (fieldId: string) => {
    setFields(fields.filter((f) => f.id !== fieldId).map((f, index) => ({ ...f, order: index })));
    fieldRefs.current.delete(fieldId);
  };

  const handleFieldTypeClick = (fieldType: FieldType) => {
    const newField: TestField = {
      id: generateFieldId(),
      type: fieldType,
      label: "",
      required: fieldType !== "pageBreak" && fieldType !== "infoBlock",
      options:
        fieldType === "multipleChoice" ||
        fieldType === "checkboxes" ||
        fieldType === "dropdown" ||
        fieldType === "imageChoice"
          ? [""]
          : undefined,
      order: fields.length,
      marks: 1,
    };
    
    setFields([...fields, newField].map((f, index) => ({ ...f, order: index })));
    
    // Scroll to the new field after a short delay to ensure it's rendered
    setTimeout(() => {
      const fieldElement = fieldRefs.current.get(newField.id);
      if (fieldElement) {
        fieldElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const handleFieldSettingsClick = (field: TestField) => {
    setSelectedFieldForProperties(field);
    setPropertiesPanelOpen(true);
  };

  const handlePropertiesPanelUpdate = (updatedField: TestField) => {
    setFields(
      fields.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
    setSelectedFieldForProperties(updatedField);
  };

  const handleCopyLink = async () => {
    if (!testId) return;
    
    const testUrl = `${window.location.origin}/test/${testId}`;
    
    try {
      await navigator.clipboard.writeText(testUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const escapeHtml = (text: string) => {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print the worksheet");
      return;
    }

    // Write the print content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${escapeHtml(testName || "Test Worksheet")}</title>
          <style>
            @media print {
              @page {
                margin: 1in;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                color: #000;
                background: #fff;
              }
              .no-print {
                display: none !important;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #000;
              background: #fff;
              max-width: 800px;
              margin: 0 auto;
            }
            .worksheet-header {
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .worksheet-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .worksheet-description {
              font-size: 14px;
              color: #333;
              margin-top: 10px;
            }
            .worksheet-field {
              margin-bottom: 25px;
              page-break-inside: avoid;
            }
            .field-label {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 8px;
            }
            .field-label .required {
              color: #d32f2f;
              margin-left: 4px;
            }
            .answer-space {
              border-bottom: 2px solid #000;
              min-height: 24px;
              margin-top: 8px;
              padding-bottom: 2px;
            }
            .answer-space-long {
              border-bottom: 1px solid #000;
              min-height: 60px;
              margin-top: 8px;
              padding-bottom: 2px;
            }
            .option-list {
              margin-top: 10px;
              margin-left: 20px;
            }
            .option-item {
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .radio-circle {
              width: 18px;
              height: 18px;
              border: 2px solid #000;
              border-radius: 50%;
              display: inline-block;
              flex-shrink: 0;
            }
            .checkbox-square {
              width: 18px;
              height: 18px;
              border: 2px solid #000;
              display: inline-block;
              flex-shrink: 0;
            }
            .dropdown-indicator {
              border-bottom: 2px solid #000;
              min-width: 200px;
              min-height: 24px;
              margin-top: 8px;
              position: relative;
              padding-right: 30px;
            }
            .dropdown-indicator::after {
              content: "▼";
              position: absolute;
              right: 8px;
              top: 2px;
              font-size: 12px;
            }
            .dropdown-note {
              font-size: 12px;
              color: #555;
              margin-top: 6px;
              margin-bottom: 4px;
            }
            .image-choice-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 10px;
            }
            .image-choice-item {
              border: 2px solid #000;
              aspect-ratio: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            .image-choice-checkbox {
              position: absolute;
              top: 8px;
              left: 8px;
              width: 18px;
              height: 18px;
              border: 2px solid #000;
            }
            .info-block {
              background: #f5f5f5;
              border: 1px solid #ddd;
              padding: 15px;
              margin-top: 10px;
              border-radius: 4px;
              white-space: pre-wrap;
            }
            .worksheet-footer {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
            }
            .worksheet-logo {
              max-width: 120px;
              height: auto;
              margin: 0 auto;
            }
            .help-text {
              font-size: 12px;
              color: #666;
              font-style: italic;
              margin-top: 4px;
            }
          </style>
        </head>
        <body>
          ${renderPrintWorksheet()}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Close window after printing (optional)
        // printWindow.close();
      }, 250);
    };
  };

  const renderPrintWorksheet = () => {
    const sortedFields = [...fields].sort((a, b) => a.order - b.order);
    
    let html = `
      <div class="worksheet-header">
        <div class="worksheet-title">${escapeHtml(testName || "Untitled Test")}</div>
        ${testDescription ? `<div class="worksheet-description">${escapeHtml(testDescription)}</div>` : ""}
      </div>
    `;

    let questionNumber = 0;
    sortedFields.forEach((field) => {
      const isQuestion = field.type !== "pageBreak" && field.type !== "infoBlock";
      if (isQuestion) {
        questionNumber++;
      }
      
      html += `<div class="worksheet-field">`;
      
      switch (field.type) {
        case "shortInput":
          html += `
            <div class="field-label">
              ${questionNumber}. ${escapeHtml(field.label || "Question")}
              ${field.required ? '<span class="required">*</span>' : ""}
            </div>
            <div class="answer-space"></div>
            ${field.helpText ? `<div class="help-text">${escapeHtml(field.helpText)}</div>` : ""}
          `;
          break;

        case "longInput":
          html += `
            <div class="field-label">
              ${questionNumber}. ${escapeHtml(field.label || "Question")}
              ${field.required ? '<span class="required">*</span>' : ""}
            </div>
            <div class="answer-space-long"></div>
            ${field.helpText ? `<div class="help-text">${escapeHtml(field.helpText)}</div>` : ""}
          `;
          break;

        case "multipleChoice":
          html += `
            <div class="field-label">
              ${questionNumber}. ${escapeHtml(field.label || "Question")}
              ${field.required ? '<span class="required">*</span>' : ""}
            </div>
            <div class="option-list">
              ${(field.options || []).map((option, optIndex) => `
                <div class="option-item">
                  <span class="radio-circle"></span>
                  <span>${escapeHtml(option || `Option ${optIndex + 1}`)}</span>
                </div>
              `).join("")}
            </div>
            ${field.helpText ? `<div class="help-text">${escapeHtml(field.helpText)}</div>` : ""}
          `;
          break;

        case "checkboxes":
          html += `
            <div class="field-label">
              ${questionNumber}. ${escapeHtml(field.label || "Question")}
              ${field.required ? '<span class="required">*</span>' : ""}
            </div>
            <div class="option-list">
              ${(field.options || []).map((option, optIndex) => `
                <div class="option-item">
                  <span class="checkbox-square"></span>
                  <span>${escapeHtml(option || `Option ${optIndex + 1}`)}</span>
                </div>
              `).join("")}
            </div>
            ${field.helpText ? `<div class="help-text">${escapeHtml(field.helpText)}</div>` : ""}
          `;
          break;

        case "dropdown":
          html += `
            <div class="field-label">
              ${questionNumber}. ${escapeHtml(field.label || "Question")}
              ${field.required ? '<span class="required">*</span>' : ""}
            </div>
            <div class="dropdown-indicator"></div>
            <div class="dropdown-note">Select one option:</div>
            <div class="option-list">
              ${(field.options || []).map((option, optIndex) => `
                <div class="option-item">
                  <span class="radio-circle"></span>
                  <span>${escapeHtml(option || `Option ${optIndex + 1}`)}</span>
                </div>
              `).join("")}
            </div>
            ${field.helpText ? `<div class="help-text">${escapeHtml(field.helpText)}</div>` : ""}
          `;
          break;

        case "imageChoice":
          html += `
            <div class="field-label">
              ${questionNumber}. ${escapeHtml(field.label || "Question")}
              ${field.required ? '<span class="required">*</span>' : ""}
            </div>
            <div class="image-choice-grid">
              ${(field.options || []).map((option, optIndex) => {
                const imageUrl = option && option.startsWith("http") ? option : null;
                return `
                  <div class="image-choice-item">
                    <span class="image-choice-checkbox"></span>
                    ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="Choice ${optIndex + 1}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />` : `<span>Image ${optIndex + 1}</span>`}
                  </div>
                `;
              }).join("")}
            </div>
            ${field.helpText ? `<div class="help-text">${escapeHtml(field.helpText)}</div>` : ""}
          `;
          break;

        case "infoBlock":
          html += `
            <div class="info-block">
              ${escapeHtml(field.label || "")}
            </div>
          `;
          break;

        case "pageBreak":
          // User said don't worry about page breaks, so we'll just add some spacing
          html += `<div style="margin: 30px 0; border-top: 1px dashed #ccc;"></div>`;
          break;

        default:
          break;
      }
      
      html += `</div>`;
    });

    html += `
      <div class="worksheet-footer">
        <img src="/superlearn full.png" alt="Superlearn" class="worksheet-logo" />
      </div>
    `;

    return html;
  };

  const tabs = [
    {
      value: "editor",
      label: "Editor",
      active: activeTab === "editor",
      onClick: () => setActiveTab("editor"),
    },
    {
      value: "preview",
      label: "Preview",
      active: activeTab === "preview",
      onClick: () => setActiveTab("preview"),
    },
    {
      value: "options",
      label: "Options",
      active: activeTab === "options",
      onClick: () => setActiveTab("options"),
    },
    {
      value: "marking",
      label: "Marking",
      active: activeTab === "marking",
      onClick: () => setActiveTab("marking"),
    },
  ];

  // Show loading state while creating new test or loading existing test
  if (isCreating) {
    return (
      <>
        <DashboardNav tabs={tabs} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Creating test...</p>
        </div>
      </>
    );
  }

  if (testId && test === undefined) {
    return (
      <>
        <DashboardNav tabs={tabs} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Loading test...</p>
        </div>
      </>
    );
  }

  if (!testId) {
    return (
      <>
        <DashboardNav tabs={tabs} />
        <div className="flex flex-1 flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Creating test...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav tabs={tabs} />
      <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">Test Editor</h1>
          {testId && (
            <Button
              variant="outline"
              onClick={handlePrint}
              className="ml-auto"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Worksheet
            </Button>
          )}
        </div>
      </div>
      {activeTab === "editor" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 overflow-hidden">
            <FieldTypesSidebar onFieldTypeClick={handleFieldTypeClick} />
            <TestBuilder
              testName={testName}
              testDescription={testDescription}
              fields={fields}
              onNameChange={setTestName}
              onDescriptionChange={setTestDescription}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              fieldRefs={fieldRefs}
              onFieldSettingsClick={handleFieldSettingsClick}
            />
          </div>
          <FieldPropertiesPanel
            field={selectedFieldForProperties}
            open={propertiesPanelOpen}
            onOpenChange={setPropertiesPanelOpen}
            onUpdate={handlePropertiesPanelUpdate}
          />
          <DragOverlay>
            {activeId ? (
              <div className="opacity-50">
                {activeId.startsWith("field-type-") ? (
                  <div className="p-3 rounded-lg border-2 border-primary bg-card">
                    Dragging field type...
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border-2 border-primary bg-card">
                    Moving field...
                  </div>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      {activeTab === "options" && (
        <div className="flex flex-1 overflow-auto">
          <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-6">
            {/* Share Section */}
            <Card>
              <CardHeader>
                <CardTitle>Share</CardTitle>
                <CardDescription>Share this test with others using the link below</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <div className="flex-1 flex items-center gap-3 px-4 py-2 border rounded-lg bg-muted/50">
                    <span className="text-sm text-muted-foreground flex-shrink-0">Link:</span>
                    {testId ? (
                      <Link
                        to={`/test/${testId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-mono text-primary hover:underline truncate"
                      >
                        {`${window.location.origin}/test/${testId}`}
                      </Link>
                    ) : (
                      <span className="text-sm font-mono text-foreground truncate">
                        Loading...
                      </span>
                    )}
                  </div>
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="icon"
                    className="flex-shrink-0"
                    disabled={!testId}
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Test Information Section */}
            <Card>
              <CardHeader>
                <CardTitle>Test Information</CardTitle>
                <CardDescription>Basic information about your test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-name">Test Name</Label>
                  <Input
                    id="test-name"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="Enter test name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="test-description">Description</Label>
                  <Textarea
                    id="test-description"
                    value={testDescription}
                    onChange={(e) => setTestDescription(e.target.value)}
                    placeholder="Enter test description"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-attempts">Max Attempts</Label>
                    <Input
                      id="max-attempts"
                      type="number"
                      min="1"
                      value={maxAttempts ?? ""}
                      onChange={(e) => setMaxAttempts(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated-duration">Estimated Duration</Label>
                    <div className="flex gap-2">
                      <Input
                        id="estimated-duration"
                        type="number"
                        min="1"
                        value={
                          estimatedDuration
                            ? estimatedDuration >= 60
                              ? Math.round(estimatedDuration / 60)
                              : estimatedDuration
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value ? parseInt(e.target.value) : undefined;
                          if (value !== undefined) {
                            const currentUnit = estimatedDuration && estimatedDuration >= 60 ? "hours" : "minutes";
                            setEstimatedDuration(currentUnit === "hours" ? value * 60 : value);
                          } else {
                            setEstimatedDuration(undefined);
                          }
                        }}
                        placeholder="Duration"
                        className="flex-1"
                      />
                      <Select
                        value={estimatedDuration ? (estimatedDuration >= 60 ? "hours" : "minutes") : "minutes"}
                        onValueChange={(value) => {
                          if (estimatedDuration) {
                            if (value === "hours" && estimatedDuration < 60) {
                              setEstimatedDuration(estimatedDuration * 60);
                            } else if (value === "minutes" && estimatedDuration >= 60) {
                              setEstimatedDuration(Math.round(estimatedDuration / 60));
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minutes">Minutes</SelectItem>
                          <SelectItem value="hours">Hours</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time-limit">Enforced Time Limit (minutes)</Label>
                    <Input
                      id="time-limit"
                      type="number"
                      min="1"
                      value={timeLimitMinutes ?? ""}
                      onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="No time limit"
                    />
                    <p className="text-sm text-muted-foreground">
                      Test will auto-submit when time expires. Leave empty for no time limit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Section */}
            <Card>
              <CardHeader>
                <CardTitle>Access</CardTitle>
                <CardDescription>Control who can access and how they interact with the test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="require-auth"
                    checked={requireAuth}
                    onCheckedChange={(checked) => setRequireAuth(checked === true)}
                  />
                  <Label htmlFor="require-auth" className="font-normal cursor-pointer">
                    Require E-Mail
                  </Label>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="password-protection"
                      checked={passwordProtectionEnabled}
                      onCheckedChange={(checked) => {
                        setPasswordProtectionEnabled(checked === true);
                        if (!checked) {
                          setPassword("");
                        }
                      }}
                    />
                    <Label htmlFor="password-protection" className="font-normal cursor-pointer">
                      Password protection
                    </Label>
                  </div>
                  {passwordProtectionEnabled && (
                    <div className="ml-6">
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="max-w-md"
                      />
                    </div>
                  )}
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Browser Restrictions</Label>
                  <div className="space-y-3 ml-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="disable-copy-paste"
                        checked={disableCopyPaste}
                        onCheckedChange={(checked) => setDisableCopyPaste(checked === true)}
                      />
                      <Label htmlFor="disable-copy-paste" className="font-normal cursor-pointer">
                        Disable copy/paste
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="require-fullscreen"
                        checked={requireFullScreen}
                        onCheckedChange={(checked) => setRequireFullScreen(checked === true)}
                      />
                      <Label htmlFor="require-fullscreen" className="font-normal cursor-pointer">
                        Full screen mode required
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="block-tab-switching"
                        checked={blockTabSwitching}
                        onCheckedChange={(checked) => setBlockTabSwitching(checked === true)}
                      />
                      <Label htmlFor="block-tab-switching" className="font-normal cursor-pointer">
                        Block tab switching
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow-back-navigation"
                        checked={allowBackNavigation}
                        onCheckedChange={(checked) => setAllowBackNavigation(checked === true)}
                      />
                      <Label htmlFor="allow-back-navigation" className="font-normal cursor-pointer">
                        Allow back navigation
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Marking Section */}
            <Card>
              <CardHeader>
                <CardTitle>Marking</CardTitle>
                <CardDescription>Configure how the test is graded and feedback is provided</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passing-grade">Passing Grade (%)</Label>
                  <Input
                    id="passing-grade"
                    type="number"
                    min="0"
                    max="100"
                    value={passingGrade ?? ""}
                    onChange={(e) => setPassingGrade(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="e.g., 70"
                    className="max-w-md"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="instant-feedback"
                    checked={instantFeedback}
                    onCheckedChange={(checked) => setInstantFeedback(checked === true)}
                  />
                  <Label htmlFor="instant-feedback" className="font-normal cursor-pointer">
                    Instant feedback (after test)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-answer-key"
                    checked={showAnswerKey}
                    onCheckedChange={(checked) => setShowAnswerKey(checked === true)}
                  />
                  <Label htmlFor="show-answer-key" className="font-normal cursor-pointer">
                    Show answer key
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {activeTab === "preview" && (
        <TestPreview 
          testName={testName}
          testDescription={testDescription}
          fields={fields}
        />
      )}
      {activeTab === "marking" && testId && (
        <MarkingPage testId={testId} />
      )}
      </div>
    </>
  );
}

// Preview component for testing the test
function TestPreview({
  testName,
  testDescription,
  fields,
}: {
  testName: string;
  testDescription: string;
  fields: TestField[];
}) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
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
                          <Check className="h-3 w-3 text-primary-foreground" />
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
        return (
          <div 
            key={field.id} 
            className="py-8"
            style={{
              pageBreakAfter: 'always',
              breakAfter: 'page',
            }}
          >
            <Separator />
            <div className="text-center -mt-3">
              <span className="bg-background px-2 text-xs text-muted-foreground">
                Page Break
              </span>
            </div>
          </div>
        );

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
    <div className="flex flex-1 overflow-auto">
      <div className="flex-1 max-w-3xl mx-auto w-full p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{testName || "Untitled Test"}</h1>
          {testDescription && (
            <p className="text-muted-foreground">{testDescription}</p>
          )}
        </div>
        <Separator />
        <form className="space-y-6">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field, index, sortedFields) => {
              const prevField = index > 0 ? sortedFields[index - 1] : null;
              const shouldBreakBefore = prevField?.type === "pageBreak";
              
              return (
                <div
                  key={field.id}
                  style={shouldBreakBefore ? {
                    pageBreakBefore: 'always',
                    breakBefore: 'page',
                  } : undefined}
                >
                  {renderField(field)}
                </div>
              );
            })}
        </form>
      </div>
    </div>
  );
}

// Simple debounce function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Marking Page Component
function MarkingPage({
  testId,
}: {
  testId: Id<"tests">;
}) {
  const navigate = useNavigate();
  const submissionsData = useQuery(api.tests.getTestSubmissions, { testId });

  if (submissionsData === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { submissions, statistics } = submissionsData;

  // Prepare data for pie charts
  const accuracyChartConfig = {
    correct: { label: "Correct", color: "hsl(142, 76%, 36%)" },
    incorrect: { label: "Incorrect", color: "hsl(0, 84%, 60%)" },
  };

  const statusChartConfig = {
    marked: { label: "Marked", color: "hsl(142, 76%, 36%)" },
    awaiting: { label: "Awaiting", color: "hsl(221, 83%, 53%)" },
  };

  const accuracyData = [
    { name: "Correct", value: statistics.meanPercentage },
    { name: "Incorrect", value: 100 - statistics.meanPercentage },
  ].filter((item) => item.value > 0);

  const markingStatusData = [
    { name: "Marked", value: statistics.marked },
    { name: "Awaiting", value: statistics.unmarked },
  ].filter((item) => item.value > 0);

  const accuracyColors = [accuracyChartConfig.correct.color, accuracyChartConfig.incorrect.color];
  const statusColors = [statusChartConfig.marked.color, statusChartConfig.awaiting.color];

  return (
    <div className="flex flex-1 flex-col overflow-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Marking</h2>
        <p className="text-muted-foreground">Review and mark student submissions</p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Class Accuracy Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Class Accuracy</CardTitle>
            <CardDescription>Mean percentage: {statistics.meanPercentage}%</CardDescription>
          </CardHeader>
          <CardContent>
            {statistics.marked > 0 ? (
              <ChartContainer config={accuracyChartConfig} className="h-[250px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={accuracyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={accuracyColors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No marked submissions yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Marking Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Marking Status</CardTitle>
            <CardDescription>
              {statistics.marked} marked, {statistics.unmarked} awaiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statistics.total > 0 ? (
              <ChartContainer config={statusChartConfig} className="h-[250px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie
                    data={markingStatusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {markingStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={statusColors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No submissions yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Most Missed Questions */}
      {submissionsData.questionAnalytics && submissionsData.questionAnalytics.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {submissionsData.questionAnalytics.slice(0, 3).map((q, i) => (
            <Card key={q.fieldId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Most Missed #{i + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{q.averagePercentage}%</div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2" title={q.label}>
                  {q.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {q.averageScore.toFixed(1)} / {q.maxScore}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Question Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Question Analysis</CardTitle>
          <CardDescription>Average performance per question</CardDescription>
        </CardHeader>
        <CardContent>
          {submissionsData.questionAnalytics && submissionsData.questionAnalytics.length > 0 ? (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={submissionsData.questionAnalytics}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis 
                    dataKey="label" 
                    type="category" 
                    width={150} 
                    tickFormatter={(value) => value.length > 20 ? `${value.substring(0, 20)}...` : value}
                  />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-background border rounded-lg p-3 shadow-lg">
                            <p className="font-medium">{data.label}</p>
                            <p className="text-sm text-muted-foreground">
                              Average: {data.averagePercentage}% ({data.averageScore.toFixed(1)}/{data.maxScore})
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Based on {data.count} marked submissions
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="averagePercentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Average Score (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="text-center py-8 text-muted-foreground">
              No question data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Submissions</CardTitle>
          <CardDescription>Total: {statistics.total} submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No submissions yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission._id}>
                    <TableCell className="font-medium">
                      {submission.respondentName || "Anonymous"}
                    </TableCell>
                    <TableCell>{submission.respondentEmail || "-"}</TableCell>
                    <TableCell>
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={submission.isMarked ? "default" : "secondary"}>
                        {submission.isMarked ? "Marked" : "Submitted"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {submission.percentage !== undefined
                        ? `${submission.percentage}%`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant={submission.isMarked ? "outline" : "default"}
                        size="sm"
                        onClick={() => navigate(`/dashboard/test/mark/${submission._id}`)}
                      >
                        {submission.isMarked ? "Review" : "Mark"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

