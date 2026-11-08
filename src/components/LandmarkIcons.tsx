import React from 'react';

interface LandmarkIconProps {
  id: string;
  className?: string;
}

export const LandmarkIcon: React.FC<LandmarkIconProps> = ({ id, className = 'w-8 h-8' }) => {
  switch (id) {
    // 1. AGRA & DELHI (Brown)
    case 'taj_mahal':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Base plinth */}
          <rect x="6" y="52" width="52" height="4" rx="1" fill="#8B4513" opacity="0.9" />
          <rect x="10" y="48" width="44" height="4" fill="#8B4513" opacity="0.75" />
          {/* Main Mausoleum Block */}
          <path d="M16 28H48V48H16V28Z" fill="#F8FAFC" stroke="#8B4513" strokeWidth="1.5" />
          {/* Central Grand Arch (Iwan) */}
          <path d="M26 48V36C26 32.7 28.7 30 32 30C35.3 30 38 32.7 38 36V48H26Z" fill="#78350F" opacity="0.9" />
          {/* Side Arches */}
          <path d="M19 35V40C19 41.1 19.9 42 21 42H23V35H19Z" fill="#8B4513" opacity="0.5" />
          <path d="M19 43V47H23V43H19Z" fill="#8B4513" opacity="0.5" />
          <path d="M41 35V40C41 41.1 41.9 42 43 42H45V35H41Z" fill="#8B4513" opacity="0.5" />
          <path d="M41 43V47H45V43H41Z" fill="#8B4513" opacity="0.5" />
          {/* Central Onion Dome */}
          <path d="M24 28C24 22 27 18 32 14C37 18 40 22 40 28H24Z" fill="#F8FAFC" stroke="#8B4513" strokeWidth="1.5" />
          {/* Dome Finial (Kalash) */}
          <line x1="32" y1="14" x2="32" y2="8" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
          <circle cx="32" cy="8" r="1.5" fill="#F59E0B" />
          {/* Left Side Chhatri (Cupola) */}
          <path d="M20 28C20 25 21.5 23 23 23C24.5 23 26 25 26 28H20Z" fill="#F8FAFC" stroke="#8B4513" strokeWidth="1" />
          <line x1="23" y1="23" x2="23" y2="20" stroke="#8B4513" strokeWidth="1" />
          {/* Right Side Chhatri (Cupola) */}
          <path d="M38 28C38 25 39.5 23 41 23C42.5 23 44 25 44 28H38Z" fill="#F8FAFC" stroke="#8B4513" strokeWidth="1" />
          <line x1="41" y1="23" x2="41" y2="20" stroke="#8B4513" strokeWidth="1" />
          {/* Left Minaret */}
          <rect x="7" y="16" width="4" height="36" fill="#F8FAFC" stroke="#8B4513" strokeWidth="1" />
          <rect x="6" y="24" width="6" height="2" fill="#8B4513" />
          <rect x="6" y="34" width="6" height="2" fill="#8B4513" />
          <path d="M7 16L9 11L11 16H7Z" fill="#F59E0B" stroke="#8B4513" strokeWidth="0.8" />
          {/* Right Minaret */}
          <rect x="53" y="16" width="4" height="36" fill="#F8FAFC" stroke="#8B4513" strokeWidth="1" />
          <rect x="52" y="24" width="6" height="2" fill="#8B4513" />
          <rect x="52" y="34" width="6" height="2" fill="#8B4513" />
          <path d="M53 16L55 11L57 16H53Z" fill="#F59E0B" stroke="#8B4513" strokeWidth="0.8" />
        </svg>
      );

    case 'red_fort':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Red Fort Sandstone Walls */}
          <path d="M8 52V34L14 30V52H8Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.2" />
          <path d="M50 52V30L56 34V52H50Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.2" />
          {/* Central Rampart */}
          <rect x="14" y="34" width="36" height="18" fill="#DC2626" stroke="#991B1B" strokeWidth="1.2" />
          {/* Battlements (Kanguras) */}
          <path d="M14 34L16 31H18L20 34H22L24 31H26L28 34H36L38 31H40L42 34H44L46 31H48L50 34" stroke="#7F1D1D" strokeWidth="1.5" />
          {/* Lahori Gate Arch */}
          <path d="M28 52V42C28 39.8 29.8 38 32 38C34.2 38 36 39.8 36 42V52H28Z" fill="#450A0A" />
          {/* Center Royal Pavilion Chhatris */}
          <path d="M28 30C28 26 32 23 32 23C32 23 36 26 36 30H28Z" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
          <line x1="32" y1="23" x2="32" y2="16" stroke="#16A34A" strokeWidth="1.5" />
          {/* Indian Flag atop Red Fort */}
          <path d="M32 16H39L37 19L39 22H32V16Z" fill="#F97316" />
          {/* Left Tower Dome */}
          <path d="M11 30C11 26 14 24 14 24C14 24 17 26 17 30H11Z" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
          {/* Right Tower Dome */}
          <path d="M47 30C47 26 50 24 50 24C50 24 53 26 53 30H47Z" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
        </svg>
      );

    // 2. MUMBAI (Dark Blue)
    case 'gateway_of_india':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Sea water */}
          <path d="M6 54C12 52 18 55 24 53C30 51 36 54 42 52C48 50 54 53 58 52" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          {/* Plinth */}
          <rect x="10" y="48" width="44" height="4" fill="#64748B" />
          {/* Grand Basalt Gateway Structure */}
          <rect x="12" y="24" width="40" height="24" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1.5" />
          {/* Central Grand Arch */}
          <path d="M24 48V34C24 29.6 27.6 26 32 26C36.4 26 40 29.6 40 34V48H24Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
          {/* Side Arches */}
          <path d="M15 48V38C15 36 16.5 35 18 35C19.5 35 21 36 21 38V48H15Z" fill="#334155" />
          <path d="M43 48V38C43 36 44.5 35 46 35C47.5 35 49 36 49 38V48H43Z" fill="#334155" />
          {/* Central Grand Dome */}
          <path d="M26 24C26 17 32 14 32 14C32 14 38 17 38 24H26Z" fill="#CBD5E1" stroke="#0F172A" strokeWidth="1.2" />
          {/* Corner Turrets */}
          <rect x="12" y="16" width="3" height="8" fill="#94A3B8" />
          <rect x="49" y="16" width="3" height="8" fill="#94A3B8" />
          <rect x="22" y="18" width="2" height="6" fill="#94A3B8" />
          <rect x="40" y="18" width="2" height="6" fill="#94A3B8" />
        </svg>
      );

    case 'marine_drive':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Sky background */}
          <path d="M4 14C20 10 44 10 60 14V50H4V14Z" fill="#0C4A6E" opacity="0.3" rx="4" />
          {/* Mumbai Skyline */}
          <rect x="36" y="24" width="6" height="22" fill="#1E293B" />
          <rect x="43" y="18" width="7" height="28" fill="#334155" />
          <rect x="51" y="28" width="5" height="18" fill="#1E293B" />
          {/* Ocean Waves */}
          <path d="M4 42C12 40 18 45 28 41C36 38 42 42 50 39" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M4 48C14 46 22 51 32 47C40 44 48 48 56 45" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
          {/* Curving Queen's Necklace Promenade */}
          <path d="M4 36C20 36 36 40 46 54" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 3" />
          <path d="M4 38C20 38 35 42 44 56" stroke="#D97706" strokeWidth="2" />
          {/* Street Lights glow */}
          <circle cx="8" cy="34" r="2" fill="#FDE047" />
          <circle cx="16" cy="35" r="2" fill="#FDE047" />
          <circle cx="24" cy="36" r="2" fill="#FDE047" />
          <circle cx="32" cy="38" r="2" fill="#FDE047" />
        </svg>
      );

    // 3. BENGALURU (Green)
    case 'vidhana_soudha':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Steps */}
          <rect x="8" y="48" width="48" height="4" fill="#94A3B8" />
          <rect x="12" y="44" width="40" height="4" fill="#CBD5E1" />
          {/* Main Granite Columns */}
          <rect x="14" y="28" width="36" height="16" fill="#F1F5F9" stroke="#334155" strokeWidth="1.2" />
          <line x1="19" y1="28" x2="19" y2="44" stroke="#64748B" strokeWidth="1.5" />
          <line x1="24" y1="28" x2="24" y2="44" stroke="#64748B" strokeWidth="1.5" />
          <line x1="29" y1="28" x2="29" y2="44" stroke="#64748B" strokeWidth="1.5" />
          <line x1="34" y1="28" x2="34" y2="44" stroke="#64748B" strokeWidth="1.5" />
          <line x1="39" y1="28" x2="39" y2="44" stroke="#64748B" strokeWidth="1.5" />
          <line x1="44" y1="28" x2="44" y2="44" stroke="#64748B" strokeWidth="1.5" />
          {/* Neo-Dravidian Central Pediment */}
          <path d="M22 28L32 20L42 28H22Z" fill="#15803D" stroke="#334155" strokeWidth="1.2" />
          {/* Grand Central Dome */}
          <path d="M27 20C27 15 32 12 32 12C32 12 37 15 37 20H27Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          {/* Four Lions Finial */}
          <circle cx="32" cy="10" r="2" fill="#EAB308" />
          {/* Left & Right Corner Chhatris */}
          <path d="M12 28L15 24L18 28H12Z" fill="#15803D" />
          <path d="M46 28L49 24L52 28H46Z" fill="#15803D" />
        </svg>
      );

    case 'cubbon_park':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Garden Grass ground */}
          <path d="M4 52C20 50 44 50 60 52V56H4V52Z" fill="#166534" />
          {/* Banyan / Bamboo Trees */}
          <path d="M12 52C12 38 18 36 22 36C26 36 30 38 30 52" stroke="#78350F" strokeWidth="3" />
          <circle cx="22" cy="28" r="14" fill="#15803D" opacity="0.9" />
          <circle cx="16" cy="30" r="10" fill="#22C55E" opacity="0.8" />
          <circle cx="28" cy="28" r="10" fill="#16A34A" opacity="0.85" />
          {/* Heritage Gazebo Bandstand */}
          <rect x="36" y="42" width="18" height="10" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
          <path d="M34 42L45 34L56 42H34Z" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
          <line x1="41" y1="42" x2="41" y2="52" stroke="#78350F" strokeWidth="1.5" />
          <line x1="49" y1="42" x2="49" y2="52" stroke="#78350F" strokeWidth="1.5" />
        </svg>
      );

    case 'mg_road':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Metro Viaduct Pillars */}
          <rect x="14" y="36" width="6" height="18" fill="#475569" />
          <rect x="44" y="36" width="6" height="18" fill="#475569" />
          {/* Elevated Metro Track */}
          <rect x="4" y="32" width="56" height="6" rx="1" fill="#64748B" stroke="#1E293B" strokeWidth="1" />
          {/* Sleek Namma Metro Train */}
          <rect x="12" y="22" width="38" height="10" rx="3" fill="#84CC16" stroke="#3F6212" strokeWidth="1.2" />
          <rect x="16" y="24" width="6" height="4" fill="#1E293B" />
          <rect x="25" y="24" width="6" height="4" fill="#1E293B" />
          <rect x="34" y="24" width="6" height="4" fill="#1E293B" />
          <path d="M46 24L50 28H46V24Z" fill="#1E293B" />
          {/* Commercial avenue streetlights */}
          <path d="M4 54H60" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );

    // 4. JAIPUR (Yellow)
    case 'hawa_mahal':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Pink sandstone base */}
          <rect x="10" y="48" width="44" height="6" fill="#F43F5E" opacity="0.9" />
          {/* 5 Tiers Pyramid of Jharokhas */}
          {/* Tier 1 */}
          <rect x="12" y="40" width="40" height="8" rx="1" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />
          <circle cx="18" cy="44" r="1.5" fill="#FFF1F2" />
          <circle cx="25" cy="44" r="1.5" fill="#FFF1F2" />
          <circle cx="32" cy="44" r="1.5" fill="#FFF1F2" />
          <circle cx="39" cy="44" r="1.5" fill="#FFF1F2" />
          <circle cx="46" cy="44" r="1.5" fill="#FFF1F2" />
          {/* Tier 2 */}
          <rect x="16" y="32" width="32" height="8" rx="1" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
          <circle cx="21" cy="36" r="1.5" fill="#FFF1F2" />
          <circle cx="28" cy="36" r="1.5" fill="#FFF1F2" />
          <circle cx="36" cy="36" r="1.5" fill="#FFF1F2" />
          <circle cx="43" cy="36" r="1.5" fill="#FFF1F2" />
          {/* Tier 3 */}
          <rect x="20" y="24" width="24" height="8" rx="1" fill="#FB7185" stroke="#E11D48" strokeWidth="1" />
          <circle cx="25" cy="28" r="1.5" fill="#FFF1F2" />
          <circle cx="32" cy="28" r="1.5" fill="#FFF1F2" />
          <circle cx="39" cy="28" r="1.5" fill="#FFF1F2" />
          {/* Tier 4 */}
          <rect x="24" y="18" width="16" height="6" rx="1" fill="#FDA4AF" stroke="#E11D48" strokeWidth="1" />
          <circle cx="28" cy="21" r="1.2" fill="#FFF1F2" />
          <circle cx="36" cy="21" r="1.2" fill="#FFF1F2" />
          {/* Top Crown Dome */}
          <path d="M28 18C28 13 32 10 32 10C32 10 36 13 36 18H28Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <line x1="32" y1="10" x2="32" y2="6" stroke="#D97706" strokeWidth="1.5" />
        </svg>
      );

    case 'amber_fort':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Aravalli Hill background */}
          <path d="M4 52L20 28L40 40L60 22V52H4Z" fill="#D97706" opacity="0.3" />
          {/* Hilltop Amber Palace Walls */}
          <path d="M10 50L18 36H46L54 50H10Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          {/* Stepped Ramparts */}
          <rect x="20" y="30" width="24" height="8" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
          {/* Rajput Chhatris */}
          <path d="M22 30C22 26 25 24 25 24C25 24 28 26 28 30H22Z" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
          <path d="M36 30C36 26 39 24 39 24C39 24 42 26 42 30H36Z" fill="#FEF08A" stroke="#B45309" strokeWidth="1" />
          {/* Maota Lake Water below */}
          <path d="M4 54C16 52 32 55 46 53C54 52 58 54 60 54" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'city_palace':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Royal Courtyard Gate */}
          <rect x="12" y="26" width="40" height="26" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
          {/* Peacock Arched Entrance */}
          <path d="M25 52V38C25 34 28 31 32 31C36 31 39 34 39 38V52H25Z" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
          {/* Ornate Rajput Jharokhas */}
          <circle cx="19" cy="36" r="3" fill="#E11D48" />
          <circle cx="45" cy="36" r="3" fill="#E11D48" />
          {/* Royal Pavilions on top */}
          <path d="M14 26C14 20 20 18 20 18C20 18 26 20 26 26H14Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <path d="M38 26C38 20 44 18 44 18C44 18 50 20 50 26H38Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <path d="M26 22C26 15 32 12 32 12C32 12 38 15 38 22H26Z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.2" />
        </svg>
      );

    // 5. KOLKATA (Red)
    case 'howrah_bridge':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Hooghly River Water */}
          <path d="M4 52C16 50 32 54 48 51C54 50 58 52 60 52" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          {/* Road Deck */}
          <rect x="4" y="44" width="56" height="4" rx="1" fill="#334155" />
          {/* Cantilever Steel Towers */}
          {/* Left Tower */}
          <path d="M14 44L20 16H24L22 44" fill="#64748B" stroke="#1E293B" strokeWidth="1.2" />
          {/* Right Tower */}
          <path d="M42 44L40 16H44L50 44" fill="#64748B" stroke="#1E293B" strokeWidth="1.2" />
          {/* Top Cross Truss */}
          <line x1="20" y1="16" x2="44" y2="16" stroke="#1E293B" strokeWidth="2" />
          {/* Suspension Cross Bracing */}
          <line x1="22" y1="16" x2="32" y2="44" stroke="#475569" strokeWidth="1.2" />
          <line x1="42" y1="16" x2="32" y2="44" stroke="#475569" strokeWidth="1.2" />
          <line x1="4" y1="44" x2="20" y2="16" stroke="#475569" strokeWidth="1.2" />
          <line x1="60" y1="44" x2="44" y2="16" stroke="#475569" strokeWidth="1.2" />
        </svg>
      );

    case 'victoria_memorial':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Plinth */}
          <rect x="8" y="48" width="48" height="4" fill="#CBD5E1" />
          {/* Marble Wings */}
          <rect x="12" y="32" width="40" height="16" fill="#F8FAFC" stroke="#475569" strokeWidth="1.2" />
          {/* Central Portico Columns */}
          <line x1="26" y1="32" x2="26" y2="48" stroke="#64748B" strokeWidth="1.5" />
          <line x1="32" y1="32" x2="32" y2="48" stroke="#64748B" strokeWidth="1.5" />
          <line x1="38" y1="32" x2="38" y2="48" stroke="#64748B" strokeWidth="1.5" />
          {/* Majestic White Marble Dome */}
          <path d="M24 32C24 22 32 18 32 18C32 18 40 22 40 32H24Z" fill="#F8FAFC" stroke="#334155" strokeWidth="1.5" />
          {/* Angel of Victory */}
          <line x1="32" y1="18" x2="32" y2="12" stroke="#D97706" strokeWidth="1.5" />
          <circle cx="32" cy="11" r="1.5" fill="#F59E0B" />
          {/* Corner Domes */}
          <path d="M14 32C14 28 17 26 17 26C17 26 20 28 20 32H14Z" fill="#F1F5F9" stroke="#475569" strokeWidth="1" />
          <path d="M44 32C44 28 47 26 47 26C47 26 50 28 50 32H44Z" fill="#F1F5F9" stroke="#475569" strokeWidth="1" />
        </svg>
      );

    case 'park_street':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Colonial Heritage Buildings */}
          <rect x="10" y="24" width="20" height="28" fill="#FEE2E2" stroke="#991B1B" strokeWidth="1.2" />
          <rect x="34" y="20" width="20" height="32" fill="#FEF3C7" stroke="#B45309" strokeWidth="1.2" />
          {/* Windows */}
          <rect x="14" y="28" width="4" height="6" rx="2" fill="#7F1D1D" />
          <rect x="22" y="28" width="4" height="6" rx="2" fill="#7F1D1D" />
          <rect x="38" y="26" width="4" height="6" rx="2" fill="#78350F" />
          <rect x="46" y="26" width="4" height="6" rx="2" fill="#78350F" />
          {/* Heritage Streetlamp & Festive Glow */}
          <line x1="32" y1="52" x2="32" y2="28" stroke="#1E293B" strokeWidth="2" />
          <path d="M28 28C28 25 32 24 32 24C32 24 36 25 36 28H28Z" fill="#FBBF24" />
          <circle cx="32" cy="28" r="4" fill="#F59E0B" opacity="0.4" />
        </svg>
      );

    // 6. HYDERABAD (Orange)
    case 'charminar':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Granite Base plinth */}
          <rect x="12" y="48" width="40" height="4" fill="#78350F" />
          {/* Main Square Block */}
          <rect x="16" y="28" width="32" height="20" fill="#FED7AA" stroke="#9A3412" strokeWidth="1.5" />
          {/* Grand Four-way Arch */}
          <path d="M24 48V36C24 32 27 30 32 30C37 30 40 32 40 36V48H24Z" fill="#7C2D12" stroke="#9A3412" strokeWidth="1.2" />
          {/* Upper Gallery with intricate openings */}
          <rect x="16" y="24" width="32" height="4" fill="#EA580C" />
          {/* 4 Iconic Corner Minarets */}
          {/* Minaret 1 (Far Left) */}
          <rect x="12" y="14" width="4" height="34" fill="#FB923C" stroke="#9A3412" strokeWidth="1" />
          <path d="M12 14C12 10 14 8 14 8C14 8 16 10 16 14H12Z" fill="#F59E0B" />
          {/* Minaret 2 (Inner Left) */}
          <rect x="20" y="18" width="3" height="10" fill="#FB923C" />
          {/* Minaret 3 (Inner Right) */}
          <rect x="41" y="18" width="3" height="10" fill="#FB923C" />
          {/* Minaret 4 (Far Right) */}
          <rect x="48" y="14" width="4" height="34" fill="#FB923C" stroke="#9A3412" strokeWidth="1" />
          <path d="M48 14C48 10 50 8 50 8C50 8 52 10 52 14H48Z" fill="#F59E0B" />
        </svg>
      );

    case 'golconda_fort':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Massive Granite Hill */}
          <path d="M6 52L24 24L36 30L46 18L58 52H6Z" fill="#EA580C" opacity="0.35" />
          {/* Citadel Battlements */}
          <rect x="18" y="32" width="28" height="20" fill="#F97316" stroke="#9A3412" strokeWidth="1.5" />
          {/* Spiked Fateh Darwaza Entrance */}
          <path d="M26 52V40C26 37 28 35 32 35C36 35 38 37 38 40V52H26Z" fill="#431407" />
          {/* Top Royal Baradari Pavilion */}
          <rect x="26" y="24" width="12" height="8" fill="#FDBA74" stroke="#C2410C" strokeWidth="1" />
          <path d="M24 24L32 18L40 24H24Z" fill="#D97706" />
        </svg>
      );

    case 'hitec_city':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Cyber Towers Iconic Circular Building */}
          <path d="M16 48V24C16 18 24 16 32 16C40 16 48 18 48 24V48H16Z" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
          {/* Circular Central Open Arch */}
          <circle cx="32" cy="34" r="8" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2" />
          {/* High-tech glass grid lines */}
          <line x1="20" y1="26" x2="44" y2="26" stroke="#BAE6FD" strokeWidth="1" />
          <line x1="20" y1="42" x2="44" y2="42" stroke="#BAE6FD" strokeWidth="1" />
          {/* Telecommunication antenna tower */}
          <line x1="32" y1="16" x2="32" y2="8" stroke="#F97316" strokeWidth="2" />
          <circle cx="32" cy="8" r="1.5" fill="#EA580C" />
        </svg>
      );

    // 7. GOA (Pink)
    case 'calangute_beach':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Golden Beach Sand */}
          <path d="M4 46C20 44 40 48 60 44V56H4V46Z" fill="#FDE047" />
          {/* Ocean waves */}
          <path d="M4 42C16 40 28 44 42 41C52 39 58 42 60 41" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
          {/* Tropical Sun */}
          <circle cx="48" cy="18" r="8" fill="#F97316" />
          {/* Swaying Coconut Palm Tree */}
          <path d="M18 52C18 36 26 28 32 26" stroke="#78350F" strokeWidth="3" strokeLinecap="round" />
          {/* Palm Fronds */}
          <path d="M32 26C30 18 20 18 14 20" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 26C38 18 46 20 50 24" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 26C26 24 22 28 18 34" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M32 26C38 28 42 32 44 38" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'basilica_bom_jesus':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Red Laterite Baroque Church Facade */}
          <rect x="14" y="24" width="36" height="28" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
          {/* 3 Tiers with Baroque Carvings */}
          <rect x="18" y="16" width="28" height="8" fill="#991B1B" stroke="#7F1D1D" strokeWidth="1" />
          {/* Arched Portals */}
          <path d="M26 52V42C26 39 28 37 32 37C36 37 38 39 38 42V52H26Z" fill="#450A0A" />
          <path d="M17 52V45C17 43 18.5 42 20 42C21.5 42 23 43 23 45V52H17Z" fill="#450A0A" />
          <path d="M41 52V45C41 43 42.5 42 44 42C45.5 42 47 43 47 45V52H41Z" fill="#450A0A" />
          {/* Baroque Triangular Pediment */}
          <path d="M22 16L32 10L42 16H22Z" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.2" />
          {/* Crucifix atop */}
          <line x1="32" y1="10" x2="32" y2="4" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
          <line x1="29" y1="6" x2="35" y2="6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'fort_aguada':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Sea waves */}
          <path d="M4 52C16 50 32 54 48 51C54 50 58 52 60 52" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          {/* Coastal Stone Fortress Bastion */}
          <path d="M8 52C10 40 18 36 30 36H56V52H8Z" fill="#78350F" opacity="0.8" />
          {/* Circular 4-Tier Lighthouse Tower */}
          <rect x="22" y="32" width="16" height="12" fill="#E2E8F0" stroke="#334155" strokeWidth="1.2" />
          <rect x="24" y="22" width="12" height="10" fill="#F8FAFC" stroke="#334155" strokeWidth="1.2" />
          <rect x="26" y="14" width="8" height="8" fill="#E2E8F0" stroke="#334155" strokeWidth="1.2" />
          {/* Lighthouse Lantern Room & Light Beam */}
          <path d="M26 14L30 8L34 14H26Z" fill="#DC2626" />
          <circle cx="30" cy="14" r="2.5" fill="#FDE047" />
          <path d="M30 14L52 6V18L30 14Z" fill="#FEF08A" opacity="0.35" />
        </svg>
      );

    // 8. CHENNAI (Light Blue)
    case 'marina_beach':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Golden Marina Sandbar */}
          <path d="M4 44C20 42 40 46 60 42V56H4V44Z" fill="#FDE047" />
          {/* Sunrise horizon */}
          <circle cx="32" cy="36" r="14" fill="#FB923C" opacity="0.6" />
          {/* Gentle Coromandel Coast Ocean Surf */}
          <path d="M4 42C16 39 30 43 44 40C52 38 58 41 60 40" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
          {/* Chennai Lighthouse */}
          <rect x="14" y="24" width="6" height="24" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
          <rect x="14" y="32" width="6" height="6" fill="#F8FAFC" />
          <circle cx="17" cy="22" r="3" fill="#FDE047" />
        </svg>
      );

    case 'kapaleeshwarar_temple':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Base plinth */}
          <rect x="12" y="48" width="40" height="6" fill="#7C2D12" />
          {/* Magnificent Stepped Dravidian Gopuram Tower */}
          <path d="M16 48L20 38H44L48 48H16Z" fill="#EA580C" stroke="#9A3412" strokeWidth="1" />
          <path d="M20 38L23 28H41L44 38H20Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <path d="M23 28L26 18H38L41 28H23Z" fill="#EAB308" stroke="#A16207" strokeWidth="1" />
          <path d="M26 18L28 12H36L38 18H26Z" fill="#84CC16" stroke="#4D7C0F" strokeWidth="1" />
          {/* Sacred Kalasams (Finials atop temple) */}
          <circle cx="29" cy="10" r="1.5" fill="#EAB308" />
          <circle cx="32" cy="10" r="1.5" fill="#EAB308" />
          <circle cx="35" cy="10" r="1.5" fill="#EAB308" />
          {/* Gopuram arched gateway */}
          <path d="M28 54V44C28 41 30 39 32 39C34 39 36 41 36 44V54H28Z" fill="#450A0A" />
        </svg>
      );

    case 'shore_temple':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Rocky coastal shore and sea */}
          <path d="M4 52C16 50 32 54 48 51C54 50 58 52 60 52" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
          {/* Monolithic Granite Pyramidal Vimana */}
          <path d="M18 50L22 38H42L46 50H18Z" fill="#78716C" stroke="#44403C" strokeWidth="1.2" />
          <path d="M22 38L25 26H39L42 38H22Z" fill="#A8A29E" stroke="#44403C" strokeWidth="1.2" />
          <path d="M25 26L28 16H36L39 26H25Z" fill="#D6D3D1" stroke="#44403C" strokeWidth="1.2" />
          {/* Domical Stupika finial */}
          <path d="M28 16C28 11 32 9 32 9C32 9 36 11 36 16H28Z" fill="#78716C" stroke="#44403C" strokeWidth="1" />
          {/* Coastal rock boulder carvings */}
          <circle cx="12" cy="50" r="4" fill="#57534E" />
          <circle cx="52" cy="50" r="3" fill="#57534E" />
        </svg>
      );

    // 9. RAILWAYS (Express Trains)
    case 'vande_bharat':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Railway Tracks */}
          <line x1="4" y1="48" x2="60" y2="48" stroke="#475569" strokeWidth="3" />
          <line x1="4" y1="52" x2="60" y2="52" stroke="#334155" strokeWidth="2" />
          {/* Aerodynamic Vande Bharat Bullet Nose */}
          <path d="M8 44H46C53 44 58 38 58 32C58 26 52 24 44 24H8V44Z" fill="#F8FAFC" stroke="#1E293B" strokeWidth="1.5" />
          {/* Navy Blue High-Speed Stripe */}
          <path d="M8 32H54C56 34 56 36 54 38H8V32Z" fill="#1D4ED8" />
          {/* Aerodynamic Windshield */}
          <path d="M44 26C49 26 53 29 55 33H40V26H44Z" fill="#0F172A" />
          {/* Driver & Passenger Windows */}
          <rect x="14" y="26" width="6" height="5" rx="1" fill="#0F172A" />
          <rect x="23" y="26" width="6" height="5" rx="1" fill="#0F172A" />
          <rect x="32" y="26" width="6" height="5" rx="1" fill="#0F172A" />
          {/* Headlights */}
          <circle cx="56" cy="40" r="1.5" fill="#FDE047" />
        </svg>
      );

    case 'rajdhani_express':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Tracks */}
          <line x1="4" y1="48" x2="60" y2="48" stroke="#475569" strokeWidth="3" />
          {/* Iconic Red & Cream Rajdhani WAP-7 Locomotive */}
          <path d="M10 44H48C54 44 56 38 56 32C56 26 52 24 46 24H10V44Z" fill="#DC2626" stroke="#7F1D1D" strokeWidth="1.5" />
          {/* Cream / Yellow Streak */}
          <rect x="10" y="33" width="44" height="4" fill="#FDE047" />
          {/* Windshield */}
          <path d="M44 26L52 32H40V26H44Z" fill="#1E293B" />
          {/* Passenger Windows */}
          <rect x="14" y="26" width="6" height="5" rx="1" fill="#1E293B" />
          <rect x="23" y="26" width="6" height="5" rx="1" fill="#1E293B" />
          <rect x="32" y="26" width="6" height="5" rx="1" fill="#1E293B" />
          {/* Pantograph atop */}
          <path d="M22 24L26 16L30 24" stroke="#D97706" strokeWidth="1.5" />
          <line x1="23" y1="16" x2="29" y2="16" stroke="#D97706" strokeWidth="2" />
        </svg>
      );

    case 'shatabdi_express':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Tracks */}
          <line x1="4" y1="48" x2="60" y2="48" stroke="#475569" strokeWidth="3" />
          {/* Sky Blue & Grey Shatabdi Coach */}
          <path d="M10 44H48C54 44 56 38 56 32C56 26 52 24 46 24H10V44Z" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
          <rect x="10" y="33" width="44" height="4" fill="#CBD5E1" />
          <path d="M44 26L52 32H40V26H44Z" fill="#0F172A" />
          <rect x="14" y="26" width="6" height="5" rx="1" fill="#0F172A" />
          <rect x="23" y="26" width="6" height="5" rx="1" fill="#0F172A" />
          <rect x="32" y="26" width="6" height="5" rx="1" fill="#0F172A" />
        </svg>
      );

    case 'duronto_express':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Tracks */}
          <line x1="4" y1="48" x2="60" y2="48" stroke="#475569" strokeWidth="3" />
          {/* Yellow and Green Duronto Vinyl Wrap */}
          <path d="M10 44H48C54 44 56 38 56 32C56 26 52 24 46 24H10V44Z" fill="#EAB308" stroke="#A16207" strokeWidth="1.5" />
          <path d="M10 38C20 34 35 40 48 34V44H10V38Z" fill="#16A34A" />
          <path d="M44 26L52 32H40V26H44Z" fill="#0F172A" />
          <rect x="14" y="26" width="6" height="5" rx="1" fill="#0F172A" />
          <rect x="23" y="26" width="6" height="5" rx="1" fill="#0F172A" />
          <rect x="32" y="26" width="6" height="5" rx="1" fill="#0F172A" />
        </svg>
      );

    // 10. POWER & ENERGY (Clean Energy)
    case 'bhadla_solar':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Radiant Sun */}
          <circle cx="48" cy="18" r="8" fill="#F59E0B" />
          <line x1="48" y1="6" x2="48" y2="2" stroke="#F59E0B" strokeWidth="2" />
          <line x1="60" y1="18" x2="64" y2="18" stroke="#F59E0B" strokeWidth="2" />
          <line x1="56" y1="10" x2="60" y2="6" stroke="#F59E0B" strokeWidth="2" />
          {/* Solar Panel Array 1 */}
          <polygon points="10,48 24,34 38,34 24,48" fill="#0284C7" stroke="#0369A1" strokeWidth="1.2" />
          <line x1="17" y1="41" x2="31" y2="41" stroke="#BAE6FD" strokeWidth="1" />
          <line x1="24" y1="34" x2="17" y2="48" stroke="#BAE6FD" strokeWidth="1" />
          {/* Solar Panel Array 2 */}
          <polygon points="26,48 40,34 54,34 40,48" fill="#0284C7" stroke="#0369A1" strokeWidth="1.2" />
          <line x1="33" y1="41" x2="47" y2="41" stroke="#BAE6FD" strokeWidth="1" />
          <line x1="40" y1="34" x2="33" y2="48" stroke="#BAE6FD" strokeWidth="1" />
          {/* Clean energy spark */}
          <path d="M12 24L16 16H20L18 20H22L14 28L16 22H12V24Z" fill="#FBBF24" />
        </svg>
      );

    case 'tehri_dam':
      return (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Massive Embankment Dam Wall */}
          <path d="M10 52L20 22H44L54 52H10Z" fill="#64748B" stroke="#334155" strokeWidth="1.5" />
          {/* Hydro Reservoir Lake on top */}
          <path d="M20 22C28 20 36 20 44 22V26H20V22Z" fill="#0284C7" />
          {/* Cascading Water Spillway */}
          <path d="M26 26L24 52H40L38 26H26Z" fill="#38BDF8" opacity="0.9" />
          <path d="M29 26L28 52H35L34 26" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3 2" />
          {/* Power generator turbine house */}
          <rect x="42" y="44" width="8" height="8" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
        </svg>
      );

    default:
      return null;
  }
};
