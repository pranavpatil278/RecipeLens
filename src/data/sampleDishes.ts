/**
 * High-quality vector SVG data URIs for sample 3D culinary presets.
 * Renders instantly, offline-ready, sharp on Retina displays, no broken external image links.
 */

// Butter Chicken
export const sampleButterChickenSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#3A2312" />
      <stop offset="100%" stop-color="#190F08" />
    </radialGradient>
    <radialGradient id="plateRim" cx="50%" cy="50%" r="50%">
      <stop offset="70%" stop-color="#EDE5DA" />
      <stop offset="95%" stop-color="#D3C7B6" />
      <stop offset="100%" stop-color="#9C8B76" />
    </radialGradient>
    <radialGradient id="curryGrad" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#F25C05" />
      <stop offset="40%" stop-color="#D9381E" />
      <stop offset="85%" stop-color="#A62B17" />
      <stop offset="100%" stop-color="#731608" />
    </radialGradient>
    <filter id="sauceGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Tabletop -->
  <rect width="800" height="600" fill="url(#bgGrad)" />

  <!-- Artisan Ceramic Bowl Rim -->
  <ellipse cx="400" cy="305" rx="330" ry="240" fill="#0D0704" opacity="0.6" />
  <ellipse cx="400" cy="295" rx="310" ry="220" fill="url(#plateRim)" />
  <ellipse cx="400" cy="295" rx="275" ry="195" fill="#241B15" />

  <!-- Rich Makhani Curry Base -->
  <ellipse cx="400" cy="295" rx="260" ry="180" fill="url(#curryGrad)" filter="url(#sauceGlow)" />

  <!-- Tandoori Chicken Chunks -->
  <g fill="#8C250E" stroke="#5E1405" stroke-width="2">
    <ellipse cx="330" cy="260" rx="42" ry="28" transform="rotate(-15 330 260)" />
    <ellipse cx="450" cy="250" rx="48" ry="32" transform="rotate(20 450 250)" />
    <ellipse cx="370" cy="330" rx="50" ry="35" transform="rotate(5 370 330)" />
    <ellipse cx="470" cy="325" rx="44" ry="30" transform="rotate(-25 470 325)" />
    <ellipse cx="280" cy="310" rx="38" ry="26" transform="rotate(10 280 310)" />
  </g>

  <!-- Char Marks on Chicken -->
  <g fill="#2B0903" opacity="0.8">
    <path d="M 315 255 Q 330 250 345 258 Q 335 265 315 255 Z" />
    <path d="M 435 245 Q 455 240 470 248 Q 450 255 435 245 Z" />
    <path d="M 355 325 Q 375 320 390 328 Q 370 335 355 325 Z" />
  </g>

  <!-- Swirled Heavy Cream Drizzle -->
  <path d="M 310 230 C 370 200 480 230 460 300 C 440 370 340 380 320 320 C 310 280 360 260 400 270 C 430 280 430 320 400 330" 
        fill="none" stroke="#FFF7ED" stroke-width="14" stroke-linecap="round" opacity="0.9" filter="url(#sauceGlow)" />
  <path d="M 340 280 Q 400 290 420 260" fill="none" stroke="#FFF7ED" stroke-width="6" stroke-linecap="round" opacity="0.85" />

  <!-- Fenugreek (Kasuri Methi) & Micro Cilantro Garnish -->
  <g fill="#3B5323" opacity="0.95">
    <ellipse cx="390" cy="250" rx="7" ry="4" transform="rotate(30 390 250)" />
    <ellipse cx="405" cy="255" rx="6" ry="3" transform="rotate(-40 405 255)" />
    <ellipse cx="370" cy="275" rx="8" ry="5" transform="rotate(15 370 275)" />
    <ellipse cx="440" cy="285" rx="7" ry="4" transform="rotate(-20 440 285)" />
    <ellipse cx="350" cy="310" rx="8" ry="4" transform="rotate(45 350 310)" />
    <ellipse cx="420" cy="340" rx="9" ry="5" transform="rotate(-10 420 340)" />
    <ellipse cx="310" cy="290" rx="6" ry="3" transform="rotate(60 310 290)" />
  </g>

  <!-- Butter Gloss Highlights -->
  <ellipse cx="360" cy="235" rx="35" ry="15" fill="#FFEAA7" opacity="0.45" />
  <ellipse cx="430" cy="310" rx="40" ry="18" fill="#FFEAA7" opacity="0.35" />
</svg>
`)}`;

// Matcha Latte
export const sampleMatchaLatteSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <radialGradient id="matchaBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#22331D" />
      <stop offset="100%" stop-color="#0E160C" />
    </radialGradient>
    <radialGradient id="foamGrad" cx="45%" cy="45%" r="55%">
      <stop offset="0%" stop-color="#D2E8B8" />
      <stop offset="40%" stop-color="#7DA855" />
      <stop offset="85%" stop-color="#5B8238" />
      <stop offset="100%" stop-color="#3D5A22" />
    </radialGradient>
  </defs>

  <rect width="800" height="600" fill="url(#matchaBg)" />

  <!-- Cup Shadow -->
  <ellipse cx="400" cy="320" rx="270" ry="190" fill="#000000" opacity="0.5" />

  <!-- Ceramic Matcha Bowl Outer -->
  <ellipse cx="400" cy="300" rx="250" ry="180" fill="#FAF7F0" stroke="#D3C7B6" stroke-width="12" />

  <!-- Frothy Ceremonial Matcha Base -->
  <ellipse cx="400" cy="300" rx="225" ry="155" fill="url(#foamGrad)" />

  <!-- Steamed Oat Milk Latte Art Heart -->
  <path d="M 400 340 C 330 280 310 230 350 205 C 385 185 400 220 400 230 C 400 220 415 185 450 205 C 490 230 470 280 400 340 Z"
        fill="#FCFBF7" opacity="0.95" />

  <!-- Micro Foam Bubbles -->
  <g fill="#A3C97E" opacity="0.7">
    <circle cx="300" cy="270" r="4" />
    <circle cx="315" cy="260" r="3" />
    <circle cx="490" cy="280" r="5" />
    <circle cx="505" cy="295" r="3" />
    <circle cx="395" cy="370" r="4" />
  </g>

  <!-- Dusting of Matcha Powder -->
  <g fill="#3B5B1E" opacity="0.8">
    <circle cx="360" cy="210" r="1.5" />
    <circle cx="370" cy="215" r="2" />
    <circle cx="430" cy="210" r="1.5" />
    <circle cx="440" cy="220" r="2" />
    <circle cx="400" cy="320" r="1.5" />
  </g>
</svg>
`)}`;

// Tuscan Sun-Dried Tomato Rigatoni Pasta
export const sampleTuscanPastaSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
  <defs>
    <radialGradient id="pastaBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#2D1F17" />
      <stop offset="100%" stop-color="#140B07" />
    </radialGradient>
    <radialGradient id="pastaPlate" cx="50%" cy="50%" r="50%">
      <stop offset="75%" stop-color="#EDE5DA" />
      <stop offset="95%" stop-color="#DACFBE" />
      <stop offset="100%" stop-color="#A89B87" />
    </radialGradient>
  </defs>

  <rect width="800" height="600" fill="url(#pastaBg)" />

  <!-- Plate Shadow & Rim -->
  <ellipse cx="400" cy="310" rx="310" ry="220" fill="#000" opacity="0.5" />
  <ellipse cx="400" cy="295" rx="290" ry="200" fill="url(#pastaPlate)" />
  <ellipse cx="400" cy="295" rx="220" ry="150" fill="#E67E22" opacity="0.25" />

  <!-- Rigatoni Pasta Pieces (Golden Ribbed Cylinders) -->
  <g fill="#F5CBA7" stroke="#BA4A00" stroke-width="2">
    <rect x="330" y="240" width="70" height="32" rx="10" transform="rotate(-18 365 256)" />
    <rect x="420" y="230" width="75" height="34" rx="10" transform="rotate(22 457 247)" />
    <rect x="360" y="300" width="75" height="34" rx="10" transform="rotate(8 397 317)" />
    <rect x="280" y="290" width="65" height="30" rx="10" transform="rotate(-35 312 305)" />
    <rect x="440" y="295" width="70" height="32" rx="10" transform="rotate(-15 475 311)" />
  </g>

  <!-- Sun-Dried Tomatoes (Deep Burgundy) -->
  <g fill="#781C12">
    <ellipse cx="320" cy="270" rx="22" ry="14" transform="rotate(15 320 270)" />
    <ellipse cx="460" cy="275" rx="24" ry="15" transform="rotate(-25 460 275)" />
    <ellipse cx="390" cy="340" rx="26" ry="16" transform="rotate(35 390 340)" />
  </g>

  <!-- Cream & Garlic Sauce Gloss -->
  <path d="M 310 280 Q 400 240 480 290 Q 420 340 330 320 Z" fill="#FDFEFE" opacity="0.3" />

  <!-- Fresh Sweet Basil Leaves -->
  <g fill="#1E8449">
    <path d="M 380 240 C 370 220 395 210 405 225 C 415 240 395 250 380 240 Z" />
    <path d="M 430 310 C 445 295 465 315 450 325 C 435 335 420 320 430 310 Z" />
    <path d="M 340 325 C 325 315 345 295 355 310 C 365 325 350 335 340 325 Z" />
  </g>

  <!-- Parmigiano-Reggiano Flakes -->
  <g fill="#FEF9E7" opacity="0.95">
    <polygon points="350,260 365,258 358,268" />
    <polygon points="420,250 435,248 428,258" />
    <polygon points="380,310 395,308 388,318" />
    <polygon points="450,300 465,298 458,308" />
    <polygon points="330,300 342,298 338,308" />
  </g>
</svg>
`)}`;
