"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "~/lib/utils";

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
  studentId: string;
  senderRole: string;
}

interface ConversationThread {
  studentId: string;
  studentName: string;
  studentEmail: string;
  lastMessageAt: Date;
  messageCount: number;
  messages: Message[];
}

interface TutorMessagesDisplayProps {
  threads: ConversationThread[];
  currentUserId: string;
}

export function TutorMessagesDisplay({
  threads = [],
}: TutorMessagesDisplayProps) {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    threads.length > 0 ? threads[0]?.studentId ?? null : null
  );

  const selectedThread = threads.find((t) => t.studentId === selectedStudentId);

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
              const isSelected = thread.studentId === selectedStudentId;
              return (
                <button
                  key={thread.studentId}
                  onClick={() => setSelectedStudentId(thread.studentId)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors hover:bg-muted/50",
                    isSelected && "bg-muted"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {thread.studentName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {thread.studentEmail}
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
                {selectedThread.studentName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedThread.studentEmail}
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
              {selectedThread.messages
                .slice()
                .reverse()
                .map((msg) => {
                  const isOwnMessage = msg.senderRole === "tutor";
                  return (
                    <div
                      key={msg.id}
                      className={cn("flex", isOwnMessage ? "justify-end" : "justify-start")}
                    >
                      <div className="max-w-xs sm:max-w-md">
                        {!isOwnMessage && (
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Student reply
                          </p>
                        )}
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
                          {formatTimeAgo(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Info footer */}
            <div className="border-t bg-muted/30 px-4 py-3 sm:px-6">
              <p className="text-xs text-muted-foreground">
                {selectedThread.messageCount} message
                {selectedThread.messageCount !== 1 ? "s" : ""} in this conversation
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
