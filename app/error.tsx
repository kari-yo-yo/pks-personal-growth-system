'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🚨 Segment Error:', error);
    if (error?.stack) {
      console.error('Stack trace:', error.stack);
    }
  }, [error]);

  const safeMessage =
    error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '页面加载出错，请稍后重试。';

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--color-error)' }}>
          页面出错了
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {safeMessage}
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-background)',
          }}
        >
          重试
        </button>
      </div>
    </div>
  );
}
