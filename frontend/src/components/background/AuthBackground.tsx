export default function AuthBackground() {

  return (

    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* TOP LEFT DIAGONAL */}

      <div
        className="
          absolute
          top-0
          left-0
          w-[420px]
          h-[420px]
          bg-white/10
        "
        style={{
          clipPath:
            'polygon(0 0, 100% 0, 28% 100%, 0 62%)',
        }}
      />

      {/* LARGE CENTER DIAMOND */}

      <div
        className="
          absolute
          top-[12%]
          left-[52%]
          w-[300px]
          h-[300px]
          bg-white/10
          rotate-45
        "
      />

      {/* SMALL CENTER DIAMOND */}

      <div
        className="
          absolute
          top-[26%]
          left-[38%]
          w-[140px]
          h-[140px]
          bg-white/10
          rotate-45
        "
      />

      {/* BIG DIAGONAL PANEL */}

      <div
        className="
          absolute
          bottom-[-120px]
          right-[-40px]
          w-[620px]
          h-[620px]
          bg-white/5
          rotate-45
        "
      />

      {/* LEFT BOTTOM SHAPE */}

      <div
        className="
          absolute
          bottom-[-100px]
          left-[-120px]
          w-[380px]
          h-[380px]
          bg-white/5
          rotate-[32deg]
        "
      />

      {/* BOTTOM OVERLAY */}

      <div
        className="
          absolute
          bottom-0
          left-0
          w-full
          h-[280px]
          bg-white/[0.04]
        "
        style={{
          clipPath:
            'polygon(0 100%, 100% 20%, 100% 100%)',
        }}
      />

      {/* BLUR */}

      <div
        className="
          absolute
          top-1/2
          left-1/2
          w-[500px]
          h-[500px]
          rounded-full
          bg-white/[0.03]
          blur-3xl
          -translate-x-1/2
          -translate-y-1/2
        "
      />

    </div>
  )
}