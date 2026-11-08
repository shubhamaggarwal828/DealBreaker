import React from 'react';
import { Card, PropertyColor } from '../types/game';
import { COLOR_METAS } from '../engine/deck';
import { LandmarkIcon } from './LandmarkIcons';
import {
  ShieldAlert,
  Coins,
  Building2,
  ArrowRightCircle,
  Home,
  Sparkles,
  Repeat,
  DollarSign,
  Crown,
  HandCoins,
  Gift,
  ArrowRightLeft,
  XCircle,
  Train,
  Lightbulb,
} from 'lucide-react';

interface CardViewProps {
  card: Card;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showRentTable?: boolean;
  activeColor?: PropertyColor;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  onClick,
  selected = false,
  disabled = false,
  size = 'md',
  showRentTable = true,
  activeColor,
}) => {
  // Dimensions matching real card proportions (approx 2.5 x 3.5 ratio)
  const sizeClasses = {
    xs: 'w-[70px] h-[100px] rounded-lg text-[8px]',
    sm: 'w-[90px] h-[128px] rounded-xl text-[9px]',
    md: 'w-[114px] h-[162px] rounded-xl text-[10px]',
    lg: 'w-[145px] h-[206px] rounded-2xl text-[11px]',
  }[size];

  const effectiveColor = activeColor || card.mainColor;
  const colorMeta = effectiveColor ? COLOR_METAS[effectiveColor] : null;

  // Visual Theme & Color Styling for each distinct Action
  const getActionVisuals = () => {
    switch (card.actionType) {
      case 'deal_breaker':
        return {
          bannerBg: 'bg-rose-700',
          accentColor: '#be123c',
          bgTint: 'bg-rose-50/90',
          title: 'DEAL BREAKER',
          badgeText: 'STEAL FULL SET',
          badgeBg: 'bg-rose-600 text-white',
          Icon: Crown,
          iconColor: 'text-rose-600',
        };
      case 'just_say_no':
        return {
          bannerBg: 'bg-red-800',
          accentColor: '#991b1b',
          bgTint: 'bg-red-50/90',
          title: 'JUST SAY NO',
          badgeText: 'CANCEL ATTACK',
          badgeBg: 'bg-red-700 text-white',
          Icon: ShieldAlert,
          iconColor: 'text-red-700',
        };
      case 'sly_deal':
        return {
          bannerBg: 'bg-amber-600',
          accentColor: '#d97706',
          bgTint: 'bg-amber-50/90',
          title: 'SLY DEAL',
          badgeText: 'STEAL 1 PROPERTY',
          badgeBg: 'bg-amber-600 text-white',
          Icon: HandCoins,
          iconColor: 'text-amber-600',
        };
      case 'forced_deal':
        return {
          bannerBg: 'bg-orange-600',
          accentColor: '#ea580c',
          bgTint: 'bg-orange-50/90',
          title: 'FORCED DEAL',
          badgeText: 'SWAP PROPERTIES',
          badgeBg: 'bg-orange-600 text-white',
          Icon: ArrowRightLeft,
          iconColor: 'text-orange-600',
        };
      case 'debt_collector':
        return {
          bannerBg: 'bg-yellow-600',
          accentColor: '#ca8a04',
          bgTint: 'bg-yellow-50/90',
          title: 'DEBT COLLECTOR',
          badgeText: 'COLLECT ₹5 Cr',
          badgeBg: 'bg-yellow-600 text-white',
          Icon: Coins,
          iconColor: 'text-yellow-600',
        };
      case 'its_my_birthday':
        return {
          bannerBg: 'bg-fuchsia-600',
          accentColor: '#c026d3',
          bgTint: 'bg-fuchsia-50/90',
          title: "IT'S MY BIRTHDAY",
          badgeText: 'EVERYONE PAYS ₹2 Cr',
          badgeBg: 'bg-fuchsia-600 text-white',
          Icon: Gift,
          iconColor: 'text-fuchsia-600',
        };
      case 'pass_go':
        return {
          bannerBg: 'bg-blue-600',
          accentColor: '#2563eb',
          bgTint: 'bg-blue-50/90',
          title: 'PASS GO',
          badgeText: 'DRAW 2 CARDS',
          badgeBg: 'bg-blue-600 text-white',
          Icon: ArrowRightCircle,
          iconColor: 'text-blue-600',
        };
      case 'house':
        return {
          bannerBg: 'bg-emerald-700',
          accentColor: '#047857',
          bgTint: 'bg-emerald-50/90',
          title: 'HOUSE',
          badgeText: '+ ₹3 Cr RENT',
          badgeBg: 'bg-emerald-600 text-white',
          Icon: Home,
          iconColor: 'text-emerald-700',
        };
      case 'hotel':
        return {
          bannerBg: 'bg-red-700',
          accentColor: '#b91c1c',
          bgTint: 'bg-red-50/90',
          title: 'HOTEL',
          badgeText: '+ ₹4 Cr RENT',
          badgeBg: 'bg-red-600 text-white',
          Icon: Building2,
          iconColor: 'text-red-700',
        };
      case 'double_the_rent':
        return {
          bannerBg: 'bg-emerald-800',
          accentColor: '#065f46',
          bgTint: 'bg-emerald-50/90',
          title: 'DOUBLE THE RENT',
          badgeText: '2X RENT MULTIPLIER',
          badgeBg: 'bg-emerald-700 text-white',
          Icon: DollarSign,
          iconColor: 'text-emerald-700',
        };
      default:
        return {
          bannerBg: 'bg-stone-800',
          accentColor: '#44403c',
          bgTint: 'bg-stone-50/90',
          title: card.name,
          badgeText: 'ACTION',
          badgeBg: 'bg-stone-700 text-white',
          Icon: Sparkles,
          iconColor: 'text-stone-700',
        };
    }
  };

  // Money Card Color Theming per Denomination (Indian Rupee Note Inspired)
  const getMoneyColor = (val: number) => {
    switch (val) {
      case 1:
        return {
          bg: 'bg-[#EDE7F6]', // Lavender
          border: 'border-purple-600',
          text: 'text-purple-950',
          badge: 'bg-purple-700 text-white',
          symbol: '₹1 Cr',
          hindi: 'एक करोड़',
        };
      case 2:
        return {
          bg: 'bg-[#FFF3E0]', // Orange terracotta
          border: 'border-orange-600',
          text: 'text-orange-950',
          badge: 'bg-orange-600 text-white',
          symbol: '₹2 Cr',
          hindi: 'दो करोड़',
        };
      case 3:
        return {
          bg: 'bg-[#E0F7FA]', // Ocean cyan
          border: 'border-cyan-700',
          text: 'text-cyan-950',
          badge: 'bg-cyan-700 text-white',
          symbol: '₹3 Cr',
          hindi: 'तीन करोड़',
        };
      case 4:
        return {
          bg: 'bg-[#E8F5E9]', // Olive / Mint green
          border: 'border-emerald-700',
          text: 'text-emerald-950',
          badge: 'bg-emerald-700 text-white',
          symbol: '₹4 Cr',
          hindi: 'चार करोड़',
        };
      case 5:
        return {
          bg: 'bg-[#FCE4EC]', // Magenta pink
          border: 'border-pink-700',
          text: 'text-pink-950',
          badge: 'bg-pink-700 text-white',
          symbol: '₹5 Cr',
          hindi: 'पाँच करोड़',
        };
      case 10:
        return {
          bg: 'bg-[#FFF8E1]', // Royal Gold
          border: 'border-amber-700',
          text: 'text-amber-950',
          badge: 'bg-amber-700 text-white',
          symbol: '₹10 Cr',
          hindi: 'दस करोड़',
        };
      default:
        return {
          bg: 'bg-[#F1F5F9]',
          border: 'border-slate-700',
          text: 'text-slate-950',
          badge: 'bg-slate-700 text-white',
          symbol: `₹${val} Cr`,
          hindi: `${val} करोड़`,
        };
    }
  };

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`relative select-none transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer flex-shrink-0 bg-white border-2 border-stone-800
        ${sizeClasses}
        ${selected ? 'ring-4 ring-amber-400 -translate-y-3.5 shadow-[0_0_24px_rgba(251,191,36,0.95)] z-30 scale-105' : 'hover:-translate-y-2 hover:shadow-2xl hover:z-20'}
        ${disabled ? 'opacity-40 cursor-not-allowed filter grayscale-[40%]' : ''}
      `}
      style={{
        boxShadow: selected
          ? '0 0 24px rgba(251, 191, 36, 0.9), 0 12px 24px -4px rgba(0, 0, 0, 0.6)'
          : '0 4px 10px rgba(0, 0, 0, 0.35), 0 1px 3px rgba(0, 0, 0, 0.25)',
      }}
    >
      {/* =========================================================================
          AUTHENTIC VALUE CIRCLE STAMPS (Top-Left and Bottom-Right)
          ========================================================================= */}
      <div
        className={`absolute z-20 flex flex-col items-center justify-center font-black rounded-full shadow border-2 border-stone-900 bg-white text-stone-950 font-mono leading-none
          ${size === 'xs' ? 'top-0.5 left-0.5 w-5 h-5 text-[6.5px]' : size === 'sm' ? 'top-1 left-1 w-6 h-6 text-[8px]' : 'top-1.5 left-1.5 w-7 h-7 text-[9.5px]'}
        `}
      >
        <span>₹{card.value}</span>
        <span className="text-[5px] sm:text-[6px] tracking-tighter text-stone-700 font-sans font-bold leading-none">Cr</span>
      </div>

      {size !== 'xs' && (
        <div
          className={`absolute z-20 flex flex-col items-center justify-center font-black rounded-full shadow border-2 border-stone-900 bg-white text-stone-950 font-mono leading-none
            ${size === 'sm' ? 'bottom-0.5 right-0.5 w-5 h-5 text-[7px]' : 'bottom-1 right-1 w-6 h-6 text-[8.5px]'}
          `}
        >
          <span>₹{card.value}</span>
          <span className="text-[5px] sm:text-[6px] tracking-tighter text-stone-700 font-sans font-bold leading-none">Cr</span>
        </div>
      )}

      {/* =========================================================================
          1. PROPERTY CARDS
          Instant recognition: Large vibrant colored rectangle banner at top,
          prominent Indian monument name, city tag, monument vector visual, and rent chart!
          ========================================================================= */}
      {card.type === 'property' && colorMeta && (
        <div className="h-full flex flex-col justify-between bg-[#FCFBF8]">
          {/* Top Property Color Block */}
          <div
            style={{ backgroundColor: colorMeta.colorHex }}
            className={`flex flex-col items-center justify-center text-center shadow border-b-2 border-stone-900 ${colorMeta.textColor}
              ${size === 'xs' ? 'h-8 pt-0.5' : size === 'sm' ? 'h-10 pt-0.5' : 'h-13 pt-1'}
            `}
          >
            <div className="text-[5.5px] sm:text-[6.5px] font-black uppercase tracking-widest opacity-90 leading-none">
              {card.cityName || colorMeta.city}
            </div>
            <div
              className={`font-black uppercase tracking-tight truncate w-full px-1 drop-shadow-sm leading-tight
                ${size === 'xs' ? 'text-[7px]' : size === 'sm' ? 'text-[9px]' : 'text-[10px]'}
              `}
              title={card.name}
            >
              {card.name}
            </div>
          </div>

          {/* Center Graphic: Monument Illustration & Set Progress Circles */}
          <div className="flex-1 flex flex-col items-center justify-center p-0.5 text-center min-h-0">
            {card.landmarkId ? (
              <div className="flex items-center justify-center my-0.5">
                <LandmarkIcon
                  id={card.landmarkId}
                  className={`${size === 'xs' ? 'w-6 h-6' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} drop-shadow-sm`}
                />
              </div>
            ) : colorMeta.name === 'Indian Railways' ? (
              <Train className={`${size === 'xs' ? 'w-4 h-4' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} text-stone-800 mb-0.5`} />
            ) : colorMeta.name === 'Clean Energy' ? (
              <Lightbulb className={`${size === 'xs' ? 'w-4 h-4' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} text-stone-800 mb-0.5`} />
            ) : (
              <Building2 className={`${size === 'xs' ? 'w-4 h-4' : size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} text-stone-700 mb-0.5`} />
            )}

            <div className="text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-stone-800 leading-none truncate max-w-full px-1">
              {colorMeta.name}
            </div>

            {/* Visual Set Size Dots */}
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: colorMeta.setSize }).map((_, i) => (
                <div
                  key={i}
                  style={{ backgroundColor: colorMeta.colorHex }}
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-stone-800 shadow-xs"
                />
              ))}
            </div>
          </div>

          {/* Rent Schedule Box */}
          {showRentTable && (
            <div className="mx-1 mb-1 bg-white border border-stone-400 rounded-md p-0.5 sm:p-1 shadow-inner text-stone-900">
              <div className="text-center font-black text-[5.5px] sm:text-[6px] uppercase tracking-wider border-b border-stone-200 pb-0.5 text-stone-500">
                RENT
              </div>
              <div className="space-y-0.2 pt-0.5 text-[6.5px] sm:text-[8px] font-bold">
                {colorMeta.rentTiers.map((rent, i) => (
                  <div key={i} className="flex justify-between items-center px-1 text-stone-700 leading-tight">
                    <span>{i + 1} {i === 0 ? 'Card' : 'Cards'}</span>
                    <span className="font-black text-stone-950 font-mono">₹{rent} Cr</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          2. WILDCARDS
          Instant recognition: Diagonal dual color split or 10-color rainbow starburst
          ========================================================================= */}
      {card.type === 'wildcard' && (
        <div className="h-full flex flex-col justify-between bg-[#FCFBF8]">
          {card.isMultiWildcard ? (
            /* Multi-Color 10-Color Wildcard */
            <>
              <div className="h-10 bg-gradient-to-r from-red-600 via-yellow-500 via-green-600 to-blue-600 flex items-center justify-center border-b-2 border-stone-900 shadow">
                <span className="text-white font-black text-[8px] tracking-widest uppercase drop-shadow">
                  ★ 10-COLOR ★
                </span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-1 text-center">
                <Sparkles className={`${size === 'xs' ? 'w-5 h-5' : 'w-9 h-9'} text-amber-500 animate-pulse`} />
                <div className="font-black text-[9px] uppercase tracking-wide text-stone-900 mt-1">
                  ALL-COLOR WILD
                </div>
                <div className="text-[7px] text-stone-600 font-bold px-1">
                  Plays as ANY color property!
                </div>
              </div>
              <div className="mx-1 mb-1.5 py-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-blue-500 text-white text-center font-black text-[6px] uppercase rounded border border-stone-800">
                Property Wildcard
              </div>
            </>
          ) : card.colors && card.colors.length === 2 ? (
            /* Dual-Color Wildcard with Split Header & Center Graphic */
            <>
              <div className="h-10 flex border-b-2 border-stone-900 shadow">
                <div
                  style={{ backgroundColor: COLOR_METAS[card.colors[0]].colorHex }}
                  className="w-1/2 flex items-center justify-center text-white font-black text-[7px] uppercase tracking-tighter border-r border-black/30 px-0.5 truncate"
                >
                  {COLOR_METAS[card.colors[0]].name}
                </div>
                <div
                  style={{ backgroundColor: COLOR_METAS[card.colors[1]].colorHex }}
                  className="w-1/2 flex items-center justify-center text-white font-black text-[7px] uppercase tracking-tighter px-0.5 truncate"
                >
                  {COLOR_METAS[card.colors[1]].name}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-1 text-center">
                <div className="flex items-center gap-1 mb-1">
                  <div
                    style={{ backgroundColor: COLOR_METAS[card.colors[0]].colorHex }}
                    className="w-4 h-4 rounded-full border border-stone-900 shadow"
                  />
                  <Repeat className="w-3.5 h-3.5 text-stone-600" />
                  <div
                    style={{ backgroundColor: COLOR_METAS[card.colors[1]].colorHex }}
                    className="w-4 h-4 rounded-full border border-stone-900 shadow"
                  />
                </div>
                <div className="font-black text-[8px] uppercase tracking-wide text-stone-900">
                  DUAL WILDCARD
                </div>
                <div className="text-[6px] text-stone-500 font-bold mt-0.5">
                  Flip color anytime on turn
                </div>
              </div>

              <div className="mx-1 mb-1.5 py-0.5 bg-stone-100 text-stone-800 text-center font-black text-[6px] uppercase rounded border border-stone-300">
                Property Wildcard
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* =========================================================================
          3. MONEY CARDS - RESERVE BANK OF DEALBREAKER
          Instant recognition: Indian banknote styling, Ashoka emblem or watermark style,
          bold ₹X Cr denomination, and RBI promise text!
          ========================================================================= */}
      {card.type === 'money' && (() => {
        const m = getMoneyColor(card.value);
        return (
          <div className={`h-full flex flex-col justify-between p-1 sm:p-1.5 ${m.bg}`}>
            <div className={`border-2 ${m.border} border-dashed rounded-lg h-full flex flex-col justify-between p-1 items-center bg-white/80 shadow-inner relative overflow-hidden`}>
              {/* Note Header */}
              <div className="text-center w-full pt-0.5 border-b border-stone-300 pb-0.5">
                <div className="text-[5px] sm:text-[6px] font-black uppercase tracking-widest text-stone-700 leading-none">
                  RESERVE BANK OF DEALBREAKER
                </div>
                <div className="text-[4.5px] sm:text-[5px] font-bold text-stone-500 tracking-tight">
                  GUARANTEED BY CENTRAL BANK
                </div>
              </div>

              {/* Central Banknote Medallion with HUGE ₹X Cr */}
              <div className={`w-12 sm:w-16 h-12 sm:h-16 rounded-full border-2 ${m.border} flex flex-col items-center justify-center bg-white shadow-md my-auto relative`}>
                <div className="text-[5px] sm:text-[6px] font-bold text-stone-500 uppercase tracking-tighter">
                  {m.hindi}
                </div>
                <span className={`font-black font-mono tracking-tighter ${m.text} ${size === 'xs' ? 'text-sm' : size === 'sm' ? 'text-lg' : 'text-xl'} leading-none`}>
                  ₹{card.value}
                </span>
                <span className="text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-wider text-stone-700 font-sans">
                  CRORE
                </span>
              </div>

              {/* Note Footer */}
              <div className="w-full text-center pb-0.5 border-t border-stone-200 pt-0.5">
                <span className={`text-[5px] sm:text-[6px] font-black uppercase px-1.5 py-0.2 rounded-full ${m.badge} shadow-xs inline-block`}>
                  BANK CASH ONLY
                </span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          4. ACTION CARDS
          Instant recognition: Big Bold Colored Header, HUGE iconic symbol,
          Action Name in large letters, and a colored summary banner!
          ========================================================================= */}
      {card.type === 'action' && (() => {
        const a = getActionVisuals();
        const ActionIcon = a.Icon;

        return (
          <div className={`h-full flex flex-col justify-between ${a.bgTint}`}>
            {/* Top Action Header Banner */}
            <div className={`${a.bannerBg} text-white text-center py-1.5 px-1 shadow border-b-2 border-stone-900`}>
              <div className="text-[6px] font-black uppercase tracking-widest opacity-80 leading-none">
                ACTION CARD
              </div>
              <div className={`font-black uppercase tracking-tight drop-shadow truncate w-full px-1
                ${size === 'xs' ? 'text-[7px]' : size === 'sm' ? 'text-[9px]' : 'text-[10px]'}
              `}>
                {a.title}
              </div>
            </div>

            {/* Central Graphic: Big Clear Icon & Instant Action Summary Badge */}
            <div className="flex-1 flex flex-col items-center justify-center p-1 text-center">
              <div className="p-1.5 rounded-full bg-white shadow-md border border-stone-200 mb-1">
                <ActionIcon className={`${size === 'xs' ? 'w-5 h-5' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'} ${a.iconColor}`} />
              </div>

              {/* High-visibility Action Effect Pill: Users instantly know what the card does! */}
              <span className={`text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full shadow-sm ${a.badgeBg}`}>
                {a.badgeText}
              </span>
            </div>

            {/* Rule Explainer footer */}
            <div className="mx-1 mb-1 bg-white border border-stone-300 rounded p-0.5 text-center text-stone-700 shadow-inner">
              <p className="text-[6px] sm:text-[7px] font-bold leading-tight line-clamp-2">
                {card.description}
              </p>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          5. RENT CARDS
          Instant recognition: Two color stripes or wild rainbow + Big RENT Badge!
          ========================================================================= */}
      {card.type === 'rent' && (
        <div className="h-full flex flex-col justify-between bg-sky-50/90">
          {card.isWildRent ? (
            /* Wild Rent */
            <>
              <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 text-white text-center py-1.5 px-1 shadow border-b-2 border-stone-900">
                <div className="text-[6px] font-black uppercase tracking-widest opacity-80 leading-none">
                  RENT CARD
                </div>
                <div className="text-[9px] font-black uppercase tracking-wider">
                  WILD RENT
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-1 text-center">
                <div className="p-1.5 rounded-full bg-white shadow-md border border-stone-200 mb-1">
                  <Coins className={`${size === 'xs' ? 'w-5 h-5' : 'w-8 h-8'} text-purple-600`} />
                </div>
                <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-700 text-white shadow-sm">
                  CHARGE ANY COLOR
                </span>
                <span className="text-[6px] text-stone-500 font-bold mt-1">
                  Target 1 Player
                </span>
              </div>
            </>
          ) : card.colors && card.colors.length === 2 ? (
            /* Dual-Color Rent */
            <>
              <div className="h-10 flex border-b-2 border-stone-900 shadow">
                <div
                  style={{ backgroundColor: COLOR_METAS[card.colors[0]].colorHex }}
                  className="w-1/2 flex items-center justify-center text-white font-black text-[7px] uppercase tracking-tighter border-r border-black/30 px-0.5 truncate"
                >
                  {COLOR_METAS[card.colors[0]].name}
                </div>
                <div
                  style={{ backgroundColor: COLOR_METAS[card.colors[1]].colorHex }}
                  className="w-1/2 flex items-center justify-center text-white font-black text-[7px] uppercase tracking-tighter px-0.5 truncate"
                >
                  {COLOR_METAS[card.colors[1]].name}
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center p-1 text-center">
                <div className="p-1 rounded-full bg-white shadow border border-stone-200 mb-1">
                  <Coins className={`${size === 'xs' ? 'w-4 h-4' : 'w-7 h-7'} text-amber-500`} />
                </div>
                <span className="text-[7px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-600 text-white shadow-sm">
                  CHARGE RENT
                </span>
                <span className="text-[6px] text-stone-500 font-bold mt-0.5">
                  All players pay!
                </span>
              </div>
            </>
          ) : null}

          <div className="mx-1 mb-1 bg-white border border-stone-300 rounded p-0.5 text-center text-stone-700 shadow-inner">
            <p className="text-[6px] sm:text-[7px] font-bold leading-tight line-clamp-2">
              {card.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
