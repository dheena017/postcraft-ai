import React from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export default function RootLoading() {
  return (
    <div className="w-full min-h-[60vh] flex items-center justify-center p-6">
      <LoadingScreen
        fullScreen={false}
        message="Loading PostCraft AI..."
        submessage="Synchronizing studio state & scheduled workflows"
      />
    </div>
  );
}
