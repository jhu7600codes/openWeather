'use client';

interface SceneBannerProps {
  weatherCode: number;
  isDay: number;
}

export default function SceneBanner({ weatherCode, isDay }: SceneBannerProps) {
  const isNight = !isDay;
  const isRain = weatherCode >= 51 && weatherCode <= 82;
  const isSnow = weatherCode >= 71 && weatherCode <= 77;
  const isCloudy = weatherCode >= 2 && weatherCode <= 3;
  const isThunder = weatherCode >= 95;
  const isFog = weatherCode >= 45 && weatherCode <= 48;

  // sky gradient
  let skyTop = '#1a3a5c';
  let skyBot = '#2d6a9f';
  if (isNight) { skyTop = '#0a0e1a'; skyBot = '#1a2340'; }
  else if (isRain || isThunder) { skyTop = '#1a1f2e'; skyBot = '#2a3040'; }
  else if (isCloudy || isFog) { skyTop = '#2a3550'; skyBot = '#3d5470'; }
  else { skyTop = '#1a3a6c'; skyBot = '#4a8abf'; }

  return (
    <div className="scene-banner w-full" style={{ height: 160 }}>
      <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={skyTop} />
            <stop offset="100%" stopColor={skyBot} />
          </linearGradient>
          <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a4a6e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0d2a3d" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="400" height="160" fill="url(#sky)" />

        {/* Stars (night only) */}
        {isNight && [
          [40,15],[80,25],[130,10],[200,20],[260,8],[320,18],[370,12],[150,35],[290,30]
        ].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="1.2" fill="white" opacity="0.7" />
        ))}

        {/* Sun or Moon */}
        {!isRain && !isThunder && !isFog && (
          isNight
            ? <circle cx="320" cy="28" r="16" fill="#e8e0d0" opacity="0.9" />
            : <circle cx="320" cy="30" r="22" fill="#FFD700" opacity="0.95" />
        )}

        {/* Clouds */}
        {(isCloudy || isRain || isThunder) && (
          <>
            <ellipse cx="100" cy="50" rx="60" ry="22" fill="#2a3550" opacity="0.9" />
            <ellipse cx="140" cy="42" rx="45" ry="20" fill="#323d54" opacity="0.85" />
            <ellipse cx="280" cy="45" rx="70" ry="20" fill="#2a3550" opacity="0.8" />
            <ellipse cx="310" cy="38" rx="50" ry="18" fill="#323d54" opacity="0.7" />
          </>
        )}

        {/* Rain drops */}
        {isRain && [
          [60,70],[90,80],[120,65],[150,75],[190,60],[220,80],[260,70],[300,65],[340,78],[380,72]
        ].map(([x,y],i) => (
          <line key={i} x1={x} y1={y} x2={x-4} y2={y+18} stroke="#6ab0d8" strokeWidth="1.5" opacity="0.6" />
        ))}

        {/* Snow */}
        {isSnow && [
          [50,60],[100,75],[160,65],[210,80],[270,60],[330,72],[380,65]
        ].map(([x,y],i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="white" opacity="0.7" />
        ))}

        {/* City silhouette */}
        <g fill="#0d1a2d" opacity="0.8">
          <rect x="0" y="90" width="30" height="50" />
          <rect x="25" y="75" width="20" height="65" />
          <rect x="40" y="85" width="25" height="55" />
          <rect x="60" y="70" width="15" height="70" />
          <rect x="70" y="80" width="20" height="60" />
          <rect x="340" y="80" width="20" height="60" />
          <rect x="355" y="70" width="15" height="70" />
          <rect x="365" y="85" width="25" height="55" />
          <rect x="380" y="75" width="20" height="65" />
        </g>

        {/* Water */}
        <rect x="0" y="125" width="400" height="35" fill="url(#water)" />
        {/* Water shimmer */}
        <line x1="20" y1="133" x2="60" y2="133" stroke="#4a8abf" strokeWidth="1" opacity="0.3" />
        <line x1="100" y1="138" x2="160" y2="138" stroke="#4a8abf" strokeWidth="1" opacity="0.25" />
        <line x1="220" y1="133" x2="280" y2="133" stroke="#4a8abf" strokeWidth="1" opacity="0.3" />
        <line x1="320" y1="140" x2="380" y2="140" stroke="#4a8abf" strokeWidth="1" opacity="0.25" />

        {/* Dock */}
        <rect x="170" y="118" width="60" height="6" fill="#3d2a1a" />
        {[178,190,202,214,220].map((x,i) => (
          <rect key={i} x={x} y="118" width="3" height="20" fill="#2d1e0e" />
        ))}

        {/* Frog 🐸 */}
        <g transform="translate(185, 100)">
          {/* body */}
          <ellipse cx="12" cy="14" rx="10" ry="8" fill="#4a7c3f" />
          {/* head */}
          <ellipse cx="12" cy="7" rx="9" ry="7" fill="#5a9a4a" />
          {/* eyes */}
          <circle cx="8" cy="4" r="3" fill="#7bc460" />
          <circle cx="16" cy="4" r="3" fill="#7bc460" />
          <circle cx="8" cy="4" r="1.5" fill="#1a1a1a" />
          <circle cx="16" cy="4" r="1.5" fill="#1a1a1a" />
          {/* mouth */}
          <path d="M8 10 Q12 13 16 10" stroke="#3d6a35" strokeWidth="1" fill="none" />
          {/* legs */}
          <ellipse cx="4" cy="19" rx="5" ry="3" fill="#4a7c3f" />
          <ellipse cx="20" cy="19" rx="5" ry="3" fill="#4a7c3f" />
        </g>

        {/* Lamp posts */}
        <g fill="#2a2a3a" opacity="0.9">
          <rect x="140" y="95" width="4" height="28" />
          <ellipse cx="142" cy="94" rx="8" ry="4" fill="#2a2a3a" />
          <circle cx="142" cy="92" r="3" fill="#FFD580" opacity="0.8" />
          <rect x="250" y="95" width="4" height="28" />
          <ellipse cx="252" cy="94" rx="8" ry="4" fill="#2a2a3a" />
          <circle cx="252" cy="92" r="3" fill="#FFD580" opacity="0.8" />
        </g>

        {/* Lightning for thunder */}
        {isThunder && (
          <path d="M200 50 L190 75 L200 75 L185 100" stroke="#FFD700" strokeWidth="2.5" fill="none" opacity="0.9" />
        )}
      </svg>
    </div>
  );
}
