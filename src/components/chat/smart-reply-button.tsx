"use client";

import { Button } from "@/components/ui/button";

interface SmartReplyButtonProps {
  text: string;
  onClick: () => void;
}

export function SmartReplyButton({ text, onClick }: SmartReplyButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="whitespace-nowrap rounded-full border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
    >
      {text}
    </Button>
  );
}
