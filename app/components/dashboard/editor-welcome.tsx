"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { GripVertical, Settings2, Share2 } from "lucide-react";

const EDITOR_WELCOME_KEY = "xam-editor-welcome-seen";

interface EditorWelcomeProps {
  onClose?: () => void;
}

export function EditorWelcome({ onClose }: EditorWelcomeProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(EDITOR_WELCOME_KEY);
    if (!hasSeenWelcome) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(EDITOR_WELCOME_KEY, "true");
    setOpen(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to the Test Editor</DialogTitle>
          <DialogDescription>
            Create powerful assessments in just a few steps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GripVertical className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Drag & Drop Questions</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Add questions by dragging field types from the left sidebar onto your test canvas.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Configure Properties</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Click on any question to edit its properties, set correct answers, and assign marks.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-sm">Share & Export</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                Use the Options tab to configure sharing settings, generate QR codes, or export your test.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Got it, let's start!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function resetEditorWelcome() {
  localStorage.removeItem(EDITOR_WELCOME_KEY);
}

