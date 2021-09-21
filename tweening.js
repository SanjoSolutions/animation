import { createFullDocumentCanvas } from './unnamed/createFullDocumentCanvas/createFullDocumentCanvas.js'
import { render } from './unnamed/render.js'

const DURATION_OF_ONE_FRAME = 1000 / 60 // in milliseconds, with 60 frames per second.

export function main() {
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
          degrees(330)
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
}

async function animate(canvas, context, animation) {
  const { duration, states } = animation
  const durationPerState = duration / states.length
  let currentStateIndex = 0
  let state
  let beginningTimeOfState
  let stateArguments
  let args
  let argumentIndexesToTween
  let tweeningValues

  function startState() {
    state = states[currentStateIndex]
    beginningTimeOfState = Date.now()
    stateArguments = state.arguments
    args = Array.from(stateArguments)

    const nextStateIndex = determineNextStateIndex(currentStateIndex, states)
    if (nextStateIndex < states.length) {
      const nextState = states[nextStateIndex]
      const nextArguments = nextState.arguments
      argumentIndexesToTween = determineArgumentIndexesToTween(stateArguments, nextArguments)
      tweeningValues = determineTweeningValues(stateArguments, nextArguments, argumentIndexesToTween, durationPerState)
    } else {
      argumentIndexesToTween = []
    }
  }

  startState()

  async function onRender() {
    updateArguments(args, stateArguments, tweeningValues, argumentIndexesToTween, beginningTimeOfState, Date.now())
    const { name, stroke, strokeStyle, fill, fillStyle } = state
    context.save()
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.beginPath()
    if (name === 'pie') {
      const x = args[0]
      const y = args[1]
      context.moveTo(x, y)
      context.arc(...args)
      context.lineTo(x, y)
    } else {
      context[name](...args)
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
    await wait(DURATION_OF_ONE_FRAME)
    if (Date.now() - beginningTimeOfState >= durationPerState) {
      currentStateIndex = determineNextStateIndex(currentStateIndex, states)
      startState()
    }
  }

  render(onRender)
}

function determineNextStateIndex(currentStateIndex, states) {
  return (currentStateIndex + 1) % states.length
}

function updateArguments(args, stateArguments, tweeningValues, argumentIndexesToTween, beginningTimeOfState, time) {
  for (let index = 0; index < argumentIndexesToTween.length; index++) {
    args[argumentIndexesToTween[index]] = (
      stateArguments[argumentIndexesToTween[index]] +
      (((time - beginningTimeOfState) / 1000) * tweeningValues[index])
    )
  }
}

function determineArgumentIndexesToTween(argumentsA, argumentsB) {
  const argumentIndexesToTween = []
  const length = Math.min(argumentsA.length, argumentsB.length)
  for (let index = 0; index < length; index++) {
    if (isArgumentToTween(argumentsA[index], argumentsB[index])) {
      argumentIndexesToTween.push(index)
    }
  }
  return argumentIndexesToTween
}

function determineTweeningValues(argumentsA, argumentsB, argumentIndexesToTween, duration) {
  const tweeningValues = []
  for (const index of argumentIndexesToTween) {
    const tweeningValue = determineTweeningValue(
      argumentsA[index],
      argumentsB[index],
      duration
    )
    tweeningValues.push(tweeningValue)
  }
  return tweeningValues
}

function determineTweeningValue(argumentA, argumentB, duration) {
  return (argumentB - argumentA) * 1000 / duration
}

function isArgumentToTween(argumentA, argumentB) {
  return argumentA !== argumentB && typeof argumentA === 'number' && typeof argumentB === 'number'
}

function degrees(value) {
  return (2 * Math.PI) * value / 360
}

async function wait(duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}
