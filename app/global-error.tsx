'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('🚨 GlobalError triggered:', error);
    if (error?.stack) {
      console.error('Stack trace:', error.stack);
    }
  }, [error]);

  const safeMessage =
    error && typeof error === 'object' && 'message' in error
      ? String(error.message)
      : '发生了未知错误，请稍后重试。';

  const safeDigest =
    error && typeof error === 'object' && 'digest' in error
      ? String(error.digest)
      : undefined;

  return (
    <html lang="zh-CN">
      <body className="antialiased" style={{ margin: 0, padding: 0 }}>
        <div
          className="min-h-screen flex items-center justify-center p-8"
          style={{ backgroundColor: 'var(--color-background)' }}
        >
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">😵</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-error)' }}>
              系统出错了
            </h2>
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
              {safeMessage}
            </p>
            {safeDigest && (
              <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
                错误 ID: {safeDigest}
              </p>
            )}
            <button
              onClick={reset}
              className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-background)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              重试
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
