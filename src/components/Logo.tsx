import React from 'react'

export function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer Map Pin Shape */}
        <path
          d="M16 2C9.37258 2 4 7.37258 4 14C4 22.5 16 30 16 30C16 30 28 22.5 28 14C28 7.37258 22.6274 2 16 2Z"
          fill="#F97316"
          fillOpacity="0.15"
          stroke="#F97316"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Inner Eye Shape */}
        <path
          d="M10 13.5C10 13.5 12.5 9.5 16 9.5C19.5 9.5 22 13.5 22 13.5C22 13.5 19.5 17.5 16 17.5C12.5 17.5 10 13.5 10 13.5Z"
          stroke="#F97316"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Pupil / Exclamation Dot */}
        <circle cx="16" cy="13.5" r="2" fill="#F97316" />
      </svg>
      <span className="font-bold text-xl tracking-tight text-foreground">
        vidim <span className="text-brand">problem.</span>
      </span>
    </div>
  )
}
