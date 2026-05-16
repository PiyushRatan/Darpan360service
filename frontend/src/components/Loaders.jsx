import React from 'react';

const ProgressBar = () => (
  <div className="relative h-0.5 w-full overflow-hidden rounded-full bg-builder-border" aria-hidden="true">
    <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-gray-400 motion-safe:animate-[loader-progress_1.35s_ease-in-out_infinite]" />
  </div>
);

const SkeletonLine = ({ width = 'w-full', delay = '' }) => (
  <span className={`block h-2 rounded-full bg-white/10 motion-safe:animate-pulse ${width} ${delay}`} aria-hidden="true" />
);

const HeaderSkeleton = () => (
  <div className="flex items-center gap-3 border-b border-builder-border bg-builder-800 p-4">
    <div className="h-10 w-10 rounded-full bg-white/10" aria-hidden="true" />
    <div className="grid flex-1 gap-2">
      <SkeletonLine width="w-32" />
      <SkeletonLine width="w-24" delay="[animation-delay:140ms]" />
    </div>
  </div>
);

const ChatSkeleton = () => (
  <div className="flex flex-1 flex-col justify-end gap-4 p-4">
    <div className="w-[78%] rounded-lg rounded-bl-sm border border-builder-border bg-builder-800 p-3">
      <SkeletonLine width="w-11/12" />
      <SkeletonLine width="mt-2 w-7/12" delay="[animation-delay:120ms]" />
    </div>
    <div className="ml-auto w-[62%] rounded-lg rounded-br-sm border border-builder-border bg-builder-700 p-3">
      <SkeletonLine width="w-4/5" delay="[animation-delay:220ms]" />
    </div>
    <div className="w-[70%] rounded-lg rounded-bl-sm border border-builder-border bg-builder-800 p-3">
      <SkeletonLine width="w-3/4" delay="[animation-delay:80ms]" />
      <SkeletonLine width="mt-2 w-1/2" delay="[animation-delay:180ms]" />
    </div>
  </div>
);

const InputSkeleton = ({ label }) => (
  <div className="border-t border-builder-border bg-builder-800 p-4">
    <div className="h-10 rounded-full border border-builder-border bg-builder-900" aria-hidden="true" />
    <div className="mt-3">
      <ProgressBar />
    </div>
    <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
  </div>
);

export const MainPageLoader = ({ label = 'Preparing Darpan360' }) => (
  <div className="fixed inset-0 z-[9999] overflow-hidden bg-builder-900 text-gray-200">
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
      <div className="flex items-center justify-between">
        <div className="h-5 w-28 rounded bg-white/12 motion-safe:animate-pulse" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-16 rounded border border-builder-border bg-builder-800 motion-safe:animate-pulse" aria-hidden="true" />
          <div className="h-9 w-32 rounded bg-white/12 motion-safe:animate-pulse" aria-hidden="true" />
        </div>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="mb-8 h-7 w-44 rounded-full border border-builder-border bg-builder-800 motion-safe:animate-pulse" aria-hidden="true" />
        <div className="grid w-full max-w-3xl gap-4">
          <div className="mx-auto h-10 w-full max-w-2xl rounded bg-white/12 motion-safe:animate-pulse" aria-hidden="true" />
          <div className="mx-auto h-10 w-full max-w-xl rounded bg-white/10 motion-safe:animate-pulse [animation-delay:120ms]" aria-hidden="true" />
        </div>
        <div className="mt-8 grid w-full max-w-2xl gap-3">
          <div className="mx-auto h-3 w-full max-w-xl rounded-full bg-white/10 motion-safe:animate-pulse [animation-delay:180ms]" aria-hidden="true" />
          <div className="mx-auto h-3 w-full max-w-lg rounded-full bg-white/10 motion-safe:animate-pulse [animation-delay:260ms]" aria-hidden="true" />
        </div>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <div className="h-12 w-56 rounded bg-white/12 motion-safe:animate-pulse" aria-hidden="true" />
          <div className="h-12 w-40 rounded border border-builder-border bg-builder-800 motion-safe:animate-pulse [animation-delay:140ms]" aria-hidden="true" />
        </div>
      </main>

      <div className="grid gap-6 border-t border-builder-border py-8 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="rounded border border-builder-border bg-builder-800 p-5">
            <div className="mb-5 h-10 w-10 rounded bg-builder-900 motion-safe:animate-pulse" aria-hidden="true" />
            <SkeletonLine width="w-2/3" delay={item === 1 ? '[animation-delay:120ms]' : item === 2 ? '[animation-delay:240ms]' : ''} />
            <SkeletonLine width="mt-4 w-full" delay="[animation-delay:160ms]" />
            <SkeletonLine width="mt-2 w-5/6" delay="[animation-delay:220ms]" />
          </div>
        ))}
      </div>

      <div className="pb-2">
        <ProgressBar />
        <p className="mt-3 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      </div>
    </div>
  </div>
);

export const SubPageLoader = ({ label = 'Loading view' }) => (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-builder-900/95 text-gray-200 backdrop-blur-sm">
    <div className="w-72 border border-builder-border bg-builder-800 p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-white/10" aria-hidden="true" />
        <div className="grid flex-1 gap-2">
          <SkeletonLine width="w-28" />
          <SkeletonLine width="w-20" delay="[animation-delay:120ms]" />
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar />
      </div>
      <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
    </div>
  </div>
);

export const ChatPageLoader = ({ label = 'Opening secure chat' }) => (
  <div className="flex h-screen flex-col bg-builder-900 text-gray-200">
    <HeaderSkeleton />
    <ChatSkeleton />
    <InputSkeleton label={label} />
  </div>
);
