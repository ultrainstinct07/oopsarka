/** 3 AM Zoomies: a one-button runner. Pure simulation, no DOM. Units are CSS pixels. */

export type ObstacleKind = 'slipper' | 'box' | 'feet' | 'yarn' | 'plant'

export interface Obstacle {
  id: number
  kind: ObstacleKind
  /** Left edge, measured from the left of the hallway. */
  x: number
  width: number
  height: number
}

/** A biscuit to grab on the way. `y` is its bottom edge above the floor. */
export interface Treat {
  id: number
  x: number
  y: number
}

export interface ZoomiesState {
  elapsedMs: number
  /** Height of the cat's feet above the floor. */
  y: number
  velocity: number
  distance: number
  /** Distance still to run before the next obstacle appears. */
  untilSpawn: number
  nextId: number
  obstacles: Obstacle[]
  treats: Treat[]
  /** Treats grabbed so far. */
  collected: number
  /** How many times the cat has left the floor (drives the jump effects). */
  jumps: number
  over: boolean
}

export const CAT = { x: 56, width: 50, height: 38 }
export const TREAT = { width: 24, height: 18, points: 10 }
export const GRAVITY = 2300
export const JUMP_VELOCITY = 780
/** Edges are forgiving by a few pixels, so near misses feel fair. */
const FORGIVENESS = 7

export const OBSTACLE_SHAPES: Record<ObstacleKind, { width: number; height: number }> = {
  slipper: { width: 40, height: 22 },
  box: { width: 42, height: 42 },
  feet: { width: 62, height: 30 },
  yarn: { width: 30, height: 30 },
  plant: { width: 30, height: 54 },
}
const KINDS = Object.keys(OBSTACLE_SHAPES) as ObstacleKind[]

export function initialState(): ZoomiesState {
  return {
    elapsedMs: 0,
    y: 0,
    velocity: 0,
    distance: 0,
    untilSpawn: 420,
    nextId: 1,
    obstacles: [],
    treats: [],
    collected: 0,
    jumps: 0,
    over: false,
  }
}

/**
 * Pixels per second: starts at a trot and tops out at a proper zoom. Narrow
 * hallways (phones) get a lower top speed, so there is always time to react.
 */
export function speedAt(elapsedMs: number, hallway = 900) {
  const top = Math.min(540, Math.max(330, hallway * 1.1))
  return Math.min(top, 250 + elapsedMs * 0.011)
}

/** Obstacles are spaced by time, so there is always room to land and jump again. */
export function gapFor(speed: number, random: () => number) {
  return speed * (0.85 + random() * 0.75)
}

export function score(state: ZoomiesState) {
  return Math.floor(state.distance / 20) + state.collected * TREAT.points
}

export function jump(state: ZoomiesState): ZoomiesState {
  if (state.over || state.y > 0) return state
  return { ...state, velocity: JUMP_VELOCITY, jumps: state.jumps + 1 }
}

export function collides(y: number, obstacle: Obstacle) {
  const overlapsX = CAT.x + CAT.width - FORGIVENESS > obstacle.x && CAT.x + FORGIVENESS < obstacle.x + obstacle.width
  return overlapsX && y < obstacle.height - FORGIVENESS
}

/** Treats are generous: brushing one is enough. */
export function reaches(y: number, treat: Treat) {
  const overlapsX = CAT.x + CAT.width > treat.x - 4 && CAT.x < treat.x + TREAT.width + 4
  const overlapsY = y + CAT.height > treat.y - 4 && y < treat.y + TREAT.height + 4
  return overlapsX && overlapsY
}

/** Advance the run by `dtMs`. `hallway` is the visible width, where new obstacles appear. */
export function step(state: ZoomiesState, dtMs: number, hallway: number, random: () => number): ZoomiesState {
  if (state.over) return state
  // A long frame (a background tab waking up) is treated as a short one.
  const dt = Math.min(dtMs, 48) / 1000
  const elapsedMs = state.elapsedMs + dt * 1000
  const speed = speedAt(elapsedMs, hallway)
  const travelled = speed * dt

  let velocity = state.velocity - GRAVITY * dt
  let y = state.y + velocity * dt
  if (y <= 0) {
    y = 0
    velocity = 0
  }

  let obstacles = state.obstacles
    .map((obstacle) => ({ ...obstacle, x: obstacle.x - travelled }))
    .filter((obstacle) => obstacle.x + obstacle.width > -20)
  let treats = state.treats.map((treat) => ({ ...treat, x: treat.x - travelled })).filter((treat) => treat.x + TREAT.width > -20)
  let untilSpawn = state.untilSpawn - travelled
  let nextId = state.nextId

  if (untilSpawn <= 0) {
    const kind = KINDS[Math.floor(random() * KINDS.length)]
    const shape = OBSTACLE_SHAPES[kind]
    const x = hallway + 20
    obstacles = [...obstacles, { id: nextId, kind, x, ...shape }]
    nextId += 1
    untilSpawn = gapFor(speed, random)
    // Sometimes a biscuit: over the obstacle (grabbed on the way), or in the open (worth an extra hop).
    const roll = random()
    if (roll < 0.3) {
      treats = [...treats, { id: nextId, x: x + shape.width / 2 - TREAT.width / 2, y: shape.height + 40 }]
      nextId += 1
    } else if (roll < 0.5) {
      treats = [...treats, { id: nextId, x: x + shape.width + untilSpawn / 2, y: 66 }]
      nextId += 1
    }
  }

  const before = treats.length
  treats = treats.filter((treat) => !reaches(y, treat))
  const collected = state.collected + (before - treats.length)

  const over = obstacles.some((obstacle) => collides(y, obstacle))
  return {
    elapsedMs,
    y,
    velocity,
    distance: state.distance + travelled,
    untilSpawn,
    nextId,
    obstacles,
    treats,
    collected,
    jumps: state.jumps,
    over,
  }
}

export function zoomiesStars(points: number) {
  return points >= 150 ? 3 : points >= 70 ? 2 : points >= 25 ? 1 : 0
}

export function zoomiesVerdict(points: number) {
  if (points >= 150) return 'The whole building is awake. Magnificent.'
  if (points >= 70) return 'A proper 3 AM lap. The human stirred twice.'
  if (points >= 25) return 'Decent zoom. The slipper had it coming.'
  return 'Tripped early. Blame the slipper.'
}
