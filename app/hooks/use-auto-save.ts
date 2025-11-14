import { useEffect, useRef, useState, useCallback } from "react";

interface UseAutoSaveOptions {
  onSave: () => Promise<void> | void;
  delay?: number;
}

interface UseAutoSaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  triggerSave: () => void;
  markDirty: () => void;
}

export function useAutoSave({
  onSave,
  delay = 1000,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const performSave = useCallback(async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      await onSave();
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, onSave]);

  const triggerSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    performSave();
  }, [performSave]);

  const markDirty = useCallback(() => {
    setIsDirty(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, delay);
  }, [delay, performSave]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    triggerSave,
    markDirty,
  };
}

