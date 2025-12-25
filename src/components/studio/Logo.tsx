'use client';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
        <span className="text-white font-bold text-lg">IP</span>
      </div>
      <span className="font-bold text-lg text-gray-900 hidden sm:inline">Ecosystem</span>
    </div>
  );
}
