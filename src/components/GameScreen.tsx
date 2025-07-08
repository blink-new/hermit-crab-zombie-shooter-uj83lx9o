import React, { useState, useEffect } from 'react'
import { Joystick } from 'react-joystick-component'
import TileMap from './TileMap'

const MAP_SIZE = 10
const TILE_SIZE = 40
const PLAYER_SIZE = 36
const START_POS = { x: 5, y: 5 }

export default function GameScreen() {
  // Player position in tile coordinates
  const [playerTile, setPlayerTile] = useState(START_POS)
  const [moveVector, setMoveVector] = useState({ x: 0, y: 0 })

  // Move player based on joystick
  useEffect(() => {
    if (moveVector.x === 0 && moveVector.y === 0) return
    const interval = setInterval(() => {
      setPlayerTile(pos => {
        let newX = pos.x + moveVector.x
        let newY = pos.y + moveVector.y
        newX = Math.max(1, Math.min(MAP_SIZE-2, newX))
        newY = Math.max(1, Math.min(MAP_SIZE-2, newY))
        return { x: newX, y: newY }
      })
    }, 120)
    return () => clearInterval(interval)
  }, [moveVector])

  // Joystick: convert angle to tile direction
  const handleMove = (stickData) => {
    if (!stickData.angle) return
    const angle = stickData.angle
    let dx = 0, dy = 0
    if (angle > 45 && angle <= 135) dy = 1
    else if (angle > 225 && angle <= 315) dy = -1
    if (angle > 135 && angle <= 225) dx = -1
    else if (angle <= 45 || angle > 315) dx = 1
    setMoveVector({ x: dx, y: dy })
  }
  const handleStop = () => setMoveVector({ x: 0, y: 0 })

  // Button handlers (no alerts)
  const handleShoot = () => {}
  const handleAim = () => {}
  const handleRun = () => {}
  const handleGrab = () => {}

  // Calculate pixel position for player sprite
  const px = playerTile.x * TILE_SIZE + TILE_SIZE/2 - PLAYER_SIZE/2
  const py = playerTile.y * TILE_SIZE + TILE_SIZE/2 - PLAYER_SIZE/2

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-green-700 via-green-900 to-black overflow-hidden flex items-center justify-center">
      <div className="relative" style={{ width: MAP_SIZE*TILE_SIZE, height: MAP_SIZE*TILE_SIZE }}>
        {/* Tile map background */}
        <TileMap />
        {/* Hermit crab sprite */}
        <img
          src={require('../assets/hermit-crab.svg').default}
          alt="Hermit Crab"
          style={{
            position: 'absolute',
            left: px,
            top: py,
            width: PLAYER_SIZE,
            height: PLAYER_SIZE,
            zIndex: 2,
            pointerEvents: 'none',
            transition: 'left 0.12s, top 0.12s',
          }}
        />
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
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-lg transition"
          aria-label="Shoot Button"
        >
          Shoot
        </button>
        <button
          onClick={handleAim}
          className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold shadow-lg transition"
          aria-label="Aim Button"
        >
          Aim
        </button>
        <button
          onClick={handleRun}
          className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold shadow-lg transition"
          aria-label="Run Button"
        >
          Run
        </button>
        <button
          onClick={handleGrab}
          className="w-16 h-16 rounded-full bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white font-bold shadow-lg transition"
          aria-label="Grab Button"
        >
          Grab
        </button>
      </div>
    </div>
  )
}