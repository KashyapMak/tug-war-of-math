const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

// Canvas dimensions: 640x530 (aspect ratio 1.2075 matches 320x265 card)
// Target rope height: y = 184 (connects at y=222 in arena)
function createBlueTeamSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 530" width="640" height="530">
  <defs>
    <filter id="kidShadow" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.18" />
    </filter>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="60%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="ropeGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="45%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <linearGradient id="shirtBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="60%" stop-color="#2563eb" />
      <stop offset="100%" stop-color="#1d4ed8" />
    </linearGradient>
  </defs>

  <!-- Studio backdrop -->
  <rect x="0" y="0" width="640" height="530" fill="url(#bgGrad)" />

  <!-- Ground contact shadows under kids -->
  <g fill="rgba(15, 23, 42, 0.2)">
    <ellipse cx="85" cy="465" rx="50" ry="12" />
    <ellipse cx="215" cy="465" rx="50" ry="12" />
    <ellipse cx="355" cy="465" rx="50" ry="12" />
    <ellipse cx="505" cy="465" rx="50" ry="12" />
  </g>

  <!-- TRAILING ROPE FROM ANCHOR (Behind kid 1 to bottom left) -->
  <path d="M 20,440 C 35,360 55,260 95,200" stroke="url(#ropeGrad)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 20,440 C 35,360 55,260 95,200" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 1: BLUE ANCHOR GIRL ==================== -->
  <g id="blue-kid-1" filter="url(#kidShadow)">
    <!-- Dark braided ponytail trailing left -->
    <path d="M 70,110 C 35,130 10,180 5,250 C 2,262 16,266 20,254 C 28,210 50,165 80,135 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
    <circle cx="9" cy="252" r="5" fill="#ef4444" />

    <!-- Legs in grey leggings -->
    <path d="M 85,240 L 50,330 L 30,445" stroke="#475569" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 115,240 L 98,330 L 80,445" stroke="#334155" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Blue sneakers -->
    <path d="M 12,455 L 48,455 C 52,455 52,438 40,438 L 22,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="10" y="452" width="40" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 62,455 L 98,455 C 102,455 102,438 90,438 L 72,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="60" y="452" width="40" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Torso: Blue T-shirt leaning backward -->
    <path d="M 70,145 L 132,130 L 120,250 L 65,250 Z" fill="url(#shirtBlue)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Face -->
    <circle cx="106" cy="95" r="32" fill="#b47953" stroke="#0f172a" stroke-width="3" />
    <path d="M 76,90 C 76,55 140,55 140,88 C 128,82 110,82 88,92 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
    <circle cx="76" cy="97" r="7" fill="#b47953" stroke="#0f172a" stroke-width="2" />
    <ellipse cx="102" cy="92" rx="4" ry="6" fill="#0f172a" /><circle cx="104" cy="90" r="1.8" fill="#fff" />
    <ellipse cx="122" cy="90" rx="4" ry="6" fill="#0f172a" /><circle cx="124" cy="88" r="1.8" fill="#fff" />
    <path d="M 106,108 Q 114,118 122,108" stroke="#0f172a" stroke-width="2.5" fill="#991b1b" stroke-linecap="round" />

    <!-- Arms gripping rope -->
    <path d="M 95,160 L 115,190 L 135,185" stroke="#b47953" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="135" cy="185" r="8" fill="#b47953" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- ROPE BETWEEN KID 1 & KID 2 -->
  <path d="M 95,184 L 240,184" stroke="url(#ropeGrad)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 95,184 L 240,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 2: BLUE BOY (Spiky Hair, Laughing) ==================== -->
  <g id="blue-kid-2" filter="url(#kidShadow)">
    <!-- Charcoal Shorts -->
    <path d="M 190,235 L 255,235 L 265,285 L 180,285 Z" fill="#334155" stroke="#0f172a" stroke-width="2.5" />

    <!-- Legs -->
    <path d="M 200,280 L 175,340 L 150,445" stroke="#c68642" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 245,280 L 230,340 L 215,445" stroke="#c68642" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <rect x="140" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <rect x="205" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Blue sneakers -->
    <path d="M 130,455 L 175,455 C 180,455 180,438 168,438 L 145,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="128" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 195,455 L 240,455 C 245,455 245,438 233,438 L 210,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="193" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Blue T-shirt -->
    <path d="M 190,145 L 258,130 L 250,245 L 185,245 Z" fill="url(#shirtBlue)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Spiky Hair -->
    <circle cx="228" cy="90" r="32" fill="#c68642" stroke="#0f172a" stroke-width="3" />
    <circle cx="196" cy="94" r="7" fill="#c68642" stroke="#0f172a" stroke-width="2" />
    <path d="M 198,85 C 190,55 210,42 224,46 C 232,38 245,40 252,48 C 265,42 272,60 264,80 C 248,72 218,72 198,85 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />

    <!-- Laughing Eyes & Open Smile -->
    <path d="M 212,82 Q 219,76 226,82" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 238,80 Q 245,74 252,80" stroke="#0f172a" stroke-width="3.5" stroke-linecap="round" fill="none" />
    <path d="M 220,95 Q 234,120 248,95 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <path d="M 224,96 L 244,96" stroke="#ffffff" stroke-width="3.5" stroke-linecap="round" />

    <!-- Arms gripping rope -->
    <path d="M 212,160 L 240,195 L 265,188" stroke="#c68642" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="265" cy="188" r="8" fill="#c68642" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- ROPE BETWEEN KID 2 & KID 3 -->
  <path d="M 240,184 L 380,184" stroke="url(#ropeGrad)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 240,184 L 380,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 3: BLUE BOY (Combed Hair, Smile) ==================== -->
  <g id="blue-kid-3" filter="url(#kidShadow)">
    <!-- Charcoal Shorts -->
    <path d="M 330,235 L 395,235 L 405,285 L 320,285 Z" fill="#334155" stroke="#0f172a" stroke-width="2.5" />

    <!-- Legs -->
    <path d="M 340,280 L 315,340 L 290,445" stroke="#d89b6c" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 385,280 L 370,340 L 355,445" stroke="#d89b6c" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <rect x="280" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <rect x="345" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Blue sneakers -->
    <path d="M 270,455 L 315,455 C 320,455 320,438 308,438 L 285,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="268" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 335,455 L 380,455 C 385,455 385,438 373,438 L 350,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="333" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Blue T-shirt -->
    <path d="M 330,145 L 398,130 L 390,245 L 325,245 Z" fill="url(#shirtBlue)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Combed Hair -->
    <circle cx="368" cy="90" r="32" fill="#d89b6c" stroke="#0f172a" stroke-width="3" />
    <circle cx="336" cy="94" r="7" fill="#d89b6c" stroke="#0f172a" stroke-width="2" />
    <path d="M 338,85 C 338,50 402,54 406,88 C 388,77 362,79 338,85 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />

    <!-- Eyes & Smile -->
    <ellipse cx="364" cy="88" rx="4" ry="6" fill="#0f172a" /><circle cx="366" cy="86" r="1.8" fill="#fff" />
    <ellipse cx="388" cy="86" rx="4" ry="6" fill="#0f172a" /><circle cx="390" cy="84" r="1.8" fill="#fff" />
    <path d="M 368,103 Q 378,112 388,103" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Arms gripping rope -->
    <path d="M 352,160 L 380,195 L 405,188" stroke="#d89b6c" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="405" cy="188" r="8" fill="#d89b6c" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- ROPE BETWEEN KID 3 & KID 4 -->
  <path d="M 380,184 L 520,184" stroke="url(#ropeGrad)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 380,184 L 520,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 4: BLUE FRONT BOY (Leading pull) ==================== -->
  <g id="blue-kid-4" filter="url(#kidShadow)">
    <!-- Charcoal Shorts -->
    <path d="M 470,235 L 535,235 L 545,285 L 460,285 Z" fill="#334155" stroke="#0f172a" stroke-width="2.5" />

    <!-- Legs in strong brace -->
    <path d="M 480,280 L 455,340 L 430,445" stroke="#c68642" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 525,280 L 535,340 L 545,445" stroke="#c68642" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <rect x="420" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <rect x="535" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Blue sneakers -->
    <path d="M 410,455 L 455,455 C 460,455 460,438 448,438 L 425,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="408" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 525,455 L 570,455 C 575,455 575,438 563,438 L 540,440 Z" fill="#2563eb" stroke="#0f172a" stroke-width="2.5" />
    <rect x="523" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Blue T-shirt -->
    <path d="M 470,145 L 538,130 L 530,245 L 465,245 Z" fill="url(#shirtBlue)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Textured Hair -->
    <circle cx="508" cy="88" r="32" fill="#c68642" stroke="#0f172a" stroke-width="3" />
    <circle cx="476" cy="92" r="7" fill="#c68642" stroke="#0f172a" stroke-width="2" />
    <path d="M 478,85 C 470,50 495,40 508,46 C 518,36 530,38 540,50 C 552,44 558,62 550,82 C 532,70 502,70 478,85 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />

    <ellipse cx="504" cy="85" rx="4" ry="6" fill="#0f172a" /><circle cx="506" cy="83" r="1.8" fill="#fff" />
    <ellipse cx="528" cy="83" rx="4" ry="6" fill="#0f172a" /><circle cx="530" cy="81" r="1.8" fill="#fff" />
    <path d="M 508,101 Q 518,110 528,101" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Two Arms pulling rope -->
    <path d="M 492,160 L 520,195 L 550,188" stroke="#c68642" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="550" cy="188" r="8" fill="#c68642" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- ROPE EXIT AT EXACT CENTER ALIGNMENT: y = 184, x = 640 -->
  <path d="M 520,184 L 640,184" stroke="url(#ropeGrad)" stroke-width="18" stroke-linecap="square" fill="none" />
  <path d="M 520,184 L 640,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />
</svg>`;
}

function createRedTeamSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 530" width="640" height="530">
  <defs>
    <filter id="kidShadowRed" x="-10%" y="-10%" width="125%" height="125%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" flood-color="#0f172a" flood-opacity="0.18" />
    </filter>
    <linearGradient id="bgGradRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="60%" stop-color="#e2e8f0" />
      <stop offset="100%" stop-color="#cbd5e1" />
    </linearGradient>
    <linearGradient id="ropeGradRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f59e0b" />
      <stop offset="45%" stop-color="#d97706" />
      <stop offset="100%" stop-color="#92400e" />
    </linearGradient>
    <linearGradient id="shirtRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ef4444" />
      <stop offset="60%" stop-color="#dc2626" />
      <stop offset="100%" stop-color="#b91c1c" />
    </linearGradient>
  </defs>

  <!-- Studio backdrop -->
  <rect x="0" y="0" width="640" height="530" fill="url(#bgGradRed)" />

  <!-- Ground contact shadows under kids -->
  <g fill="rgba(15, 23, 42, 0.2)">
    <ellipse cx="135" cy="465" rx="50" ry="12" />
    <ellipse cx="285" cy="465" rx="50" ry="12" />
    <ellipse cx="425" cy="465" rx="50" ry="12" />
    <ellipse cx="555" cy="465" rx="50" ry="12" />
  </g>

  <!-- ROPE ENTRY AT EXACT CENTER ALIGNMENT: y = 184, x = 0 -->
  <path d="M 0,184 L 120,184" stroke="url(#ropeGradRed)" stroke-width="18" stroke-linecap="square" fill="none" />
  <path d="M 0,184 L 120,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 5: RED FRONT BOY ==================== -->
  <g id="red-kid-1" filter="url(#kidShadowRed)">
    <!-- Charcoal Shorts -->
    <path d="M 170,235 L 105,235 L 95,285 L 180,285 Z" fill="#334155" stroke="#0f172a" stroke-width="2.5" />

    <!-- Legs -->
    <path d="M 160,280 L 185,340 L 210,445" stroke="#d89b6c" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 115,280 L 105,340 L 95,445" stroke="#d89b6c" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <rect x="200" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <rect x="85" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Red sneakers -->
    <path d="M 190,455 L 235,455 C 240,455 240,438 228,438 L 205,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="188" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 75,455 L 120,455 C 125,455 125,438 113,438 L 90,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="73" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Red T-shirt -->
    <path d="M 170,145 L 102,130 L 110,245 L 175,245 Z" fill="url(#shirtRed)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Combed Dark Hair -->
    <circle cx="132" cy="88" r="32" fill="#d89b6c" stroke="#0f172a" stroke-width="3" />
    <circle cx="164" cy="92" r="7" fill="#d89b6c" stroke="#0f172a" stroke-width="2" />
    <path d="M 162,85 C 170,50 145,40 132,46 C 122,36 110,38 100,50 C 88,44 82,62 90,82 C 108,70 138,70 162,85 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />

    <ellipse cx="136" cy="85" rx="4" ry="6" fill="#0f172a" /><circle cx="134" cy="83" r="1.8" fill="#fff" />
    <ellipse cx="112" cy="83" rx="4" ry="6" fill="#0f172a" /><circle cx="110" cy="81" r="1.8" fill="#fff" />
    <path d="M 132,101 Q 122,110 112,101" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Arms gripping rope -->
    <path d="M 148,160 L 120,195 L 90,188" stroke="#d89b6c" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="90" cy="188" r="8" fill="#d89b6c" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- ROPE BETWEEN KID 5 & KID 6 -->
  <path d="M 120,184 L 260,184" stroke="url(#ropeGradRed)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 120,184 L 260,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 6: RED GIRL (High Ponytail) ==================== -->
  <g id="red-kid-2" filter="url(#kidShadowRed)">
    <!-- Ponytail -->
    <path d="M 310,65 C 335,35 355,75 350,130 C 348,142 335,142 334,130 C 332,95 322,70 310,65 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
    <circle cx="314" cy="63" r="5.5" fill="#ef4444" stroke="#991b1b" stroke-width="1.8" />

    <!-- Grey Leggings -->
    <path d="M 300,240 L 325,330 L 350,445" stroke="#475569" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 270,240 L 288,330 L 305,445" stroke="#334155" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Red sneakers -->
    <path d="M 335,455 L 370,455 C 375,455 375,438 363,438 L 345,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="333" y="452" width="40" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 290,455 L 325,455 C 330,455 330,438 318,438 L 300,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="288" y="452" width="40" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Red T-shirt -->
    <path d="M 310,145 L 242,130 L 255,250 L 310,250 Z" fill="url(#shirtRed)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Face (Warm dark skin tone) -->
    <circle cx="274" cy="90" r="32" fill="#a2653e" stroke="#0f172a" stroke-width="3" />
    <circle cx="306" cy="94" r="7" fill="#a2653e" stroke="#0f172a" stroke-width="2" />
    <path d="M 304,85 C 304,50 240,54 236,88 C 254,77 280,79 304,85 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />

    <ellipse cx="278" cy="88" rx="4" ry="6" fill="#0f172a" /><circle cx="276" cy="86" r="1.8" fill="#fff" />
    <ellipse cx="254" cy="86" rx="4" ry="6" fill="#0f172a" /><circle cx="252" cy="84" r="1.8" fill="#fff" />
    <path d="M 274,103 Q 264,112 254,103" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Arms gripping rope -->
    <path d="M 288,160 L 260,195 L 235,188" stroke="#a2653e" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="235" cy="188" r="8" fill="#a2653e" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- ROPE BETWEEN KID 6 & KID 7 -->
  <path d="M 260,184 L 400,184" stroke="url(#ropeGradRed)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 260,184 L 400,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 7: RED BOY (Styled Hair, Confident Smile) ==================== -->
  <g id="red-kid-3" filter="url(#kidShadowRed)">
    <!-- Charcoal Shorts -->
    <path d="M 450,235 L 385,235 L 375,285 L 460,285 Z" fill="#334155" stroke="#0f172a" stroke-width="2.5" />

    <!-- Legs -->
    <path d="M 440,280 L 465,340 L 490,445" stroke="#c68642" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 395,280 L 410,340 L 425,445" stroke="#c68642" stroke-width="19" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <rect x="480" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <rect x="415" y="432" width="18" height="13" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Red sneakers -->
    <path d="M 470,455 L 515,455 C 520,455 520,438 508,438 L 485,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="468" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 405,455 L 450,455 C 455,455 455,438 443,438 L 420,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="403" y="452" width="49" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Red T-shirt -->
    <path d="M 450,145 L 382,130 L 390,245 L 455,245 Z" fill="url(#shirtRed)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Styled Hair -->
    <circle cx="412" cy="90" r="32" fill="#c68642" stroke="#0f172a" stroke-width="3" />
    <circle cx="444" cy="94" r="7" fill="#c68642" stroke="#0f172a" stroke-width="2" />
    <path d="M 442,85 C 450,55 430,42 416,46 C 408,38 395,40 388,48 C 375,42 368,60 376,80 C 392,72 422,72 442,85 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />

    <ellipse cx="416" cy="88" rx="4" ry="6" fill="#0f172a" /><circle cx="414" cy="86" r="1.8" fill="#fff" />
    <ellipse cx="392" cy="86" rx="4" ry="6" fill="#0f172a" /><circle cx="390" cy="84" r="1.8" fill="#fff" />
    <path d="M 412,103 Q 402,112 392,103" stroke="#0f172a" stroke-width="3" stroke-linecap="round" fill="none" />

    <!-- Arms gripping rope -->
    <path d="M 428,160 L 400,195 L 375,188" stroke="#c68642" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="375" cy="188" r="8" fill="#c68642" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- ROPE BETWEEN KID 7 & KID 8 -->
  <path d="M 400,184 L 545,184" stroke="url(#ropeGradRed)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 400,184 L 545,184" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />

  <!-- ==================== KID 8: RED ANCHOR GIRL ==================== -->
  <g id="red-kid-4" filter="url(#kidShadowRed)">
    <!-- Leggings -->
    <path d="M 555,240 L 590,330 L 610,445" stroke="#475569" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <path d="M 525,240 L 542,330 L 560,445" stroke="#334155" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" fill="none" />

    <!-- Red sneakers -->
    <path d="M 592,455 L 628,455 C 632,455 632,438 620,438 L 602,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="590" y="452" width="40" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />
    <path d="M 542,455 L 578,455 C 582,455 582,438 570,438 L 552,440 Z" fill="#dc2626" stroke="#0f172a" stroke-width="2.5" />
    <rect x="540" y="452" width="40" height="6" rx="2.5" fill="#ffffff" stroke="#0f172a" stroke-width="1.8" />

    <!-- Red T-shirt -->
    <path d="M 570,145 L 508,130 L 520,250 L 575,250 Z" fill="url(#shirtRed)" stroke="#0f172a" stroke-width="3" />

    <!-- Head & Face -->
    <circle cx="534" cy="95" r="32" fill="#d89b6c" stroke="#0f172a" stroke-width="3" />
    <!-- Ponytail trailing right -->
    <path d="M 570,110 C 605,130 630,180 635,250 C 638,262 624,266 620,254 C 612,210 590,165 560,135 Z" fill="#1e293b" stroke="#0f172a" stroke-width="2.5" />
    <circle cx="631" cy="252" r="5" fill="#ef4444" />
    <circle cx="564" cy="97" r="7" fill="#d89b6c" stroke="#0f172a" stroke-width="2" />

    <ellipse cx="538" cy="92" rx="4" ry="6" fill="#0f172a" /><circle cx="536" cy="90" r="1.8" fill="#fff" />
    <ellipse cx="518" cy="90" rx="4" ry="6" fill="#0f172a" /><circle cx="516" cy="88" r="1.8" fill="#fff" />
    <path d="M 534,108 Q 526,118 518,108" stroke="#0f172a" stroke-width="2.5" fill="#991b1b" stroke-linecap="round" />

    <!-- Arms gripping rope -->
    <path d="M 545,160 L 525,190 L 505,185" stroke="#d89b6c" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" fill="none" />
    <circle cx="505" cy="185" r="8" fill="#d89b6c" stroke="#0f172a" stroke-width="2" />
  </g>

  <!-- TRAILING ROPE (Behind kid 8 to bottom right) -->
  <path d="M 545,184 C 585,240 605,340 620,440" stroke="url(#ropeGradRed)" stroke-width="18" stroke-linecap="round" fill="none" />
  <path d="M 545,184 C 585,240 605,340 620,440" stroke="#78350f" stroke-width="3.5" stroke-dasharray="8,6" fill="none" />
</svg>`;
}

function renderAndSave() {
  const blueSvg = createBlueTeamSvg();
  const redSvg = createRedTeamSvg();

  const blueResvg = new Resvg(blueSvg, { fitTo: { mode: 'width', value: 640 } });
  const bluePng = blueResvg.render().asPng();

  const redResvg = new Resvg(redSvg, { fitTo: { mode: 'width', value: 640 } });
  const redPng = redResvg.render().asPng();

  const publicAssetsDir = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(publicAssetsDir)) {
    fs.mkdirSync(publicAssetsDir, { recursive: true });
  }

  const bluePath = path.join(publicAssetsDir, 'team_blue.png');
  const redPath = path.join(publicAssetsDir, 'team_red.png');

  fs.writeFileSync(bluePath, bluePng);
  fs.writeFileSync(redPath, redPng);
  console.log('Successfully saved team_blue.png and team_red.png to', publicAssetsDir);

  const distAssetsDir = path.join(process.cwd(), 'dist', 'assets');
  if (fs.existsSync(distAssetsDir)) {
    fs.writeFileSync(path.join(distAssetsDir, 'team_blue.png'), bluePng);
    fs.writeFileSync(path.join(distAssetsDir, 'team_red.png'), redPng);
    console.log('Successfully synced to dist/assets');
  }
}

renderAndSave();
