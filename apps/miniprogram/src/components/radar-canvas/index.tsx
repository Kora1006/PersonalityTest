import { useEffect, useRef } from 'react'
import { Canvas, View } from '@tarojs/components'
import Taro from '@tarojs/taro'

interface RadarCanvasProps {
  scores: { D: number; I: number; S: number; C: number }
  size?: number
  canvasId?: string
}

const CENTER = 150
const MAX_RADIUS = 110
const LABEL_OFFSET = MAX_RADIUS + 22

const DISC_COLORS = {
  D: '#ef4444',
  I: '#f59e0b',
  S: '#10b981',
  C: '#3b82f6',
}

const AXES: { type: keyof typeof DISC_COLORS; angle: number; label: string }[] = [
  { type: 'D', angle: -90, label: 'D' },
  { type: 'I', angle: 0, label: 'I' },
  { type: 'S', angle: 90, label: 'S' },
  { type: 'C', angle: 180, label: 'C' },
]

function toXY(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER + radius * Math.sin(rad),
  }
}

function drawRadar(
  ctx: Taro.CanvasContext,
  scores: { D: number; I: number; S: number; C: number },
  progress = 1
) {
  // Clear canvas
  ctx.clearRect(0, 0, 300, 300)

  // Draw grid rings
  const ringPcts = [25, 50, 75, 100]
  ctx.setStrokeStyle('rgba(71,85,105,0.5)')
  ctx.setLineWidth(1)

  for (const pct of ringPcts) {
    const r = MAX_RADIUS * (pct / 100)
    ctx.beginPath()
    const ringPoints = AXES.map(({ angle }) => toXY(angle, r))
    ctx.moveTo(ringPoints[0].x, ringPoints[0].y)
    for (let i = 1; i < ringPoints.length; i++) {
      ctx.lineTo(ringPoints[i].x, ringPoints[i].y)
    }
    ctx.closePath()
    ctx.stroke()
  }

  // Draw axis lines
  for (const { angle, label } of AXES) {
    const end = toXY(angle, MAX_RADIUS)
    ctx.setStrokeStyle('rgba(71,85,105,0.5)')
    ctx.setLineWidth(1)
    ctx.beginPath()
    ctx.moveTo(CENTER, CENTER)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()

    // Labels
    const lp = toXY(angle, LABEL_OFFSET)
    ctx.setFontSize(14)
    ctx.setFillStyle('#94a3b8')
    ctx.setTextAlign('center')
    ctx.setTextBaseline('middle')
    ctx.fillText(label, lp.x, lp.y)
  }

  // Draw score polygon (animated by progress 0→1)
  const dataPoints = AXES.map(({ type, angle }) => {
    const rawScore = Math.max(scores[type], 5)
    const r = MAX_RADIUS * (rawScore / 100) * progress
    return toXY(angle, r)
  })

  // Fill
  ctx.beginPath()
  ctx.moveTo(dataPoints[0].x, dataPoints[0].y)
  for (let i = 1; i < dataPoints.length; i++) {
    ctx.lineTo(dataPoints[i].x, dataPoints[i].y)
  }
  ctx.closePath()
  ctx.setFillStyle('rgba(59,130,246,0.15)')
  ctx.fill()

  // Stroke
  ctx.beginPath()
  ctx.moveTo(dataPoints[0].x, dataPoints[0].y)
  for (let i = 1; i < dataPoints.length; i++) {
    ctx.lineTo(dataPoints[i].x, dataPoints[i].y)
  }
  ctx.closePath()
  ctx.setStrokeStyle('#3b82f6')
  ctx.setLineWidth(2)
  ctx.stroke()

  // Score dots with DISC colors
  AXES.forEach(({ type }, i) => {
    const p = dataPoints[i]
    ctx.beginPath()
    ctx.arc(p.x, p.y, 5, 0, 2 * Math.PI)
    ctx.setFillStyle(DISC_COLORS[type])
    ctx.fill()
  })

  ctx.draw()
}

export function RadarCanvas({ scores, size = 260, canvasId = 'radar-canvas' }: RadarCanvasProps) {
  const animFrameRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const DURATION = 800

  useEffect(() => {
    const ctx = Taro.createCanvasContext(canvasId)
    startTimeRef.current = Date.now()

    function animate() {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / DURATION, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      drawRadar(ctx, scores, eased)

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate)
      }
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [scores, canvasId])

  return (
    <View style={{ width: `${size}px`, height: `${size}px`, position: 'relative' }}>
      <Canvas
        canvasId={canvasId}
        id={canvasId}
        style={{ width: `${size}px`, height: `${size}px` }}
        type="2d"
      />
    </View>
  )
}
