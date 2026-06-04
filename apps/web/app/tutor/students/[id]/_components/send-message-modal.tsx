"use client";

import { useState, useTransition } from "react";
import { sendMessageToStudent } from "~/actions/tutor";
import { useToast } from "~/app/admin/_components/toast-context";

type SendMessageModalProps = {
  studentId: string;
  studentName: string;
};

export function SendMessageModal({
  studentId,
  studentName,
}: SendMessageModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [isPending, startTransition] = useTransition();
  const { addToast } = useToast();

  const isFormValid = content.trim().length > 0 && !isPending;

  const handleSubmit = () => {
    if (!isFormValid) return;

    startTransition(async () => {
      try {
        await sendMessageToStudent(studentId, content.trim());
        addToast("Message sent to student", "success");
        setIsOpen(false);
        setContent("");
      } catch (error) {
        addToast(
          error instanceof Error ? error.message : "Failed to send message",
          "error"
        );
      }
    });
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Send Message
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900">
            Message {studentName}
          </h2>
        </div>

        <div className="px-6 py-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            placeholder="Type your message..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 min-h-32"
          />
        </div>

        <div className="px-6 py-4 border-t bg-slate-50 flex gap-2 justify-end">
          <button
            onClick={() => {
              setIsOpen(false);
              setContent("");
            }}
            disabled={isPending}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {isPending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
