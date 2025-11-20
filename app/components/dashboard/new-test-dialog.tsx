"use client";

import { useState } from "react";
import { useNavigate } from "react-router";
import { ClipboardList, PieChart, MessageSquare } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { cn } from "~/lib/utils";

interface NewTestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ContentType = "test" | "survey" | "essay" | null;

export function NewTestDialog({ open, onOpenChange }: NewTestDialogProps) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState<ContentType>(null);
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!selectedType || !name.trim()) return;

    if (selectedType === "test") {
      onOpenChange(false);
      navigate(`/dashboard/test/new?name=${encodeURIComponent(name.trim())}&type=${selectedType}`);
    }
    // Survey and Essay are coming soon
  };

  const handleClose = () => {
    setSelectedType(null);
    setName("");
    onOpenChange(false);
  };

  const contentTypes = [
    {
      type: "test" as const,
      label: "Test",
      icon: ClipboardList,
      description: "Create assessments with multiple choice, true/false, and short answer questions",
      available: true,
    },
    {
      type: "survey" as const,
      label: "Survey",
      icon: PieChart,
      description: "Gather feedback and insights with customizable survey forms",
      available: false,
    },
    {
      type: "essay" as const,
      label: "Essay",
      icon: MessageSquare,
      description: "Design essay prompts and evaluate written responses",
      available: false,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New</DialogTitle>
          <DialogDescription>
            Choose the type of content you want to create
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter a name for your content"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            {contentTypes.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedType === item.type;
              const isDisabled = !item.available;

              return (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => !isDisabled && setSelectedType(item.type)}
                  disabled={isDisabled}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border-2 transition-all",
                    "hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isSelected && "border-primary bg-accent",
                    !isSelected && "border-border",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-md",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{item.label}</h3>
                        {isDisabled && (
                          <span className="text-xs text-muted-foreground">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedType || !name.trim() || selectedType !== "test"}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

