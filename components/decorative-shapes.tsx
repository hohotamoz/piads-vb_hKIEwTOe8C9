"use client"

interface DecorativeShapesProps {
  variant?: "dark" | "light"
}

export function DecorativeShapes({ variant = "light" }: DecorativeShapesProps) {
  const isDark = variant === "dark"
  
  return (
    <>
      {/* Top blob shape */}
      <div className="absolute top-0 left-0 right-0 h-48 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 400 200"
          className="absolute -top-20 -right-20 w-[120%] h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 L400,0 L400,120 Q350,180 280,140 Q200,100 150,150 Q80,200 0,160 Z"
            fill={isDark ? "#5B4B9E" : "#5B4B9E"}
            opacity={isDark ? "0.9" : "1"}
          />
          <path
            d="M0,0 L400,0 L400,80 Q320,140 240,100 Q160,60 80,110 Q20,150 0,120 Z"
            fill={isDark ? "#1E1B4B" : "#1E1B4B"}
            opacity="0.5"
          />
        </svg>
      </div>

      {/* Bottom blob shape */}
      <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden pointer-events-none">
        <svg
          viewBox="0 0 400 200"
          className="absolute -bottom-10 -left-10 w-[120%] h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0,200 L400,200 L400,120 Q350,40 280,80 Q180,140 100,60 Q40,10 0,80 Z"
            fill="#F59E0B"
            opacity="1"
          />
        </svg>
      </div>

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Square - top left */}
        <div 
          className="absolute top-24 left-8 w-4 h-4 bg-amber-400 rotate-12 animate-float-slow"
          style={{ animationDelay: "0s" }}
        />
        
        {/* Diamond - top center */}
        <div 
          className="absolute top-32 left-1/2 w-3 h-3 bg-amber-300 rotate-45 animate-float"
          style={{ animationDelay: "1s" }}
        />
        
        {/* Triangle - top right */}
        <div className="absolute top-20 right-12 animate-float" style={{ animationDelay: "0.5s" }}>
          <svg width="20" height="20" viewBox="0 0 20 20">
            <polygon 
              points="10,0 20,20 0,20" 
              fill="#F59E0B"
            />
          </svg>
        </div>

        {/* Small square - middle right */}
        <div 
          className="absolute top-1/3 right-6 w-2.5 h-2.5 bg-[#5B4B9E] rotate-45 animate-float-slow"
          style={{ animationDelay: "2s" }}
        />

        {/* Dot - middle left */}
        <div 
          className="absolute top-1/2 left-10 w-2 h-2 rounded-full bg-amber-400 animate-float"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Diamond outline - lower middle */}
        <div className="absolute bottom-48 left-1/4 animate-float-slow" style={{ animationDelay: "0.8s" }}>
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect 
              x="3" y="3" 
              width="10" height="10" 
              fill="none" 
              stroke={isDark ? "#F59E0B" : "#5B4B9E"}
              strokeWidth="2"
              transform="rotate(45 8 8)"
            />
          </svg>
        </div>
      </div>
    </>
  )
}

export function BlobBackground({ variant = "light" }: DecorativeShapesProps) {
  const isDark = variant === "dark"
  
  return (
    <div className={`absolute inset-0 ${isDark ? "bg-[#1E1B4B]" : "bg-[#F8F7FF]"}`}>
      <DecorativeShapes variant={variant} />
    </div>
  )
}
