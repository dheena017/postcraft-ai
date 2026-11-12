'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Send, Calendar, CheckCircle2 } from 'lucide-react';
import { ChannelTarget } from '@/types/provider';

interface QuickPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  initialPrompt: string;
}

export const QuickPublishModal: React.FC<QuickPublishModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  initialPrompt,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [boardId, setBoardId] = useState('board_default_1');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');
  const [boards, setBoards] = useState<ChannelTarget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<string | null>(null);

  useEffect(() => {
    if (initialPrompt) {
      setTitle(initialPrompt.slice(0, 60));
      setDescription(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/providers/pinterest/boards')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setBoards(data);
            if (data.length > 0) setBoardId(data[0].id);
          }
        })
        .catch(() => {});

      // Default schedule time = 1 hour from now
      const defaultTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16);
      setScheduleTime(defaultTime);
      setSuccessResult(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessResult(null);

    try {
      if (isScheduled) {
        // Add to Queue
        const res = await fetch('/api/queue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: initialPrompt,
            title,
            description,
            boardName: boardId,
            destinationUrl,
            aspectRatio: '2:3',
            providerId: 'pinterest',
            scheduledFor: new Date(scheduleTime).toISOString(),
          }),
        });
        if (!res.ok) throw new Error('Failed to schedule post');
        setSuccessResult('Pin scheduled successfully into the queue!');
      } else {
        // Instant Direct Publish
        const res = await fetch('/api/providers/pinterest/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            imageUrl,
            destinationUrl,
            targetChannelId: boardId,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSuccessResult(
            data.externalPostUrl
              ? `Pin published successfully! View at: ${data.externalPostUrl}`
              : 'Pin published successfully!'
          );
        } else {
          throw new Error(data.error || 'Publish failed');
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Operation failed';
      alert(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Publish to Pinterest"
      description="Publish immediately or add to your automated schedule queue"
      maxWidth="lg"
    >
      {successResult ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-zinc-200">{successResult}</p>
          <Button onClick={onClose} variant="secondary" className="mx-auto">
            Close
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            {/* Thumbnail Preview */}
            <div className="w-24 h-36 flex-shrink-0 rounded-xl overflow-hidden border border-zinc-700 bg-zinc-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>

            {/* Inputs */}
            <div className="flex-1 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-400">Pin Title (max 100 chars)</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
                  placeholder="Enter pin title..."
                />
              </div>

              <div>
                <Select
                  label="Target Pinterest Board"
                  value={boardId}
                  onChange={setBoardId}
                  options={
                    boards.length > 0
                      ? boards.map((b) => ({
                          value: b.id,
                          label: b.name,
                          description: b.description || undefined,
                        }))
                      : [
                          { value: 'board_default_1', label: 'Home Decor & Living' },
                          { value: 'board_default_2', label: 'Aesthetic Quotes & Pins' },
                          { value: 'board_default_3', label: 'Design Inspiration' },
                          { value: 'board_default_4', label: 'DIY & Creative Crafts' },
                        ]
                  }
                  searchable={boards.length > 4}
                  placeholder="Select a Pinterest board..."
                  size="md"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">Pin Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
              placeholder="Tell viewers what your pin is about with hashtags..."
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-400">Destination Website Link (Optional)</label>
            <input
              type="url"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:border-brand-500 focus:outline-none"
              placeholder="https://yourwebsite.com/article"
            />
          </div>

          {/* Schedule vs Publish Now Toggle */}
          <div className="pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-900 text-brand-500 focus:ring-brand-500"
                />
                Schedule for Later
              </label>
              {isScheduled && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-brand-400" />
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={isScheduled ? <Calendar className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              >
                {isScheduled ? 'Add to Scheduled Queue' : 'Publish to Pinterest Now'}
              </Button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
};
