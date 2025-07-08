import React from 'react'

// Simple 10x10 tile map (beach, water, rocks)
const MAP_SIZE = 10
const TILE_SIZE = 40
const mapData = [
  ['w','w','w','w','w','w','w','w','w','w'],
  ['w','s','s','s','s','s','s','s','s','w'],
  ['w','s','r','s','s','s','r','s','s','w'],
  ['w','s','s','s','r','s','s','s','s','w'],
  ['w','s','s','s','s','s','s','r','s','w'],
  ['w','s','r','s','s','s','s','s','s','w'],
  ['w','s','s','s','s','r','s','s','s','w'],
  ['w','s','s','r','s','s','s','s','s','w'],
  ['w','s','s','s','s','s','s','s','s','w'],
  ['w','w','w','w','w','w','w','w','w','w'],
]

function getTileColor(type: string) {
  switch(type) {
    case 'w': return '#4FC3F7' // water
    case 's': return '#FFE082' // sand
    case 'r': return '#A1887F' // rock
    default: return '#EEE'
  }
}

export default function TileMap() {
  return (
    <svg width={MAP_SIZE*TILE_SIZE} height={MAP_SIZE*TILE_SIZE} style={{display:'block'}}>
      {mapData.map((row, y) =>
        row.map((cell, x) => (
          <rect
            key={x+','+y}
            x={x*TILE_SIZE}
            y={y*TILE_SIZE}
            width={TILE_SIZE}
            height={TILE_SIZE}
            fill={getTileColor(cell)}
            stroke="#BDBDBD"
            strokeWidth={1}
          />
        ))
      )}
    </svg>
  )
}
