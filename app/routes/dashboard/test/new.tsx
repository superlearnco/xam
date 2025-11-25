"use client";

import type { Route } from "./+types/new";
import { useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "convex/_generated/api";
import type { Id } from "convex/_generated/dataModel";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Test Editor | XAM" },
  ];
}
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { FieldTypesSidebar, type FieldType } from "~/components/test-editor/field-types";
import { TestBuilder, type TestField } from "~/components/test-editor/test-builder";
import { FieldPropertiesPanel } from "~/components/test-editor/field-properties-panel";
import { DashboardNav } from "~/components/dashboard/dashboard-nav";
import { EditorWelcome } from "~/components/dashboard/editor-welcome";
import { Button } from "~/components/ui/button";
import { ArrowLeft, Loader2, Copy, Check, Printer, Download, Trash2, QrCode, X, Share2, Settings, Lock, GraduationCap, LayoutTemplate, Users, BarChart3, LayoutDashboard, BrainCircuit, AlertCircle, Calculator } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "~/components/ui/chart";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { cn } from "~/lib/utils";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";

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
  const [isLoaded, setIsLoaded] = useState(false);
  const fieldRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [selectedFieldForProperties, setSelectedFieldForProperties] = useState<TestField | null>(null);
  const [propertiesPanelOpen, setPropertiesPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");
  const [activeOptionCategory, setActiveOptionCategory] = useState("share");
  
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
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [viewType, setViewType] = useState<"singlePage" | "oneQuestionPerPage">("singlePage");
  const [enableCalculator, setEnableCalculator] = useState(false);
  const [calculatorType, setCalculatorType] = useState<"basic" | "scientific">("basic");
  const [copied, setCopied] = useState(false);
  const [qrCodeOpen, setQrCodeOpen] = useState(false);

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

  // Reset isLoaded when testId changes
  useEffect(() => {
    setIsLoaded(false);
  }, [testId]);

  // Load test data when testId is available
  useEffect(() => {
    if (test && testId && !isLoaded) {
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
      setRandomizeQuestions(test.randomizeQuestions || false);
      setShuffleOptions(test.shuffleOptions || false);
      setViewType((test.viewType as "singlePage" | "oneQuestionPerPage") || "singlePage");
      setEnableCalculator(test.enableCalculator || false);
      setCalculatorType((test.calculatorType as "basic" | "scientific") || "basic");
      setIsLoaded(true);
    }
  }, [test, testId, isLoaded]);

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
          randomizeQuestions: boolean;
          shuffleOptions: boolean;
          viewType: "singlePage" | "oneQuestionPerPage";
          enableCalculator: boolean;
          calculatorType: "basic" | "scientific";
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
              // Ensure correctAnswers are numbers, not strings
              correctAnswers: f.correctAnswers 
                ? f.correctAnswers
                    .map((ans: any) => {
                      if (typeof ans === 'string') {
                        const num = Number(ans);
                        return isNaN(num) ? null : num;
                      }
                      return typeof ans === 'number' ? ans : null;
                    })
                    .filter((ans: any): ans is number => ans !== null && typeof ans === 'number')
                : f.correctAnswers,
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
            randomizeQuestions: options.randomizeQuestions,
            shuffleOptions: options.shuffleOptions,
            viewType: options.viewType,
            enableCalculator: options.enableCalculator,
            calculatorType: options.calculatorType,
          });
        } catch (error) {
          console.error("Failed to update test:", error);
        }
      },
      500
    ),
    [updateTest]
  );

  // Auto-save when test data changes (only after initial load to prevent loops)
  useEffect(() => {
    if (testId && isLoaded) {
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
        randomizeQuestions,
        shuffleOptions,
        viewType,
        enableCalculator,
        calculatorType,
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
    randomizeQuestions,
    shuffleOptions,
    viewType,
    enableCalculator,
    calculatorType,
    debouncedUpdate,
    isLoaded,
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
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

            @media print {
              @page {
                margin: 0.75in;
                size: auto; 
              }
              body {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print {
                display: none !important;
              }
              .page-break {
                page-break-before: always;
              }
              .avoid-break {
                page-break-inside: avoid;
              }
            }

            body {
              margin: 0;
              padding: 40px;
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              color: #1a1a1a;
              background: #fff;
              max-width: 850px;
              margin: 0 auto;
              line-height: 1.5;
            }

            .worksheet-header {
              margin-bottom: 40px;
              padding-bottom: 20px;
              border-bottom: 2px solid #e5e7eb;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .worksheet-title {
              font-size: 28px;
              font-weight: 700;
              color: #111827;
              line-height: 1.2;
            }

            .worksheet-meta {
              display: flex;
              gap: 24px;
              font-size: 14px;
              color: #6b7280;
              margin-top: 8px;
            }

            .meta-item {
              display: flex;
              align-items: center;
              gap: 6px;
            }

            .worksheet-description {
              font-size: 15px;
              color: #4b5563;
              margin-top: 8px;
              white-space: pre-wrap;
            }

            .worksheet-field {
              margin-bottom: 32px;
              position: relative;
            }

            .field-header {
              display: flex;
              gap: 12px;
              margin-bottom: 12px;
            }

            .question-number {
              font-size: 14px;
              font-weight: 600;
              color: #6b7280;
              background: #f3f4f6;
              width: 28px;
              height: 28px;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 6px;
              flex-shrink: 0;
              border: 1px solid #e5e7eb;
            }

            .field-label {
              font-size: 16px;
              font-weight: 600;
              color: #111827;
              flex: 1;
              padding-top: 2px;
            }

            .field-label .required {
              color: #ef4444;
              margin-left: 4px;
              font-size: 14px;
            }

            .help-text {
              font-size: 13px;
              color: #6b7280;
              margin-top: 4px;
              margin-left: 40px;
              font-style: italic;
            }

            .answer-area {
              margin-left: 40px;
              margin-top: 12px;
            }

            .answer-line {
              border-bottom: 1px solid #d1d5db;
              height: 32px;
              width: 100%;
              margin-bottom: 8px;
            }

            .answer-box {
              border: 1px solid #d1d5db;
              border-radius: 8px;
              min-height: 120px;
              background-image: linear-gradient(#e5e7eb 1px, transparent 1px);
              background-size: 100% 32px;
              background-position: 0 31px;
              width: 100%;
            }

            .option-list {
              display: flex;
              flex-direction: column;
              gap: 10px;
            }

            .option-item {
              display: flex;
              align-items: flex-start;
              gap: 12px;
              padding: 8px 0;
            }

            .radio-circle {
              width: 20px;
              height: 20px;
              border: 2px solid #d1d5db;
              border-radius: 50%;
              flex-shrink: 0;
              margin-top: 2px;
            }

            .checkbox-square {
              width: 20px;
              height: 20px;
              border: 2px solid #d1d5db;
              border-radius: 6px;
              flex-shrink: 0;
              margin-top: 2px;
            }

            .option-text {
              font-size: 15px;
              color: #374151;
              line-height: 1.5;
            }

            .image-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
              margin-top: 12px;
            }

            .image-option {
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 12px;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 12px;
            }

            .image-option img {
              max-width: 100%;
              height: 160px;
              object-fit: contain;
              border-radius: 4px;
            }

            .image-checkbox {
              width: 24px;
              height: 24px;
              border: 2px solid #d1d5db;
              border-radius: 50%;
            }

            .info-block {
              background: #f9fafb;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
            }

            .attachment-image {
              max-height: 300px;
              max-width: 100%;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
              margin-bottom: 16px;
              display: block;
            }

            .student-info-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
              border: 1px solid #e5e7eb;
              padding: 24px;
              border-radius: 12px;
            }

            .info-field label {
              display: block;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              color: #6b7280;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
            }

            .info-line {
              border-bottom: 1px solid #d1d5db;
              height: 24px;
            }

            .worksheet-footer {
              margin-top: 60px;
              padding-top: 24px;
              border-top: 1px solid #e5e7eb;
              display: flex;
              justify-content: space-between;
              align-items: center;
              color: #9ca3af;
              font-size: 12px;
            }

            .logo {
              height: 24px;
              opacity: 0.6;
            }
          </style>
        </head>
        <body>
          <div class="worksheet-header">
            <div>
              <div class="worksheet-title">${escapeHtml(testName || "Untitled Test")}</div>
              <div class="worksheet-meta">
                ${estimatedDuration ? `<div class="meta-item">⏱ ${estimatedDuration} mins</div>` : ''}
                ${fields.length > 0 ? `<div class="meta-item">📝 ${fields.filter(f => f.type !== 'pageBreak' && f.type !== 'infoBlock').length} Questions</div>` : ''}
              </div>
            </div>
            ${testDescription ? `<div class="worksheet-description">${escapeHtml(testDescription)}</div>` : ""}
          </div>

          <div class="student-info-section">
            <div class="info-field">
              <label>Full Name</label>
              <div class="info-line"></div>
            </div>
            <div class="info-field">
              <label>Date</label>
              <div class="info-line"></div>
            </div>
          </div>

          ${renderPrintWorksheet()}

          <div class="worksheet-footer">
            <span>Generated by Superlearn</span>
            <img src="/superlearn full.png" alt="Superlearn" class="logo" />
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  };

  const renderPrintWorksheet = () => {
    const sortedFields = [...fields].sort((a, b) => a.order - b.order);
    
    let html = '';
    let questionNumber = 0;

    sortedFields.forEach((field) => {
      const isQuestion = field.type !== "pageBreak" && field.type !== "infoBlock";
      if (isQuestion) {
        questionNumber++;
      }
      
      const breakClass = field.type === "pageBreak" ? "page-break" : "worksheet-field avoid-break";
      
      html += `<div class="${breakClass}">`;
      
      // Handle attachments
      let attachmentHtml = '';
      if (field.fileUrl) {
        attachmentHtml = `<div style="margin-left: 40px;"><img src="${escapeHtml(field.fileUrl)}" class="attachment-image" alt="Attachment" /></div>`;
      }

      if (field.type === "pageBreak") {
        html += `</div>`;
        return;
      }

      if (field.type === "infoBlock") {
        html += `
          <div class="info-block avoid-break">
            ${attachmentHtml}
            ${field.label ? `<div style="font-weight: 500; color: #374151;">${escapeHtml(field.label)}</div>` : ""}
          </div>
        `;
      } else {
        // Render Question Header
        html += `
          <div class="field-header">
            <div class="question-number">${questionNumber}</div>
            <div class="field-label">
              ${escapeHtml(field.label || "Question")}
              ${field.required ? '<span class="required">*</span>' : ""}
              ${field.marks ? `<span style="font-weight: 400; color: #6b7280; font-size: 13px; float: right;">(${field.marks} points)</span>` : ""}
            </div>
          </div>
          ${attachmentHtml}
        `;

        // Render Answer Area based on type
        html += `<div class="answer-area">`;
        
        switch (field.type) {
          case "shortInput":
            html += `<div class="answer-line" style="margin-top: 24px;"></div>`;
            break;

          case "longInput":
            html += `<div class="answer-box"></div>`;
            break;

          case "multipleChoice":
            html += `<div class="option-list">`;
            (field.options || []).forEach((option, idx) => {
              html += `
                <div class="option-item">
                  <div class="radio-circle"></div>
                  <div class="option-text">${escapeHtml(option || `Option ${idx + 1}`)}</div>
                </div>
              `;
            });
            html += `</div>`;
            break;

          case "checkboxes":
            html += `<div class="option-list">`;
            (field.options || []).forEach((option, idx) => {
              html += `
                <div class="option-item">
                  <div class="checkbox-square"></div>
                  <div class="option-text">${escapeHtml(option || `Option ${idx + 1}`)}</div>
                </div>
              `;
            });
            html += `</div>`;
            break;

          case "dropdown":
            html += `
              <div style="border: 1px solid #d1d5db; border-radius: 6px; padding: 10px 12px; display: inline-flex; align-items: center; justify-content: space-between; min-width: 240px; color: #9ca3af;">
                Select an option...
                <span style="font-size: 10px;">▼</span>
              </div>
              <div class="option-list" style="margin-top: 16px; opacity: 0.6;">
                <div style="font-size: 12px; text-transform: uppercase; color: #6b7280; font-weight: 600; margin-bottom: 8px;">Options:</div>
                ${(field.options || []).map(opt => `<span style="display: inline-block; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; margin-right: 8px; margin-bottom: 8px; font-size: 13px; border: 1px solid #e5e7eb;">${escapeHtml(opt)}</span>`).join('')}
              </div>
            `;
            break;

          case "imageChoice":
            html += `<div class="image-grid">`;
            (field.options || []).forEach((option, idx) => {
              const imageUrl = option && option.startsWith("http") ? option : null;
              html += `
                <div class="image-option">
                  ${imageUrl ? `<img src="${escapeHtml(imageUrl)}" alt="Option ${idx + 1}" />` : `<div style="height: 120px; width: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; color: #9ca3af;">Image ${idx + 1}</div>`}
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="radio-circle"></div>
                    <span style="font-size: 13px; font-weight: 500;">Option ${idx + 1}</span>
                  </div>
                </div>
              `;
            });
            html += `</div>`;
            break;
        }

        html += `</div>`; // Close answer-area
        
        if (field.helpText) {
          html += `<div class="help-text">${escapeHtml(field.helpText)}</div>`;
        }
      }
      
      html += `</div>`; // Close worksheet-field
    });

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
      <EditorWelcome />
      <div className="flex flex-1 flex-col min-h-0">
      <div className="border-b px-6 py-4 flex-shrink-0">
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
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 min-h-0 overflow-hidden relative">
            <FieldTypesSidebar onFieldTypeClick={handleFieldTypeClick} />
            <div className="flex-1 overflow-y-auto h-full flex flex-col">
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
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Settings Sidebar */}
          <div className="w-64 border-r bg-white flex flex-col overflow-y-auto flex-shrink-0 min-h-0">
            <div className="p-6 pb-4">
              <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure your test</p>
            </div>
            <nav className="flex-1 px-4 space-y-1">
              <button
                onClick={() => setActiveOptionCategory("share")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeOptionCategory === "share" 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                onClick={() => setActiveOptionCategory("general")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeOptionCategory === "general" 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Settings className="h-4 w-4" />
                General
              </button>
              <button
                onClick={() => setActiveOptionCategory("access")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeOptionCategory === "access" 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Lock className="h-4 w-4" />
                Access & Security
              </button>
              <button
                onClick={() => setActiveOptionCategory("presentation")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeOptionCategory === "presentation" 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <LayoutTemplate className="h-4 w-4" />
                Presentation
              </button>
              <button
                onClick={() => setActiveOptionCategory("marking")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeOptionCategory === "marking" 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <GraduationCap className="h-4 w-4" />
                Marking & Grading
              </button>
              <button
                onClick={() => setActiveOptionCategory("tools")}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
                  activeOptionCategory === "tools" 
                    ? "bg-primary/10 text-primary" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Calculator className="h-4 w-4" />
                Tools
              </button>
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Tools Category */}
              {activeOptionCategory === "tools" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Tools</CardTitle>
                    <CardDescription>Enable helper tools for students during the test</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="enable-calculator" className="text-base font-medium">Enable Calculator</Label>
                          <p className="text-sm text-muted-foreground">Allow students to use an on-screen calculator</p>
                        </div>
                        <Checkbox
                          id="enable-calculator"
                          checked={enableCalculator}
                          onCheckedChange={(checked) => setEnableCalculator(checked === true)}
                        />
                      </div>

                      {enableCalculator && (
                        <div className="space-y-2 pt-2 pl-4 border-l-2 border-slate-200 ml-2">
                          <Label>Calculator Type</Label>
                          <Select
                            value={calculatorType}
                            onValueChange={(value) => setCalculatorType(value as "basic" | "scientific")}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Basic (Four Function)</SelectItem>
                              <SelectItem value="scientific">Scientific</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-muted-foreground">
                            Choose the type of calculator available to students.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Share Category */}
              {activeOptionCategory === "share" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Share Test</CardTitle>
                    <CardDescription>Share this test with your students using the link below</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Public Link</Label>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-3 px-4 py-2 border rounded-lg bg-muted/50">
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
                    </div>

                    <div className="space-y-2">
                      <Label>QR Code</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          onClick={() => setQrCodeOpen(true)}
                          variant="outline"
                          disabled={!testId}
                          className="w-full sm:w-auto"
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Show QR Code
                        </Button>
                        <p className="text-sm text-muted-foreground">
                          Display a QR code for students to scan
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* General Category */}
              {activeOptionCategory === "general" && (
                <Card>
                  <CardHeader>
                    <CardTitle>General Information</CardTitle>
                    <CardDescription>Basic details and time settings for your test</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                        rows={4}
                      />
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        <p className="text-xs text-muted-foreground">Leave empty for unlimited attempts</p>
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
                      <p className="text-xs text-muted-foreground">
                        Test will automatically submit when this time expires. Leave empty for no limit.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Access Category */}
              {activeOptionCategory === "access" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Access & Security</CardTitle>
                    <CardDescription>Control who can access the test and security restrictions</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 border p-4 rounded-lg bg-slate-50">
                        <Checkbox
                          id="require-auth"
                          checked={requireAuth}
                          onCheckedChange={(checked) => setRequireAuth(checked === true)}
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor="require-auth" className="font-medium cursor-pointer">
                            Require Email Address
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            Students must provide an email address to start the test
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 border p-4 rounded-lg bg-slate-50">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            id="password-protection"
                            checked={passwordProtectionEnabled}
                            onCheckedChange={(checked) => {
                              setPasswordProtectionEnabled(checked === true);
                              if (!checked) {
                                setPassword("");
                              }
                            }}
                            className="mt-1"
                          />
                          <div>
                            <Label htmlFor="password-protection" className="font-medium cursor-pointer">
                              Password Protection
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                              Require a password to access the test
                            </p>
                          </div>
                        </div>
                        {passwordProtectionEnabled && (
                          <div className="ml-7">
                            <Input
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter access password"
                              className="max-w-md"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Separator />
                    
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Browser Restrictions</h3>
                      
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                          <div className="space-y-0.5">
                            <Label htmlFor="disable-copy-paste" className="text-base font-medium">Disable Copy/Paste</Label>
                            <p className="text-sm text-muted-foreground">Prevent copying text from or pasting into the test</p>
                          </div>
                          <Checkbox
                            id="disable-copy-paste"
                            checked={disableCopyPaste}
                            onCheckedChange={(checked) => setDisableCopyPaste(checked === true)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                          <div className="space-y-0.5">
                            <Label htmlFor="require-fullscreen" className="text-base font-medium">Require Full Screen</Label>
                            <p className="text-sm text-muted-foreground">Force the browser into full screen mode</p>
                          </div>
                          <Checkbox
                            id="require-fullscreen"
                            checked={requireFullScreen}
                            onCheckedChange={(checked) => setRequireFullScreen(checked === true)}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                          <div className="space-y-0.5">
                            <Label htmlFor="block-tab-switching" className="text-base font-medium">Block Tab Switching</Label>
                            <p className="text-sm text-muted-foreground">Detect and warn/block when student switches tabs</p>
                          </div>
                          <Checkbox
                            id="block-tab-switching"
                            checked={blockTabSwitching}
                            onCheckedChange={(checked) => setBlockTabSwitching(checked === true)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-md bg-white">
                          <div className="space-y-0.5">
                            <Label htmlFor="allow-back-navigation" className="text-base font-medium">Allow Back Navigation</Label>
                            <p className="text-sm text-muted-foreground">Allow students to go back to previous questions (if not randomized)</p>
                          </div>
                          <Checkbox
                            id="allow-back-navigation"
                            checked={allowBackNavigation}
                            onCheckedChange={(checked) => setAllowBackNavigation(checked === true)}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Presentation Category */}
              {activeOptionCategory === "presentation" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Presentation</CardTitle>
                    <CardDescription>Configure how questions and options are displayed to students</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="randomize-questions" className="text-base font-medium">Randomize Questions</Label>
                          <p className="text-sm text-muted-foreground">Shuffle the order of questions for each student</p>
                        </div>
                        <Checkbox
                          id="randomize-questions"
                          checked={randomizeQuestions}
                          onCheckedChange={(checked) => setRandomizeQuestions(checked === true)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="shuffle-options" className="text-base font-medium">Shuffle Options</Label>
                          <p className="text-sm text-muted-foreground">Randomize answer choices within Multiple Choice/Checkbox questions</p>
                        </div>
                        <Checkbox
                          id="shuffle-options"
                          checked={shuffleOptions}
                          onCheckedChange={(checked) => setShuffleOptions(checked === true)}
                        />
                      </div>

                      <div className="space-y-2 pt-2">
                        <Label>View Type</Label>
                        <Select
                          value={viewType}
                          onValueChange={(value) => setViewType(value as "singlePage" | "oneQuestionPerPage")}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="singlePage">All questions on one page (default)</SelectItem>
                            <SelectItem value="oneQuestionPerPage">One question per page</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">
                          Choose how questions are presented to the student. "All questions on one page" respects manual page breaks.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Marking Category */}
              {activeOptionCategory === "marking" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Marking & Grading</CardTitle>
                    <CardDescription>Configure grading criteria and feedback settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                      <p className="text-xs text-muted-foreground">Minimum percentage required to pass</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="instant-feedback" className="text-base font-medium">Instant Feedback</Label>
                          <p className="text-sm text-muted-foreground">Show score immediately after submission</p>
                        </div>
                        <Checkbox
                          id="instant-feedback"
                          checked={instantFeedback}
                          onCheckedChange={(checked) => setInstantFeedback(checked === true)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                          <Label htmlFor="show-answer-key" className="text-base font-medium">Show Answer Key</Label>
                          <p className="text-sm text-muted-foreground">Display correct answers to students after submission</p>
                        </div>
                        <Checkbox
                          id="show-answer-key"
                          checked={showAnswerKey}
                          onCheckedChange={(checked) => setShowAnswerKey(checked === true)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* QR Code Modal - Keep it rendered if open, but better placed outside the conditional if possible, but here works */}
          <Dialog open={qrCodeOpen} onOpenChange={setQrCodeOpen}>
            <DialogContent className="max-w-none w-screen h-screen m-0 p-0 rounded-none border-0 bg-background fixed inset-0 translate-x-0 translate-y-0">
              <div className="flex flex-col items-center justify-center h-full w-full gap-8 p-8">
                <div className="flex flex-col items-center gap-6">
                  <h2 className="text-3xl font-bold">Scan QR Code</h2>
                  <p className="text-muted-foreground text-center max-w-md">
                    Scan this QR code to access the test link on your mobile device
                  </p>
                  {testId && (
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                      <QRCodeSVG
                        value={`${window.location.origin}/test/${testId}`}
                        size={400}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  )}
                  {testId && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">Or copy the link:</p>
                      <p className="text-sm font-mono text-primary break-all max-w-md">
                        {`${window.location.origin}/test/${testId}`}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => setQrCodeOpen(false)}
                  variant="outline"
                  size="lg"
                  className="mt-4"
                >
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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

  // Calculate question numbers
  const questionNumberMap = new Map<string, number>();
  let qNum = 1;
  fields
    .sort((a, b) => a.order - b.order)
    .forEach((f) => {
      if (f.type !== "pageBreak" && f.type !== "infoBlock") {
        questionNumberMap.set(f.id, qNum++);
      }
    });

  const renderField = (field: TestField) => {
    const fieldValue = formData[field.id] || "";
    const questionNumber = questionNumberMap.get(field.id);

    // Common wrapper content
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <div className="mb-6 group">
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 bg-white">
            <div className="flex gap-5">
              {questionNumber !== undefined && (
                <div className="flex-none hidden sm:block">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600 font-mono border border-slate-200">
                    {questionNumber}
                  </div>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-4 sm:hidden">
                  {questionNumber !== undefined && (
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 font-mono border border-slate-200 shrink-0">
                      {questionNumber}
                    </div>
                  )}
                  <Label className="text-lg font-semibold text-slate-900 block leading-tight">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                  </Label>
                </div>

                {field.fileUrl && (
                   <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 relative bg-gray-50">
                    <img 
                      src={field.fileUrl} 
                      alt="Attachment" 
                      className="max-h-[400px] w-full object-contain bg-gray-50"
                    />
                  </div>
                )}

                {field.latexContent && (
                  <div 
                    className="mb-4 overflow-x-auto p-2"
                    dangerouslySetInnerHTML={{ 
                      __html: katex.renderToString(field.latexContent, { 
                        throwOnError: false,
                        displayMode: true 
                      }) 
                    }}
                  />
                )}

                <div className="mb-6 hidden sm:block">
                  <Label className="text-xl font-semibold text-slate-900 block leading-normal">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                  </Label>
                  {field.helpText && (
                    <p className="text-sm text-slate-500 mt-2 leading-relaxed">{field.helpText}</p>
                  )}
                </div>
                {field.helpText && (
                  <p className="text-sm text-slate-500 mb-4 sm:hidden leading-relaxed">{field.helpText}</p>
                )}
                
                <div className="space-y-4">{children}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );

    switch (field.type) {
      case "shortInput":
        return (
          <Wrapper>
            <Input
              id={field.id}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Type your answer here..."}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className="max-w-xl text-base h-12 rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </Wrapper>
        );

      case "longInput":
        return (
          <Wrapper>
            <Textarea
              id={field.id}
              value={fieldValue}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder || "Type your detailed answer here..."}
              required={field.required}
              minLength={field.minLength}
              maxLength={field.maxLength}
              className="min-h-[140px] text-base resize-y rounded-xl border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm p-4"
            />
          </Wrapper>
        );

      case "multipleChoice":
        return (
          <Wrapper>
            <div className="space-y-3">
              {(field.options || []).map((option, index) => {
                const isSelected = fieldValue === String(index);
                return (
                  <div
                    key={index}
                    onClick={() => handleInputChange(field.id, String(index))}
                    className={cn(
                      "flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 group",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-slate-200 hover:border-primary/50 hover:bg-slate-50 hover:shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-all duration-200 shrink-0",
                        isSelected
                          ? "border-primary bg-primary text-white scale-110"
                          : "border-slate-300 group-hover:border-primary/50 bg-white"
                      )}
                    >
                      {isSelected && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm" />
                      )}
                    </div>
                    <span className={cn("text-base transition-colors", isSelected ? "text-primary font-medium" : "text-slate-700")}>
                      {option || `Option ${index + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );

      case "checkboxes":
        return (
          <Wrapper>
            <div className="space-y-3">
              {(field.options || []).map((option, index) => {
                const checkedValues = Array.isArray(fieldValue) ? fieldValue : [];
                const isChecked = checkedValues.includes(String(index));
                return (
                  <div
                    key={index}
                    onClick={() => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (isChecked) {
                        handleInputChange(field.id, currentValues.filter((v: string) => v !== String(index)));
                      } else {
                        handleInputChange(field.id, [...currentValues, String(index)]);
                      }
                    }}
                    className={cn(
                      "flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 group",
                      isChecked
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-slate-200 hover:border-primary/50 hover:bg-slate-50 hover:shadow-sm"
                    )}
                  >
                    <div
                      className={cn(
                        "w-6 h-6 rounded-md border-2 flex items-center justify-center mr-4 transition-all duration-200 shrink-0",
                        isChecked
                          ? "border-primary bg-primary text-white scale-110"
                          : "border-slate-300 group-hover:border-primary/50 bg-white"
                      )}
                    >
                      {isChecked && <Check className="w-4 h-4" />}
                    </div>
                    <span className={cn("text-base transition-colors", isChecked ? "text-primary font-medium" : "text-slate-700")}>
                      {option || `Option ${index + 1}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );

      case "dropdown":
        return (
          <Wrapper>
            <Select
              value={fieldValue}
              onValueChange={(value) => handleInputChange(field.id, value)}
              required={field.required}
            >
              <SelectTrigger className="max-w-xl text-base h-12 rounded-xl border-slate-200 focus:ring-primary/10 shadow-sm">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {(field.options || []).map((option, index) => (
                  <SelectItem key={index} value={String(index)} className="text-base py-3 cursor-pointer">
                    {option || `Option ${index + 1}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Wrapper>
        );

      case "imageChoice":
        return (
          <Wrapper>
             <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {(field.options || []).map((option, index) => {
                const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
                const isSelected = selectedValues.includes(String(index));
                const imageUrl = option && option.startsWith("http") ? option : undefined;
                
                return (
                  <div
                    key={index}
                    onClick={() => {
                      const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                      if (isSelected) {
                        handleInputChange(field.id, currentValues.filter((v: string) => v !== String(index)));
                      } else {
                        handleInputChange(field.id, [...currentValues, String(index)]);
                      }
                    }}
                    className={cn(
                      "relative cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 group hover:shadow-md",
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 shadow-md scale-[1.02]"
                        : "border-slate-200 hover:border-primary/50"
                    )}
                  >
                    <div className="aspect-square bg-slate-50 relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={`Option ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">
                          Option {index + 1}
                        </div>
                      )}
                      <div className={cn(
                          "absolute inset-0 flex items-center justify-center transition-all duration-200",
                          isSelected ? "bg-primary/20 backdrop-blur-[2px]" : "opacity-0 group-hover:opacity-100 bg-black/5"
                      )}>
                          {isSelected && (
                              <div className="bg-primary text-white rounded-full p-2 shadow-lg transform scale-110">
                                <Check className="w-8 h-8" />
                              </div>
                          )}
                      </div>
                    </div>
                    {!imageUrl && (
                      <div className="p-3 text-center text-sm font-medium border-t bg-white text-slate-700">
                        {option || `Option ${index + 1}`}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Wrapper>
        );

      case "pageBreak":
        return (
          <div key={field.id} className="py-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200"></div>
            <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              Page Break
            </span>
            <div className="h-px flex-1 bg-slate-200"></div>
          </div>
        );

      case "infoBlock":
        return (
          <div key={field.id} className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 shadow-sm">
            {field.fileUrl && (
              <div className="mb-4 rounded-lg overflow-hidden border border-blue-100">
                <img 
                  src={field.fileUrl} 
                  alt="Attachment" 
                  className="max-h-[400px] w-full object-contain bg-white/50"
                />
              </div>
            )}
            {field.latexContent && (
              <div 
                className="mb-4 overflow-x-auto"
                dangerouslySetInnerHTML={{ 
                  __html: katex.renderToString(field.latexContent, { 
                    throwOnError: false,
                    displayMode: true 
                  }) 
                }}
              />
            )}
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              {field.label}
            </h3>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex flex-1 overflow-auto bg-slate-50/50">
      <div className="flex-1 max-w-3xl mx-auto w-full p-6 md:p-8 space-y-6">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{testName || "Untitled Test"}</h1>
          {testDescription && (
            <p className="text-slate-600 text-lg leading-relaxed">{testDescription}</p>
          )}
        </div>
        
        <form className="space-y-6 pb-20">
          {fields
            .sort((a, b) => a.order - b.order)
            .map((field) => (
              <div key={field.id}>
                {renderField(field)}
              </div>
            ))}
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
  const deleteSubmission = useMutation(api.tests.deleteSubmission);
  const autoMarkSubmission = useAction((api as any).ai.autoMarkSubmission);
  const [submissionToDelete, setSubmissionToDelete] = useState<Id<"testSubmissions"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAutoMarking, setIsAutoMarking] = useState(false);
  const [autoMarkProgress, setAutoMarkProgress] = useState({ current: 0, total: 0 });
  const [activeMarkingCategory, setActiveMarkingCategory] = useState("overview");
  const [showAutoMarkConfirm, setShowAutoMarkConfirm] = useState(false);

  if (submissionsData === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const { submissions, statistics, questionAnalytics } = submissionsData;

  const handleAutoMarkAllClick = () => {
    if (!submissions) return;
    const unmarked = submissions.filter((s) => !s.isMarked);
    
    if (unmarked.length === 0) {
      toast.info("No unmarked submissions to auto-mark");
      return;
    }

    setShowAutoMarkConfirm(true);
  };

  const handleAutoMarkAllConfirm = async () => {
    if (!submissions) return;
    const unmarked = submissions.filter((s) => !s.isMarked);
    
    setShowAutoMarkConfirm(false);
    setIsAutoMarking(true);
    setAutoMarkProgress({ current: 0, total: unmarked.length });

    let successCount = 0;

    for (let i = 0; i < unmarked.length; i++) {
      const sub = unmarked[i];
      try {
        await autoMarkSubmission({ submissionId: sub._id });
        successCount++;
      } catch (error) {
        console.error(`Failed to mark submission ${sub._id}:`, error);
        toast.error(`Failed to mark submission from ${sub.respondentName || "Anonymous"}`);
      }
      setAutoMarkProgress((prev) => ({ ...prev, current: i + 1 }));
    }

    setIsAutoMarking(false);
    if (successCount > 0) {
      toast.success(`Successfully auto-marked ${successCount} submissions`);
    }
  };

  const handleExportCSV = () => {
    if (!submissions || submissions.length === 0) return;

    // Create CSV headers
    const headers = [
      "Name",
      "Email",
      "Submitted At",
      "Score",
      "Max Score",
      "Percentage",
      "Status"
    ];

    // Add question columns
    const questionMap = new Map();
    if (submissionsData.questionAnalytics) {
      submissionsData.questionAnalytics.forEach((q) => {
        headers.push(`"${q.label.replace(/"/g, '""')}"`); // Escape quotes in label
        questionMap.set(q.fieldId, q.label);
      });
    }

    // Create CSV rows
    const csvRows = [headers.join(",")];

    submissions.forEach((submission) => {
      const row = [
        `"${(submission.respondentName || "Anonymous").replace(/"/g, '""')}"`,
        `"${(submission.respondentEmail || "").replace(/"/g, '""')}"`,
        `"${new Date(submission.submittedAt).toLocaleString()}"`,
        submission.score ?? 0,
        submission.maxScore ?? 0,
        `${submission.percentage ?? 0}%`,
        submission.isMarked ? "Marked" : "Submitted"
      ];

      // Add field marks
      if (submissionsData.questionAnalytics) {
        const fieldMarks = submission.fieldMarks as Record<string, number> | undefined;
        submissionsData.questionAnalytics.forEach((q) => {
          const mark = fieldMarks?.[q.fieldId];
          row.push(mark !== undefined ? mark.toString() : "-");
        });
      }

      csvRows.push(row.join(","));
    });

    // Create and download file
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `submissions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteSubmission = async (submissionId: Id<"testSubmissions">) => {
    setIsDeleting(true);
    try {
      await deleteSubmission({ submissionId });
      toast.success("Submission deleted");
      setSubmissionToDelete(null);
    } catch (error) {
      toast.error("Failed to delete submission");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

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
    <div className="flex flex-1 overflow-hidden min-h-0">
      {/* Marking Sidebar */}
      <div className="w-64 border-r bg-white flex flex-col overflow-y-auto flex-shrink-0 min-h-0">
        <div className="p-6 pb-4">
          <h2 className="text-lg font-semibold text-slate-900">Marking</h2>
          <p className="text-sm text-muted-foreground mt-1">Review submissions & stats</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveMarkingCategory("overview")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
              activeMarkingCategory === "overview" 
                ? "bg-primary/10 text-primary" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setActiveMarkingCategory("submissions")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
              activeMarkingCategory === "submissions" 
                ? "bg-primary/10 text-primary" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Users className="h-4 w-4" />
            Submissions
          </button>
          <button
            onClick={() => setActiveMarkingCategory("analysis")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left",
              activeMarkingCategory === "analysis" 
                ? "bg-primary/10 text-primary" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            Item Analysis
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Overview Category */}
          {activeMarkingCategory === "overview" && (
             <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
                     <p className="text-muted-foreground">Key statistics for this test</p>
                   </div>
                   <Button variant="outline" onClick={handleExportCSV} disabled={submissions.length === 0}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                   </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statistics.total}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statistics.meanPercentage}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Marked</CardTitle>
                        <Check className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{statistics.marked} / {statistics.total}</div>
                      </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Charts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Class Accuracy</CardTitle>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Marking Status</CardTitle>
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
             </div>
          )}

          {/* Submissions Category */}
          {activeMarkingCategory === "submissions" && (
             <div className="space-y-6">
                <div>
                     <h2 className="text-2xl font-semibold tracking-tight">Submissions</h2>
                     <p className="text-muted-foreground">Manage and mark individual submissions</p>
                </div>
                
                <div className="flex justify-end">
                   <Button 
                      onClick={handleAutoMarkAllClick} 
                      disabled={isAutoMarking || submissions.filter(s => !s.isMarked).length === 0}
                    >
                      {isAutoMarking ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Marking {autoMarkProgress.current}/{autoMarkProgress.total}
                        </>
                      ) : (
                        <>
                          <BrainCircuit className="mr-2 h-4 w-4" />
                          Auto-Mark All ({submissions.filter(s => !s.isMarked).length})
                        </>
                      )}
                   </Button>
                </div>

                <Card>
                   <CardContent className="p-0">
                        {submissions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                              No submissions yet
                            </div>
                          ) : (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="pl-6">Name</TableHead>
                                  <TableHead>Email</TableHead>
                                  <TableHead>Submitted</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Grade</TableHead>
                                  <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {submissions.map((submission) => (
                                  <TableRow key={submission._id}>
                                    <TableCell className="font-medium pl-6">
                                      {submission.respondentName || "Anonymous"}
                                    </TableCell>
                                    <TableCell>{submission.respondentEmail || "-"}</TableCell>
                                    <TableCell>
                                      {new Date(submission.submittedAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={submission.isMarked ? "default" : "secondary"}>
                                          {submission.isMarked ? "Marked" : "Submitted"}
                                        </Badge>
                                        {submission.tabSwitchCount !== undefined && submission.tabSwitchCount > 0 && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1 text-yellow-600">
                                                  <AlertCircle className="h-4 w-4" />
                                                  <span className="text-xs font-medium">{submission.tabSwitchCount}</span>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Tab switched {submission.tabSwitchCount} time{submission.tabSwitchCount !== 1 ? 's' : ''} during assessment</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                        {submission.copyPasteCount !== undefined && submission.copyPasteCount > 0 && (
                                          <TooltipProvider>
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <div className="flex items-center gap-1 text-red-600">
                                                  <AlertCircle className="h-4 w-4" />
                                                  <span className="text-xs font-medium">{submission.copyPasteCount}</span>
                                                </div>
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Copy/paste attempted {submission.copyPasteCount} time{submission.copyPasteCount !== 1 ? 's' : ''} during assessment</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </TooltipProvider>
                                        )}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      {submission.percentage !== undefined
                                        ? `${submission.percentage}%`
                                        : "-"}
                                    </TableCell>
                                    <TableCell className="text-right pr-6">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant={submission.isMarked ? "outline" : "default"}
                                          size="sm"
                                          onClick={() => navigate(`/dashboard/test/mark/${submission._id}`)}
                                        >
                                          {submission.isMarked ? "Review" : "Mark"}
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                          onClick={() => setSubmissionToDelete(submission._id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          )}
                   </CardContent>
                </Card>
             </div>
          )}

          {/* Analysis Category */}
          {activeMarkingCategory === "analysis" && (
             <div className="space-y-6">
                <div>
                     <h2 className="text-2xl font-semibold tracking-tight">Item Analysis</h2>
                     <p className="text-muted-foreground">Detailed performance breakdown per question</p>
                </div>
                
                {questionAnalytics && questionAnalytics.length > 0 ? (
                    <>
                        <div className="grid gap-4 md:grid-cols-3">
                          {questionAnalytics.slice(0, 3).map((q, i) => (
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
                              </CardContent>
                            </Card>
                          ))}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Question Performance</CardTitle>
                                <CardDescription>
                                    Average performance per question based on {statistics.marked} marked submissions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[600px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={questionAnalytics}
                                      layout="vertical"
                                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                      <XAxis type="number" domain={[0, 100]} unit="%" />
                                      <YAxis 
                                        dataKey="label" 
                                        type="category" 
                                        width={200} 
                                        tickFormatter={(value) => value.length > 30 ? `${value.substring(0, 30)}...` : value}
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
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="text-center py-12 text-muted-foreground">
                            No question data available yet. Mark some submissions to see analysis.
                        </CardContent>
                    </Card>
                )}
             </div>
          )}

        </div>
      </div>

      {/* Auto-Mark Confirmation Dialog */}
      <Dialog open={showAutoMarkConfirm} onOpenChange={setShowAutoMarkConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto-Mark All Submissions</DialogTitle>
            <DialogDescription>
              This will mark {submissions?.filter((s) => !s.isMarked).length || 0} unmarked submissions using AI. 
              Each submission will use at least 1 credit, and more if the token cost is higher based on standard pricing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoMarkConfirm(false)} disabled={isAutoMarking}>
              Cancel
            </Button>
            <Button 
              onClick={handleAutoMarkAllConfirm}
              disabled={isAutoMarking}
            >
              {isAutoMarking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!submissionToDelete} onOpenChange={(open) => !open && setSubmissionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this submission? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmissionToDelete(null)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={() => submissionToDelete && handleDeleteSubmission(submissionToDelete)}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

