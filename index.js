import { createFullDocumentCanvas } from './unnamed/createFullDocumentCanvas/createFullDocumentCanvas.js'

const { canvas, context } = createFullDocumentCanvas()
document.body.appendChild(canvas)

const animation = {
  states: [
    {
      name: 'pie',
      arguments: [
        25,
        25,
        24,
        degrees(30),
        degrees(-30)
      ],
      stroke: true,
      strokeStyle: 'black',
      fill: true,
      fillStyle: 'yellow'
    },
    {
      name: 'pie',
      arguments: [
        25,
        25,
        24,
        degrees(0),
        degrees(360)
      ],
      stroke: true,
      strokeStyle: 'black',
      fill: true,
      fillStyle: 'yellow'
    }
  ],
  duration: 1000
}

animate(canvas, context, animation)

async function animate(canvas, context, animation) {
  const { duration, states } = animation
  const durationPerState = duration / states.length
  let currentStateIndex = 0
  while (true) {
    const state = states[currentStateIndex]
    const { name, stroke, strokeStyle, fill, fillStyle } = state
    context.save()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.beginPath()
    if (name === 'pie') {
      const x = state.arguments[0]
      const y = state.arguments[1]
      context.moveTo(x, y)
      context.arc(...state.arguments)
      context.lineTo(x, y)
    } else {
      context[name](...state.arguments)
    }
    if (fill) {
      if (fillStyle) {
        context.fillStyle = fillStyle
      }
      context.fill()
    }
    if (stroke) {
      if (strokeStyle) {
        context.strokeStyle = strokeStyle
      }
      context.stroke()
    }
    context.restore()
    await wait(durationPerState)
    currentStateIndex = (currentStateIndex + 1) % states.length
  }
}

function degrees(value) {
  return (2 * Math.PI) * value / 360
}

async function wait(duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}
