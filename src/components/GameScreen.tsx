import React, { useState, useEffect } from 'react'
import { Joystick } from 'react-joystick-component'

export default function GameScreen() {
  const [playerPos, setPlayerPos] = useState({ x: 200, y: 200 })
  const [moveVector, setMoveVector] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayerPos(pos => {
        let newX = pos.x + moveVector.x * 5
        let newY = pos.y + moveVector.y * 5
        newX = Math.max(20, Math.min(380, newX))
        newY = Math.max(20, Math.min(380, newY))
        return { x: newX, y: newY }
      })
    }, 50)
    return () => clearInterval(interval)
  }, [moveVector])

  const handleMove = (stickData) => {
    const rad = (stickData.angle * Math.PI) / 180
    const dist = stickData.distance / 100
    setMoveVector({ x: Math.cos(rad) * dist, y: Math.sin(rad) * dist })
  }

  const handleStop = () => {
    setMoveVector({ x: 0, y: 0 })
  }

  const handleShoot = () => alert('Shoot!')
  const handleAim = () => alert('Aim!')
  const handleRun = () => alert('Run!')
  const handleGrab = () => alert('Grab!')

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-green-700 via-green-900 to-black overflow-hidden">
      <div className="relative mx-auto mt-8 w-[400px] h-[400px] bg-slate-800 rounded-lg border-4 border-green-600">
        <div
          className="absolute bg-yellow-400 rounded-full border-2 border-yellow-600"
          style={{ width: 40, height: 40, left: playerPos.x - 20, top: playerPos.y - 20 }}
          title="Hermit Crab Player"
        />
      </div>

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