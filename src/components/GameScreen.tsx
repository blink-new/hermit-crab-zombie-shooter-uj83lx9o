import React, { useState, useEffect } from 'react'
import { Joystick } from 'react-joystick-component'

// Game constants
const MAP_SIZE = 800
const VIEWPORT = 400
const PLAYER_RADIUS = 20
const PLAYER_SPEED = 3
const RUN_MULTIPLIER = 2
const ZOMBIE_RADIUS = 18
const ZOMBIE_SPEED = 1.5
const PELLET_SPEED = 10
const PELLET_LIFETIME = 30 // frames
const SHOTGUN_PELLETS = 5
const SHOTGUN_SPREAD = Math.PI / 6 // 30 degrees

function getRandomSpawn() {
  // Spawn at map edge
  const edge = Math.floor(Math.random() * 4)
  if (edge === 0) return { x: 0, y: Math.random() * MAP_SIZE }
  if (edge === 1) return { x: MAP_SIZE, y: Math.random() * MAP_SIZE }
  if (edge === 2) return { x: Math.random() * MAP_SIZE, y: 0 }
  return { x: Math.random() * MAP_SIZE, y: MAP_SIZE }
}

function distance(a, b) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

export default function GameScreen() {
  // Player state
  const [player, setPlayer] = useState({
    x: MAP_SIZE / 2,
    y: MAP_SIZE / 2,
    angle: 0,
    running: false,
    health: 100,
  })
  const [moveVec, setMoveVec] = useState({ x: 0, y: 0 })
  const [isRunning, setIsRunning] = useState(false)
  const [pellets, setPellets] = useState([])
  const [zombies, setZombies] = useState([
    { x: 100, y: 100, health: 3, id: 1 },
    { x: 700, y: 700, health: 3, id: 2 },
  ])
  const [zombieId, setZombieId] = useState(3)
  const [shootCooldown, setShootCooldown] = useState(0)
  const [score, setScore] = useState(0)

  // Joystick movement
  const handleMove = (stick) => {
    if (typeof stick.angle !== 'number' || typeof stick.distance !== 'number') return
    const rad = (stick.angle * Math.PI) / 180
    const dist = stick.distance / 100
    setMoveVec({ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist })
    if (dist > 0.2) setPlayer(p => ({ ...p, angle: rad }))
  }
  const handleStop = () => setMoveVec({ x: 0, y: 0 })

  // Run button
  const handleRun = () => setIsRunning(r => !r)
  useEffect(() => setPlayer(p => ({ ...p, running: isRunning })), [isRunning])

  // Shoot button
  const handleShoot = () => {
    if (shootCooldown > 0) return
    // Fire shotgun pellets
    setPellets(pellets => [
      ...pellets,
      ...Array.from({ length: SHOTGUN_PELLETS }).map((_, i) => {
        const spread = (i - (SHOTGUN_PELLETS - 1) / 2) * (SHOTGUN_SPREAD / (SHOTGUN_PELLETS - 1))
        return {
          x: player.x + Math.cos(player.angle) * PLAYER_RADIUS,
          y: player.y + Math.sin(player.angle) * PLAYER_RADIUS,
          angle: player.angle + spread,
          lifetime: PELLET_LIFETIME,
        }
      })
    ])
    setShootCooldown(10)
  }

  // Main game loop
  useEffect(() => {
    let anim = requestAnimationFrame(loop)
    function loop() {
      // Move player
      setPlayer(p => {
        const speed = PLAYER_SPEED * (p.running ? RUN_MULTIPLIER : 1)
        let nx = p.x + moveVec.x * speed
        let ny = p.y + moveVec.y * speed
        nx = isNaN(nx) ? MAP_SIZE / 2 : Math.max(PLAYER_RADIUS, Math.min(MAP_SIZE - PLAYER_RADIUS, nx))
        ny = isNaN(ny) ? MAP_SIZE / 2 : Math.max(PLAYER_RADIUS, Math.min(MAP_SIZE - PLAYER_RADIUS, ny))
        return { ...p, x: nx, y: ny }
      })
      // Move pellets
      setPellets(pellets => pellets
        .map(p => ({
          ...p,
          x: p.x + Math.cos(p.angle) * PELLET_SPEED,
          y: p.y + Math.sin(p.angle) * PELLET_SPEED,
          lifetime: p.lifetime - 1,
        }))
        .filter(p => p.lifetime > 0 && p.x > 0 && p.x < MAP_SIZE && p.y > 0 && p.y < MAP_SIZE)
      )
      // Move zombies
      setZombies(zs => zs.map(z => {
        const dx = player.x - z.x
        const dy = player.y - z.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 1) {
          const nx = z.x + (dx / dist) * ZOMBIE_SPEED
          const ny = z.y + (dy / dist) * ZOMBIE_SPEED
          return { ...z, x: nx, y: ny }
        }
        return z
      }))
      // Pellet-zombie collision
      setZombies(zs => {
        const newZs = zs.map(z => {
          let hit = false
          setPellets(pellets => pellets.filter(p => {
            if (!hit && distance(z, p) < ZOMBIE_RADIUS + 6) {
              hit = true
              return false
            }
            return true
          }))
          return hit ? { ...z, health: z.health - 1 } : z
        })
        // Remove dead zombies, increment score
        const alive = newZs.filter(z => z.health > 0)
        setScore(s => s + (newZs.length - alive.length))
        return alive
      })
      // Zombie-player collision
      setPlayer(p => {
        for (const z of zombies) {
          if (distance(p, z) < PLAYER_RADIUS + ZOMBIE_RADIUS) {
            return { ...p, health: Math.max(0, p.health - 1) }
          }
        }
        return p
      })
      // Spawn new zombies
      setZombies(zs => {
        if (Math.random() < 0.02 && zs.length < 10) {
          return [...zs, { ...getRandomSpawn(), health: 3, id: zombieId }]
        }
        return zs
      })
      setZombieId(id => id + 1)
      // Shoot cooldown
      setShootCooldown(cd => Math.max(0, cd - 1))
      anim = requestAnimationFrame(loop)
    }
    return () => cancelAnimationFrame(anim)
  }, [moveVec, player.x, player.y, player.angle, player.running, zombies, zombieId])

  // Grab button (heal)
  const handleGrab = () => setPlayer(p => ({ ...p, health: Math.min(100, p.health + 20) }))

  // Center viewport on player
  const offsetX = Math.max(0, Math.min(MAP_SIZE - VIEWPORT, isNaN(player.x) ? MAP_SIZE / 2 : player.x - VIEWPORT / 2))
  const offsetY = Math.max(0, Math.min(MAP_SIZE - VIEWPORT, isNaN(player.y) ? MAP_SIZE / 2 : player.y - VIEWPORT / 2))

  // Render
  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-green-700 via-green-900 to-black overflow-hidden select-none">
      {/* Game area (viewport) */}
      <div className="relative mx-auto mt-8 w-[400px] h-[400px] bg-slate-900 rounded-lg border-4 border-green-600 overflow-hidden shadow-2xl">
        <svg
          width={VIEWPORT}
          height={VIEWPORT}
          style={{ position: 'absolute', left: 0, top: 0 }}
        >
          {/* Map bounds */}
          <rect x={-offsetX} y={-offsetY} width={MAP_SIZE} height={MAP_SIZE} fill="#222" stroke="#444" strokeWidth={8} />
          {/* Player */}
          <g>
            <circle
              cx={isNaN(player.x - offsetX) ? VIEWPORT / 2 : player.x - offsetX}
              cy={isNaN(player.y - offsetY) ? VIEWPORT / 2 : player.y - offsetY}
              r={PLAYER_RADIUS}
              fill="#ffe066"
              stroke="#bfa100"
              strokeWidth={4}
            />
            {/* Crab "claws" */}
            <ellipse
              cx={isNaN(player.x - offsetX + Math.cos(player.angle) * 24) ? VIEWPORT / 2 : player.x - offsetX + Math.cos(player.angle) * 24}
              cy={isNaN(player.y - offsetY + Math.sin(player.angle) * 24) ? VIEWPORT / 2 : player.y - offsetY + Math.sin(player.angle) * 24}
              rx={8}
              ry={4}
              fill="#ffb700"
              transform={`rotate(${(player.angle * 180) / Math.PI},${isNaN(player.x - offsetX) ? VIEWPORT / 2 : player.x - offsetX},${isNaN(player.y - offsetY) ? VIEWPORT / 2 : player.y - offsetY})`}
            />
          </g>
          {/* Pellets */}
          {pellets.map((p, i) => (
            <circle
              key={i}
              cx={isNaN(p.x - offsetX) ? VIEWPORT / 2 : p.x - offsetX}
              cy={isNaN(p.y - offsetY) ? VIEWPORT / 2 : p.y - offsetY}
              r={5}
              fill="#fff"
              opacity={0.8}
            />
          ))}
          {/* Zombies */}
          {zombies.map(z => (
            <g key={z.id}>
              <circle
                cx={isNaN(z.x - offsetX) ? VIEWPORT / 2 : z.x - offsetX}
                cy={isNaN(z.y - offsetY) ? VIEWPORT / 2 : z.y - offsetY}
                r={ZOMBIE_RADIUS}
                fill="#6ee7b7"
                stroke="#065f46"
                strokeWidth={4}
              />
              {/* Eyes */}
              <circle cx={isNaN(z.x - offsetX - 6) ? VIEWPORT / 2 : z.x - offsetX - 6} cy={isNaN(z.y - offsetY - 4) ? VIEWPORT / 2 : z.y - offsetY - 4} r={2} fill="#222" />
              <circle cx={isNaN(z.x - offsetX + 6) ? VIEWPORT / 2 : z.x - offsetX + 6} cy={isNaN(z.y - offsetY - 4) ? VIEWPORT / 2 : z.y - offsetY - 4} r={2} fill="#222" />
            </g>
          ))}
        </svg>
        {/* HUD */}
        <div className="absolute top-2 left-2 text-white text-lg font-bold bg-black/60 px-3 py-1 rounded shadow">
          HP: <span className={player.health > 30 ? 'text-green-300' : 'text-red-400'}>{player.health}</span>
        </div>
        <div className="absolute top-2 right-2 text-white text-lg font-bold bg-black/60 px-3 py-1 rounded shadow">
          Score: {score}
        </div>
      </div>
      {/* Controls overlay */}
      <div className="absolute bottom-8 left-8">
        <Joystick
          size={100}
          baseColor="rgba(255,255,255,0.2)"
          stickColor="rgba(255,255,255,0.6)"
          move={handleMove}
          stop={handleStop}
        />
      </div>
      <div className="absolute bottom-8 right-8 flex flex-col space-y-4">
        <button
          onClick={handleShoot}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-lg transition text-lg"
          aria-label="Shoot Button"
        >
          Shoot
        </button>
        <button
          onClick={handleRun}
          className={`w-16 h-16 rounded-full ${isRunning ? 'bg-green-700' : 'bg-green-600'} hover:bg-green-700 active:bg-green-800 text-white font-bold shadow-lg transition text-lg`}
          aria-label="Run Button"
        >
          {isRunning ? 'Running' : 'Run'}
        </button>
        <button
          onClick={handleGrab}
          className="w-16 h-16 rounded-full bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 text-white font-bold shadow-lg transition text-lg"
          aria-label="Grab Button"
        >
          Grab
        </button>
      </div>
    </div>
  )
}