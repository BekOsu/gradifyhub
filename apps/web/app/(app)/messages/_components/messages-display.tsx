"use client";

import { useState, useTransition } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";
import { sendMessageToTutor } from "~/actions/tutor";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

interface Message {
  id: string;
  content: string;
  createdAt: Date;
  tutorId: string;
  senderRole: string;
}

interface ConversationThread {
  tutorId: string;
  tutorName: string;
  tutorEmail: string;
  lastMessageAt: Date;
  messageCount: number;
  messages: Message[];
}

interface MessagesDisplayProps {
  threads: ConversationThread[];
  currentUserId: string;
}

export function MessagesDisplay({ threads = [] }: MessagesDisplayProps) {
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(
    threads.length > 0 ? threads[0]?.tutorId ?? null : null
  );
  const [replyContent, setReplyContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sendError, setSendError] = useState<string | null>(null);

  const selectedThread = threads.find((t) => t.tutorId === selectedTutorId);

  const handleSendReply = () => {
    if (!replyContent.trim() || !selectedTutorId || isPending) return;
    setSendError(null);

    startTransition(async () => {
      const result = await sendMessageToTutor(selectedTutorId, replyContent.trim());
      if (result.success) {
        setReplyContent("");
      } else {
        setSendError(result.error ?? "Failed to send message");
      }
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Thread list */}
      <div className="lg:col-span-1">
        <div className="rounded-lg border bg-background">
          <div className="border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Conversations</h3>
          </div>
          <div className="divide-y">
            {threads.map((thread) => {
              const isSelected = thread.tutorId === selectedTutorId;
              return (
                <button
                  key={thread.tutorId}
                  onClick={() => setSelectedTutorId(thread.tutorId)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {thread.tutorName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {thread.tutorEmail}
                      </p>
                    </div>
                    {isSelected && (
                      <ChevronRight className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                    )}
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {formatTimeAgo(thread.lastMessageAt)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message view */}
      <div className="lg:col-span-2">
        {selectedThread ? (
          <div className="rounded-lg border bg-background h-full flex flex-col">
            {/* Header */}
            <div className="border-b px-4 py-3 sm:px-6">
              <h3 className="font-semibold text-foreground">
                {selectedThread.tutorName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedThread.tutorEmail}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
              {selectedThread.messages
                .slice()
                .reverse()
                .map((msg) => {
                  const isOwnMessage = msg.senderRole === "student";
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}
                    >
                      <div className="max-w-xs sm:max-w-md">
                        <div
                          className={cn(
                            "rounded-lg px-4 py-2.5",
                            isOwnMessage ? "bg-primary/10" : "bg-muted"
                          )}
                        >
                          <p className="text-sm text-foreground break-words">
                            {msg.content}
                          </p>
                        </div>
                        <p
                          className={cn(
                            "mt-1 text-xs text-muted-foreground",
                            isOwnMessage ? "text-right" : "text-left"
                          )}
                        >
                          {isOwnMessage ? "You · " : ""}
                          {formatTimeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Reply composer */}
            <div className="border-t px-4 py-3 sm:px-6 space-y-2">
              {sendError && (
                <div className="rounded-lg border border-red-400 bg-red-500/10 p-2.5 text-sm text-red-700">
                  {sendError}
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                  disabled={isPending}
                  placeholder="Reply to your tutor..."
                  rows={2}
                  className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isPending}
                  className="self-end rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? "Sending..." : "Send"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Shift+Enter for newline</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
