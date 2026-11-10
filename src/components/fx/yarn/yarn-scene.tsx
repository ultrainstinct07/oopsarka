'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  BufferAttribute,
  type BufferGeometry,
  CatmullRomCurve3,
  Color,
  type Group,
  MathUtils,
  MeshPhysicalMaterial,
  SphereGeometry,
  TubeGeometry,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

/** Deterministic pseudo-random numbers so the ball looks the same on every visit. */
function seeded(seed: number) {
  let s = seed
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const STRAND_COLORS = ['#c7b9e8', '#b8a6e1', '#d7ccf1', '#aa96d8', '#c2b2e6'].map((hex) => new Color(hex))

function buildYarn() {
  const rand = seeded(1729)
  const strands: BufferGeometry[] = []
  for (let i = 0; i < 46; i++) {
    const normal = new Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1).normalize()
    const helper = Math.abs(normal.y) < 0.9 ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0)
    const u = new Vector3().crossVectors(normal, helper).normalize()
    const v = new Vector3().crossVectors(normal, u)
    const radius = 1 + (rand() - 0.5) * 0.05
    const phase = rand() * Math.PI * 2
    const points: Vector3[] = []
    for (let k = 0; k < 60; k++) {
      const t = (k / 60) * Math.PI * 2
      const wobble = 1 + Math.sin(t * 3 + phase) * 0.014
      points.push(
        u
          .clone()
          .multiplyScalar(Math.cos(t) * radius * wobble)
          .add(v.clone().multiplyScalar(Math.sin(t) * radius * wobble)),
      )
    }
    const tube = new TubeGeometry(new CatmullRomCurve3(points, true), 90, 0.03, 6, true)
    const color = STRAND_COLORS[Math.floor(rand() * STRAND_COLORS.length)]
    const colors = new Float32Array(tube.attributes.position.count * 3)
    for (let j = 0; j < tube.attributes.position.count; j++) colors.set([color.r, color.g, color.b], j * 3)
    tube.setAttribute('color', new BufferAttribute(colors, 3))
    strands.push(tube)
  }
  const ball = mergeGeometries(strands)
  strands.forEach((strand) => strand.dispose())

  const loose = new TubeGeometry(
    new CatmullRomCurve3([
      new Vector3(-0.62, -0.64, 0.48),
      new Vector3(-0.98, -0.98, 0.55),
      new Vector3(-1.42, -1.14, 0.42),
      new Vector3(-2.2, -1.2, 0.18),
    ]),
    48,
    0.03,
    6,
    false,
  )
  const looseColors = new Float32Array(loose.attributes.position.count * 3)
  for (let j = 0; j < loose.attributes.position.count; j++) looseColors.set([0.6, 0.53, 0.82], j * 3)
  loose.setAttribute('color', new BufferAttribute(looseColors, 3))

  return { ball, loose, core: new SphereGeometry(0.965, 40, 28) }
}

function Ball({ spins }: { spins: number }) {
  const group = useRef<Group>(null)
  const velocity = useRef(0)
  const pointer = useRef({ x: 0, y: 0 })
  const { ball, loose, core } = useMemo(() => buildYarn(), [])
  const wool = useMemo(
    () =>
      new MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.82,
        sheen: 1,
        sheenRoughness: 0.45,
        sheenColor: new Color('#fff3e4'),
      }),
    [],
  )
  const coreMaterial = useMemo(() => new MeshPhysicalMaterial({ color: '#8f7bc9', roughness: 1 }), [])

  useEffect(() => {
    if (spins > 0) velocity.current += 9
  }, [spins])

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(
    () => () => {
      ball.dispose()
      loose.dispose()
      core.dispose()
      wool.dispose()
      coreMaterial.dispose()
    },
    [ball, loose, core, wool, coreMaterial],
  )

  useFrame((state, delta) => {
    const node = group.current
    if (!node) return
    const dt = Math.min(delta, 0.05)
    velocity.current *= Math.exp(-dt * 1.7)
    node.rotation.y += dt * (0.22 + velocity.current)
    const scrollRoll = Math.min(window.scrollY, 900) * 0.0012
    node.rotation.x = MathUtils.damp(node.rotation.x, pointer.current.y * 0.32 + scrollRoll, 4, dt)
    node.rotation.z = MathUtils.damp(node.rotation.z, -pointer.current.x * 0.22, 4, dt)
    node.position.y = Math.sin(state.clock.elapsedTime * 1.1) * 0.035
  })

  return (
    <group ref={group}>
      <mesh geometry={core} material={coreMaterial} />
      <mesh geometry={ball} material={wool} />
      <mesh geometry={loose} material={wool} />
    </group>
  )
}

export default function YarnScene({ spins, onReady, className }: { spins: number; onReady: () => void; className?: string }) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const node = wrapper.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting && document.visibilityState === 'visible'),
    )
    observer.observe(node)
    const onVisibility = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <div ref={wrapper} aria-hidden className={className}>
      <Canvas
        dpr={[1, 1.75]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0, 4.6], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={() => requestAnimationFrame(() => requestAnimationFrame(onReady))}
      >
        <hemisphereLight args={['#fff8ef', '#5f4b9b', 1.15]} />
        <directionalLight position={[-2.5, 3, 4]} intensity={2.4} color="#fff2df" />
        <directionalLight position={[3, -1.5, -2]} intensity={0.9} color="#c7b9e8" />
        <Ball spins={spins} />
      </Canvas>
    </div>
  )
}
