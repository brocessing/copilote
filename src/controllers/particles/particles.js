/* global THREE */

import three from 'controllers/three/three'
import store from 'utils/store'
import prng from 'utils/prng'
import smoke from 'shaders/smoke/smoke'

const BLAST_GRAVITY = 0.1

let material, geometry
let aPosition, aLife, aVelocity, aBornData, aScale
let particles
let dead = []
let alive = []
let amount = 800
let hd = false
// bornData = 0: type / 1: speed / 2: baseRotation (seed ?)

function setup () {
  hd = !!(store.get('quality') === 'HD')
  amount = store.get('quality') === 'HD' ? 800 : 350
  material = smoke.getMaterial()
  aVelocity = new Float32Array(amount * 3)
  aPosition = new Float32Array(amount * 3)
  aBornData = new Float32Array(amount * 3)
  aScale = new Float32Array(amount)
  aLife = new Float32Array(amount)

  geometry = new THREE.BufferGeometry()
  geometry.addAttribute('scale', new THREE.BufferAttribute(aScale, 1))
  geometry.addAttribute('bornData', new THREE.BufferAttribute(aBornData, 3))

  let attr = new THREE.BufferAttribute(aPosition, 3); attr.setDynamic(true)
  geometry.addAttribute('position', attr)
  attr = new THREE.BufferAttribute(aLife, 1); attr.setDynamic(true)
  geometry.addAttribute('life', attr)

  particles = new THREE.Points(geometry, material)
  particles.frustumCulled = false

  for (var i = 0; i < amount; i++) killParticle(i)

  three.getScene().add(particles)
  setScale(1)
}

function emit ({ x, y, z, type, amount }) {
  let needed = hd ? amount : Math.ceil(amount / 2)
  let newParticles = []
  if (dead.length > 0) newParticles = dead.splice(0, needed)
  needed -= newParticles.length
  if (needed > 0) newParticles = newParticles.concat(alive.splice(0, needed))

  newParticles.forEach(i => initParticle(i, x, y, z, type))
}

function update (dt) {
  if (alive.length) {
    geometry.attributes.position.needsUpdate = true
    geometry.attributes.life.needsUpdate = true
  } else {
    return
  }

  for (var j = alive.length - 1; j >= 0; j--) {
    const i = alive[j]
    const type = aBornData[i * 3]
    const lifeSpeed = aBornData[i * 3 + 1]
    const life = aLife[i]
    if (type === 0 || type === 4) {
      // aVelocity[i * 3 + 0] *= 1.01
      // aVelocity[i * 3 + 1] -= BLAST_GRAVITY * 0.001
      // if (aPosition[i * 3 + 1] <= 0.01) aVelocity[i * 3 + 1] *= -0.8
      // aVelocity[i * 3 + 2] *= 1.01
      // aVelocity[i * 3 + 2] *= 0.9
      aPosition[i * 3 + 0] += aVelocity[i * 3 + 0] * (1 - life)
      aPosition[i * 3 + 1] += aVelocity[i * 3 + 1]
      aPosition[i * 3 + 2] += aVelocity[i * 3 + 2] * (1 - life)
    } else if (type === 1) {
      // aVelocity[i * 3 + 0] *= 1.01
      // aVelocity[i * 3 + 1] -= BLAST_GRAVITY * 0.001
      // if (aPosition[i * 3 + 1] <= 0.01) aVelocity[i * 3 + 1] *= -0.8
      // aVelocity[i * 3 + 2] *= 1.01
      // aVelocity[i * 3 + 2] *= 0.9
      aPosition[i * 3 + 0] += aVelocity[i * 3 + 0] * (1 - life)
      aPosition[i * 3 + 1] += aVelocity[i * 3 + 1]
      aPosition[i * 3 + 2] += aVelocity[i * 3 + 2] * (1 - life)
    } if (type === 2) {
      aVelocity[i * 3 + 0] *= 0.90
      aVelocity[i * 3 + 1] -= BLAST_GRAVITY * 0.001
      // if (aPosition[i * 3 + 1] <= 0.01) aVelocity[i * 3 + 1] *= -0.8
      aVelocity[i * 3 + 1] *= 0.98
      aVelocity[i * 3 + 2] *= 0.9
      aPosition[i * 3 + 0] += aVelocity[i * 3 + 0]
      aPosition[i * 3 + 1] += aVelocity[i * 3 + 1]
      aPosition[i * 3 + 2] += aVelocity[i * 3 + 2]
    } else if (type === 3) {
      aVelocity[i * 3 + 0] *= 0.96
      aVelocity[i * 3 + 1] -= BLAST_GRAVITY * 0.01
      if (aPosition[i * 3 + 1] <= 0.01) aVelocity[i * 3 + 1] *= -0.8
      aVelocity[i * 3 + 1] *= 0.98
      aVelocity[i * 3 + 2] *= 0.96
      aPosition[i * 3 + 0] += aVelocity[i * 3 + 0]
      aPosition[i * 3 + 1] += aVelocity[i * 3 + 1]
      aPosition[i * 3 + 2] += aVelocity[i * 3 + 2]
    }

    aLife[i] -= lifeSpeed
    if (aLife[i] <= 0) killParticle(i)
  }
}

function initParticle (i, x, y, z, type) {
  aLife[i] = 1
  aPosition[i * 3 + 0] = x
  aPosition[i * 3 + 1] = y
  aPosition[i * 3 + 2] = z
  aBornData[i * 3 + 0] = type

  if (type === 0) {
    aBornData[i * 3 + 1] = 0.01 + (prng.random() * 2 - 1) * 0.001
    aBornData[i * 3 + 2] = (prng.random(0, 1) * 2 - 1) * Math.PI
    const m = Math.floor(Math.abs(x) / 1)
    aVelocity[i * 3 + 0] = (prng.hash2d(m, m) * 2 - 1) * 0.009
    aVelocity[i * 3 + 1] = prng.random() * 0.001 + 0.001
    aVelocity[i * 3 + 2] = aVelocity[i * 3 + 0]
  } else if (type === 1) {
    aBornData[i * 3 + 1] = 0.02 + (prng.random() * 2 - 1) * 0.001
    aBornData[i * 3 + 2] = (prng.random(0, 1) * 2 - 1) * Math.PI
    const m = Math.floor(Math.abs(x) / 1000)
    aVelocity[i * 3 + 0] = (prng.hash2d(m, m) * 2 - 1) * 0.009
    aVelocity[i * 3 + 1] = prng.random() * 0.005 + 0.008
    aVelocity[i * 3 + 2] = aVelocity[i * 3 + 0]
  } else if (type === 2) {
    aBornData[i * 3 + 1] = 0.013 + (prng.random() * 2 - 1) * 0.005
    aBornData[i * 3 + 2] = (prng.random(0, 1) * 2 - 1) * Math.PI
    aVelocity[i * 3 + 0] = (prng.random(0, 1) * 2 - 1) * 0.04
    aVelocity[i * 3 + 1] = (prng.random(0, 1)) * 0.02
    aVelocity[i * 3 + 2] = (prng.random(0, 1) * 2 - 1) * 0.04
  } else if (type === 3) {
    aBornData[i * 3 + 1] = 0.01 + (prng.random() * 2 - 1) * 0.005
    aBornData[i * 3 + 2] = (prng.random(0, 1) * 2 - 1) * Math.PI
    aVelocity[i * 3 + 0] = (prng.random(0, 1) * 2 - 1) * 0.03
    aVelocity[i * 3 + 1] = (prng.random(0, 1)) * 0.01
    aVelocity[i * 3 + 2] = (prng.random(0, 1) * 2 - 1) * 0.03
  } else if (type === 4) {
    aBornData[i * 3 + 1] = 0.04 + (prng.random() * 2 - 1) * 0.001
    aBornData[i * 3 + 2] = (prng.random(0, 1) * 2 - 1) * Math.PI
    const m = Math.floor(Math.abs(x) / 1)
    aVelocity[i * 3 + 0] = 0
    aVelocity[i * 3 + 1] = prng.random() * 0.002 + 0.003
    aVelocity[i * 3 + 2] = 0
  }

  geometry.attributes.position.needsUpdate = true
  geometry.attributes.life.needsUpdate = true
  geometry.attributes.bornData.needsUpdate = true
  alive.push(i)
}

function killParticle (i) {
  aPosition[i * 3 + 0] = Math.random() * 1
  aPosition[i * 3 + 1] = Math.random() * 1
  aPosition[i * 3 + 2] = Math.random() * 1
  aVelocity[i * 3 + 0] = 0
  aVelocity[i * 3 + 1] = 0
  aVelocity[i * 3 + 2] = 0
  aLife[i] = 0
  const index = alive.indexOf(i)
  if (~index) alive.splice(index, 1)
  dead.push(i)
}

function setScale (val) {
  for (var i = 0; i < amount; i++) aScale[i] = val
  geometry.attributes.scale.needsUpdate = true
}

export default { setup, update, emit, setScale }
