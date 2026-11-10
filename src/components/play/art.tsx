import type { CSSProperties, ReactNode } from 'react'
import type { ItemKind } from '@/lib/play/knock'
import type { ObstacleKind } from '@/lib/play/zoomies'
import { cn } from '@/lib/utils'

/**
 * Artwork for the Playroom games, drawn to match the story illustrations:
 * a thick ink line over flat fills that sit slightly off-register (riso style).
 * Everything here is decorative; the games label their own controls.
 */

const INK = '#24211f'
const PAPER = '#f8f5ef'
const GINGER = '#e0914a'
const GINGER_DEEP = '#c2742f'
const CREAM = '#f6d3a8'
const PINK = '#e7b8b0'
const LAVENDER = '#c7b9e8'
const LAVENDER_DEEP = '#9a86d0'
const BUTTER = '#f3d875'
const SAGE = '#becdba'
const SAGE_DEEP = '#86a680'
const TERRACOTTA = '#d98a52'

type ArtProps = { className?: string; style?: CSSProperties }

/** One shape: the fill, nudged off-register, then its ink outline. */
function Shape({ d, fill, width = 3 }: { d: string; fill: string; width?: number }) {
  return (
    <>
      <path d={d} fill={fill} transform="translate(1.6 1.6)" />
      <path d={d} fill="none" stroke={INK} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />
    </>
  )
}

function Line({ d, color = INK, width = 2.5 }: { d: string; color?: string; width?: number }) {
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
}

function Art({ viewBox, children, className, style }: ArtProps & { viewBox: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} aria-hidden className={cn('overflow-visible', className)} style={style}>
      {children}
    </svg>
  )
}

/* ───────────────────────── Knock It Off: things on the table ───────────────────────── */

function Mug() {
  return (
    <>
      <g className="steam">
        <Line d="M30 22c-3-4 3-6 0-11" width={2.2} />
        <Line d="M42 22c-3-4 3-6 0-11" width={2.2} />
      </g>
      <Line d="M54 38h6a8 8 0 0 1 0 16h-6" width={3} />
      <Shape d="M20 30h36v32a10 10 0 0 1-10 10H30a10 10 0 0 1-10-10z" fill={PAPER} />
      <path d="M21.5 42h33v10h-33z" fill={LAVENDER} />
      <Line d="M21 42h34M21 52h34" width={2} />
    </>
  )
}

function Plant() {
  return (
    <>
      <Shape d="M40 46c-2-14-14-19-21-17 0 11 8 17 21 17z" fill={SAGE} />
      <Shape d="M40 46c2-16 14-23 23-21 0 13-9 21-23 21z" fill={SAGE} />
      <Shape d="M40 46c-7-12-3-27 2-34 6 9 6 23-2 34z" fill={SAGE_DEEP} />
      <Line d="M41 44c0-10 0-20 1-28" width={1.8} />
      <Shape d="M27 52h26l-4 20H31z" fill={TERRACOTTA} />
      <Shape d="M23 44h34v9H23z" fill="#e6a26c" />
    </>
  )
}

function Pencils() {
  return (
    <>
      <Shape d="M31 46l-5-26 7-2 5 28z" fill={LAVENDER} />
      <Shape d="M38 46V14h7v32z" fill={PINK} />
      <Shape d="M46 46l6-27 7 2-6 25z" fill={SAGE} />
      <Line d="M26 20l2-6 5 4M38 14l3.5-6 3.5 6M52 19l5-4 2 6" width={2} />
      <Shape d="M25 44h30l-3 28H28z" fill={BUTTER} />
      <Line d="M26.5 54h27" width={2} />
    </>
  )
}

function Glasses() {
  return (
    <>
      <Line d="M13 56l-6-10M67 56l6-10" width={3} />
      <path d="M36 57c2-5 6-5 8 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx="25.6" cy="61.6" r="12" fill="#ebe5f7" />
      <circle cx="56.6" cy="61.6" r="12" fill="#ebe5f7" />
      <circle cx="24" cy="60" r="12" fill="none" stroke={INK} strokeWidth={3.4} />
      <circle cx="55" cy="60" r="12" fill="none" stroke={INK} strokeWidth={3.4} />
      <Line d="M18 55l5-4M49 55l5-4" color={PAPER} width={2.4} />
    </>
  )
}

function Laptop() {
  return (
    <>
      <Shape d="M17 22h46a3 3 0 0 1 3 3v33H14V25a3 3 0 0 1 3-3z" fill="#2c3458" />
      <Line d="M21 31h18M21 38h32M21 45h12" color={BUTTER} width={3} />
      <Line d="M21 52h24" color={LAVENDER} width={3} />
      <Shape d="M8 58h64l-4 11a4 4 0 0 1-4 3H16a4 4 0 0 1-4-3z" fill="#ddd6c8" />
      <Line d="M33 65h14" width={2} />
    </>
  )
}

const ITEM_ART: Record<ItemKind, () => ReactNode> = {
  mug: Mug,
  plant: Plant,
  pen: Pencils,
  glasses: Glasses,
  laptop: Laptop,
}

export function ItemArt({ kind, className }: ArtProps & { kind: ItemKind }) {
  const Drawing = ITEM_ART[kind]
  return (
    <Art viewBox="0 0 80 80" className={className}>
      <Drawing />
    </Art>
  )
}

/** Arka's arm, reaching in to do the knocking. */
export function PawArm({ className, style }: ArtProps) {
  return (
    <Art viewBox="0 0 60 120" className={className} style={style}>
      <Shape d="M17 0h26v86a13 13 0 0 1-26 0z" fill={GINGER} />
      <Line d="M18 26c8 4 16 4 24 0M18 46c8 4 16 4 24 0" color={GINGER_DEEP} width={3} />
      <Shape d="M10 92a20 17 0 1 0 40 0a20 17 0 1 0-40 0z" fill={CREAM} />
      <Line d="M22 100v7M30 102v7M38 100v7" width={2.4} />
    </Art>
  )
}

export type ArkaMood = 'calm' | 'pleased' | 'oops'

/** Arka peeking over the table edge, paws up. */
export function ArkaPeek({ mood = 'calm', className }: ArtProps & { mood?: ArkaMood }) {
  return (
    <Art viewBox="0 0 140 116" className={className}>
      <Shape d="M34 38l5-30 28 18z" fill={GINGER} />
      <Shape d="M106 38l-5-30-28 18z" fill={GINGER} />
      <path d="M41 32l3-15 14 9zM99 32l-3-15-14 9z" fill={PINK} />
      <Shape d="M20 70a50 43 0 1 0 100 0a50 43 0 1 0-100 0z" fill={GINGER} />
      <Shape d="M22 74l-15 5 13 8z" fill={GINGER} width={2.6} />
      <Shape d="M118 74l15 5-13 8z" fill={GINGER} width={2.6} />
      <Line d="M61 31v11M70 29v13M79 31v11" color={GINGER_DEEP} width={3} />
      <ellipse cx="71.6" cy="89.6" rx="22" ry="15" fill={CREAM} />
      {mood === 'pleased' ? (
        <Line d="M42 66c5-6 11-6 16 0M82 66c5-6 11-6 16 0" width={3.2} />
      ) : (
        <>
          <circle cx="50" cy="64" r="10" fill="#f0b24a" stroke={INK} strokeWidth={2.6} />
          <circle cx="90" cy="64" r="10" fill="#f0b24a" stroke={INK} strokeWidth={2.6} />
          {mood === 'oops' ? (
            <>
              <circle cx="50" cy="64" r="3" fill={INK} />
              <circle cx="90" cy="64" r="3" fill={INK} />
              <path d="M112 44c4 6 5 10 0 12-5-2-4-6 0-12z" fill="#a9c8e8" stroke={INK} strokeWidth={2} />
            </>
          ) : (
            <g className="blink">
              <ellipse cx="50" cy="64" rx="4" ry="7.5" fill={INK} />
              <ellipse cx="90" cy="64" rx="4" ry="7.5" fill={INK} />
              <circle cx="52" cy="60.5" r="1.8" fill={PAPER} />
              <circle cx="92" cy="60.5" r="1.8" fill={PAPER} />
            </g>
          )}
        </>
      )}
      <path d="M66 78h8l-4 5z" fill={PINK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <Line
        d={mood === 'oops' ? 'M64 90a6 5 0 1 0 12 0a6 5 0 1 0-12 0' : 'M70 83c-2 6-9 6-11 1M70 83c2 6 9 6 11 1'}
        width={2.4}
      />
      <Line d="M40 84l-18-3M40 89l-17 4M100 84l18-3M100 89l17 4" width={1.8} />
      <Shape d="M22 106a14 9 0 1 0 28 0a14 9 0 1 0-28 0z" fill={CREAM} />
      <Shape d="M90 106a14 9 0 1 0 28 0a14 9 0 1 0-28 0z" fill={CREAM} />
      <Line d="M31 106v6M36 107v6M41 106v6M99 106v6M104 107v6M109 106v6" width={2} />
    </Art>
  )
}

/* ───────────────────────── 3 AM Zoomies: the runner and the hallway ───────────────────────── */

export type RunnerPose = 'run-a' | 'run-b' | 'jump' | 'crash'

const LEGS: Record<RunnerPose, { far: string; near: string }> = {
  'run-a': { far: 'M27 47l-9 10M52 47l10 9', near: 'M33 49l5 9M46 49l-3 9' },
  'run-b': { far: 'M28 47l7 10M51 47l-5 10', near: 'M32 49l-8 8M47 49l8 8' },
  jump: { far: 'M26 45l-13 5M54 44l13 3', near: 'M30 48l-12 8M50 47l12 7' },
  crash: { far: 'M27 47l-10 9M52 47l11 8', near: 'M33 49l-4 10M46 49l5 10' },
}

function Legs({ d }: { d: string }) {
  return (
    <>
      <path d={d} fill="none" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <path d={d} fill="none" stroke={GINGER} strokeWidth={5} strokeLinecap="round" />
    </>
  )
}

/** Arka in full flight, side on. */
export function Runner({ pose, className, style }: ArtProps & { pose: RunnerPose }) {
  const legs = LEGS[pose]
  return (
    <Art viewBox="0 0 86 62" className={className} style={style}>
      <Shape d="M19 39C5 37 0 19 10 11c9-8 21 1 17 12-2 6-1 10 4 13z" fill={GINGER} />
      <Line d="M9 22c3-4 8-5 12-3" color={CREAM} width={3} />
      <Legs d={legs.far} />
      <Shape d="M16 40a24 14 0 1 0 48 0a24 14 0 1 0-48 0z" fill={GINGER} />
      <path d="M25 47c7 8 25 8 33 0-4 6-10 9-17 9s-12-3-16-9z" fill={CREAM} />
      <Line d="M34 28c2 3 2 7 0 10M42 27c2 3 2 7 0 10M50 28c2 3 2 7 0 10" color={GINGER_DEEP} width={2.6} />
      <Legs d={legs.near} />
      <Shape d="M55 18l1-13 11 7z" fill={GINGER} width={2.6} />
      <Shape d="M68 14l8-10 3 13z" fill={GINGER} width={2.6} />
      <Shape d="M51 29a14 14 0 1 0 28 0a14 14 0 1 0-28 0z" fill={GINGER} />
      <ellipse cx="71.6" cy="36.6" rx="9" ry="6" fill={CREAM} />
      {pose === 'crash' ? (
        <Line d="M66 24l6 6M72 24l-6 6" width={2.6} />
      ) : (
        <>
          <circle cx="70" cy="27" r="3" fill={INK} />
          <circle cx="71" cy="26" r="1" fill={PAPER} />
        </>
      )}
      <path d="M77 31h5l-2.5 3z" fill={PINK} stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
      <Line d="M75 36l10 0M75 38l9 4" width={1.4} />
    </Art>
  )
}

const OBSTACLE_BOX: Record<ObstacleKind, string> = {
  slipper: '0 0 80 44',
  box: '0 0 84 84',
  feet: '0 0 124 60',
  yarn: '0 0 60 60',
  plant: '0 0 60 108',
}

function Slipper() {
  return (
    <>
      <Shape d="M6 37c0-17 15-28 33-28 9 0 16 5 16 13v15z" fill={PINK} />
      <Shape d="M55 37c0-8 7-13 20-13v13z" fill="#cf968c" />
      <Shape d="M4 36h72a4 4 0 0 1 0 8H4a4 4 0 0 1 0-8z" fill="#b9897a" />
      <circle cx="29.6" cy="15.6" r="8" fill={PAPER} />
      <circle cx="28" cy="14" r="8" fill="none" stroke={INK} strokeWidth={2.6} />
    </>
  )
}

function Box() {
  return (
    <>
      <Shape d="M7 28h70v52H7z" fill="#d89a5c" />
      <Shape d="M7 28L2 12h34l6 16z" fill="#e6b27a" />
      <Shape d="M77 28l5-16H48l-6 16z" fill="#e6b27a" />
      <path d="M36 29h12v22H36z" fill={BUTTER} />
      <Line d="M36 29v22M48 29v22" width={2} />
      <Line d="M62 68V54M56 60l6-6 6 6" width={2.6} />
    </>
  )
}

function Feet() {
  return (
    <>
      <Shape d="M3 57c0-30 20-50 59-50s59 20 59 50z" fill={LAVENDER} />
      <Line d="M16 40c22-17 70-17 92 0M30 26c18-10 46-10 64 0" color={LAVENDER_DEEP} width={3} />
      <Shape d="M24 45a11 13 0 1 0 22 0a11 13 0 1 0-22 0z" fill="#f1cdb0" />
      <Shape d="M50 47a11 12 0 1 0 22 0a11 12 0 1 0-22 0z" fill="#f1cdb0" />
      <Line d="M29 38l1 3M35 36v3M41 38l-1 3M55 41l1 3M61 39v3M67 41l-1 3" width={2} />
    </>
  )
}

function Yarn() {
  return (
    <>
      <Shape d="M4 31a26 26 0 1 0 52 0a26 26 0 1 0-52 0z" fill={LAVENDER} />
      <Line d="M9 24c12 8 30 6 42-6M7 36c14 6 34 2 48-12M12 46c14 0 30-8 40-20" color={LAVENDER_DEEP} width={2.4} />
      <Line d="M24 7c-4 14-2 34 8 48M36 6c-2 14 2 32 12 44" color={LAVENDER_DEEP} width={2.4} />
      <Line d="M10 50c-4 5-8 6-10 6" color={LAVENDER_DEEP} width={3} />
    </>
  )
}

function TallPlant() {
  return (
    <>
      <Shape d="M30 70C16 62 8 46 8 30c12 6 20 20 22 40z" fill={SAGE} />
      <Shape d="M30 70c14-8 22-24 22-40-12 6-20 20-22 40z" fill={SAGE} />
      <Shape d="M30 70C22 50 24 22 30 5c6 17 8 45 0 65z" fill={SAGE_DEEP} />
      <Shape d="M15 78h30l-4 27H19z" fill={TERRACOTTA} />
      <Shape d="M11 68h38v11H11z" fill="#e6a26c" />
    </>
  )
}

const OBSTACLE_ART: Record<ObstacleKind, () => ReactNode> = {
  slipper: Slipper,
  box: Box,
  feet: Feet,
  yarn: Yarn,
  plant: TallPlant,
}

export function ObstacleArt({ kind, className, style }: ArtProps & { kind: ObstacleKind }) {
  const Drawing = OBSTACLE_ART[kind]
  return (
    <Art viewBox={OBSTACLE_BOX[kind]} className={className} style={style}>
      <Drawing />
    </Art>
  )
}

/** A fish-shaped biscuit. */
export function TreatArt({ className, style }: ArtProps) {
  return (
    <Art viewBox="0 0 48 36" className={className} style={style}>
      <Shape d="M32 18l13-10v20z" fill="#eec24f" width={2.6} />
      <Shape d="M3 18c8-13 23-13 31 0-8 13-23 13-31 0z" fill={BUTTER} width={2.6} />
      <circle cx="12" cy="16" r="2" fill={INK} />
      <Line d="M20 12c3 4 3 8 0 12" width={2} />
    </Art>
  )
}

const svgUrl = (svg: string) => `url("data:image/svg+xml,${encodeURIComponent(svg)}")`

/** The far wall: striped wallpaper, a window on the night skyline, a framed portrait. */
export const HALLWAY_WALL = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 200" width="480" height="200">
<rect width="480" height="200" fill="#161d36"/>
<g fill="#1a2242"><rect x="0" width="30" height="200"/><rect x="60" width="30" height="200"/><rect x="120" width="30" height="200"/><rect x="180" width="30" height="200"/><rect x="240" width="30" height="200"/><rect x="300" width="30" height="200"/><rect x="360" width="30" height="200"/><rect x="420" width="30" height="200"/></g>
<rect x="70" y="24" width="150" height="120" rx="6" fill="#0c1126"/>
<circle cx="188" cy="54" r="14" fill="#f3d875"/><circle cx="183" cy="50" r="12" fill="#0c1126" opacity=".18"/>
<g fill="#f3efe7"><circle cx="92" cy="44" r="1.6"/><circle cx="118" cy="36" r="1.2"/><circle cx="150" cy="48" r="1.6"/><circle cx="130" cy="62" r="1.1"/><circle cx="206" cy="84" r="1.3"/><circle cx="100" cy="72" r="1.1"/></g>
<path d="M73 141v-39h22V86h18v30h16V78h24v40h14V94h20v24h14v-16h16v39z" fill="#232b52"/>
<g fill="#f4b860"><rect x="79" y="110" width="5" height="6"/><rect x="88" y="122" width="5" height="6"/><rect x="100" y="94" width="5" height="6"/><rect x="134" y="86" width="5" height="6"/><rect x="143" y="100" width="5" height="6"/><rect x="134" y="114" width="5" height="6"/><rect x="172" y="102" width="5" height="6"/><rect x="180" y="116" width="5" height="6"/><rect x="204" y="110" width="5" height="6"/></g>
<rect x="70" y="24" width="150" height="120" rx="6" fill="none" stroke="#3d4672" stroke-width="6"/>
<path d="M145 24v120M70 84h150" stroke="#3d4672" stroke-width="5"/>
<rect x="60" y="142" width="170" height="9" rx="3" fill="#3d4672"/>
<rect x="330" y="46" width="74" height="60" rx="4" fill="#2a2750" stroke="#3d4672" stroke-width="5"/>
<path d="M352 92c0-16 6-22 15-22s15 6 15 22zM354 76l3-12 9 7zM380 76l-3-12-9 7z" fill="#cdbff2" opacity=".75"/>
</svg>`,
)

/** Furniture silhouettes that slide past a little faster than the wall. */
export const HALLWAY_FURNITURE = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 200" width="720" height="200">
<g fill="#232b52">
<rect x="40" y="140" width="110" height="9" rx="3"/><rect x="50" y="149" width="7" height="51"/><rect x="133" y="149" width="7" height="51"/>
<path d="M78 140v-22h10v22zM68 118l8-26h24l8 26z"/>
<rect x="112" y="124" width="22" height="16" rx="3"/>
<path d="M398 200l-6-34h44l-6 34zM414 166c-14-30-10-58 0-80 10 22 14 50 0 80zM410 166c-22-14-30-34-30-52 16 8 28 26 30 52zM418 166c22-14 30-34 30-52-16 8-28 26-30 52z"/>
<rect x="600" y="150" width="90" height="7" rx="3"/><rect x="600" y="174" width="90" height="7" rx="3"/><rect x="604" y="150" width="6" height="50"/><rect x="680" y="150" width="6" height="50"/>
<path d="M616 174c0-9 6-12 14-12s10 4 12 12zM650 174c0-7 5-10 12-10s9 3 11 10z"/>
</g>
<g fill="#f4b860" opacity=".5"><path d="M70 118l7-23h22l7 23z"/></g>
</svg>`,
)

/** Floorboards. One tile is 96px wide, so the seams give a sense of speed. */
export const HALLWAY_FLOOR = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 30" width="96" height="30">
<rect width="96" height="30" fill="#2b3157"/><rect width="96" height="4" fill="#4a548a"/>
<rect x="0" y="4" width="3" height="26" fill="#1d2340"/><rect x="48" y="16" width="3" height="14" fill="#1d2340"/><rect x="0" y="15" width="96" height="2" fill="#242a4c"/>
</svg>`,
)

/** Wallpaper for the Knock It Off room: small diamonds. */
export const ROOM_WALLPAPER = svgUrl(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" width="36" height="36"><path d="M18 11l4 7-4 7-4-7zM0 -7l4 7-4 7-4-7zM36 -7l4 7-4 7-4-7zM0 29l4 7-4 7-4-7zM36 29l4 7-4 7-4-7z" fill="#c7b9e8" opacity=".38"/></svg>`,
)

/* ───────────────────────── Paw Pairs: the back of a case-file card ───────────────────────── */

function MiniPaw({ x, y, r = 0 }: { x: number; y: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(.2)`} fill={INK} opacity=".16">
      <ellipse cx="0" cy="9" rx="12" ry="10" />
      <ellipse cx="-15.5" cy="-5" rx="5.2" ry="7" />
      <ellipse cx="-5.5" cy="-15.5" rx="5.2" ry="7" />
      <ellipse cx="5.5" cy="-15.5" rx="5.2" ry="7" />
      <ellipse cx="15.5" cy="-5" rx="5.2" ry="7" />
    </g>
  )
}

export function CardBack({ className }: ArtProps) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden preserveAspectRatio="none" className={className}>
      <rect width="100" height="100" fill={LAVENDER} />
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="6"
        fill="none"
        stroke={INK}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        opacity=".55"
      />
      <MiniPaw x={22} y={24} r={-20} />
      <MiniPaw x={78} y={22} r={18} />
      <MiniPaw x={20} y={78} r={24} />
      <MiniPaw x={80} y={80} r={-16} />
      <circle cx="51" cy="51" r="21" fill={BUTTER} />
      <circle cx="50" cy="50" r="21" fill="none" stroke={INK} strokeWidth="2.2" />
      <g transform="translate(50 51) scale(.62)" fill={INK}>
        <ellipse cx="0" cy="9" rx="12" ry="10" />
        <ellipse cx="-15.5" cy="-5" rx="5.2" ry="7" />
        <ellipse cx="-5.5" cy="-15.5" rx="5.2" ry="7" />
        <ellipse cx="5.5" cy="-15.5" rx="5.2" ry="7" />
        <ellipse cx="15.5" cy="-5" rx="5.2" ry="7" />
      </g>
    </svg>
  )
}

/* ───────────────────────── Shared: stars and confetti ───────────────────────── */

const STAR = 'M12 2.5l2.9 6 6.6.900-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.900z'

/** Up to three stars. Read out as text by the caller. */
export function Stars({ count, small, className }: { count: number; small?: boolean; className?: string }) {
  return (
    <span aria-hidden className={cn('inline-flex gap-1', className)}>
      {[0, 1, 2].map((index) => (
        <svg
          key={index}
          viewBox="0 0 24 24"
          className={cn(small ? 'size-6' : 'size-8', index < count && 'pop-in')}
          style={{ ['--d' as string]: `${200 + index * 160}ms` }}
        >
          <path
            d={STAR}
            fill={index < count ? BUTTER : 'none'}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
            opacity={index < count ? 1 : 0.35}
          />
        </svg>
      ))}
    </span>
  )
}

const CONFETTI_COLOURS = [LAVENDER, BUTTER, PINK, SAGE, GINGER]

/** A burst of paper confetti for a finished game. Hidden with reduced motion. */
export function Confetti({ pieces = 30 }: { pieces?: number }) {
  return (
    <div aria-hidden className="confetti pointer-events-none absolute inset-x-0 top-0 z-20 h-0">
      {Array.from({ length: pieces }, (_, index) => {
        // Spread deterministically, so server and client agree.
        const left = (index * 37 + 11) % 100
        const drift = ((index * 53) % 80) - 40
        const turn = ((index * 97) % 540) - 270
        return (
          <span
            key={index}
            className={cn('confetti-piece absolute top-0', index % 3 === 0 ? 'size-2.5 rounded-full' : 'h-3 w-2 rounded-[2px]')}
            style={
              {
                left: `${left}%`,
                background: CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
                '--dx': `${drift}px`,
                '--turn': `${turn}deg`,
                '--d': `${(index % 10) * 45}ms`,
                '--t': `${1300 + ((index * 71) % 700)}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}
