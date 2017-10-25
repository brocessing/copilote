/* global THREE */

const NOOP = function () {}
const GRAVITY = 0
const BOUNCYNESS = 0.8
const FRICTION = 0.98
const MATERIAL_TYPE = 'MeshBasicMaterial' // 'MeshLambertMaterial'

let commonInitialized
let PARTICLE_GEOMETRY
let MATERIALS_CACHE = new Map()

function commonInit () {
  PARTICLE_GEOMETRY = new THREE.SphereGeometry(0.8, 8, 8)
  PARTICLE_GEOMETRY.rotateX = Math.PI / 2
  commonInitialized = true
}

function getMaterial (color) {
  if (MATERIALS_CACHE.has(color)) return MATERIALS_CACHE.get(color)
  const mat = new THREE[MATERIAL_TYPE]({ color })
  MATERIALS_CACHE.set(color, mat)
  return mat
}

export default class Particle {
  constructor (opts) {
    if (!commonInitialized) commonInit()
    this.mesh = new THREE.Mesh(PARTICLE_GEOMETRY, getMaterial(0x000000))
    this.mesh.castShadow = true
    this.mesh.receiveShadow = true

    this.scale = this.mesh.scale
    this.position = this.mesh.position
    this.rotation = this.mesh.rotation
    this.velocity = new THREE.Vector3()

    this.parent = null
    this.dead = null
    this.life = 0
    this.onDeath = opts.onDeath || NOOP
    this.onBirth = opts.onBirth || NOOP
    this.die()
  }

  die () {
    if (this.dead === true) return
    this.dead = true
    this.visible = false
    this.scale.set(0.0000001, 0.0000001, 0.0000001)
    if (this.parent) {
      this.parent.remove(this.mesh)
      this.parent = null
    }
    this.onDeath(this)
  }

  born () {
    if (this.dead === false) return
    this.dead = false
    if (this.parent) {
      this.visible = true
      this.parent.add(this.mesh)
    }
    this.onBirth(this)
  }

  reset (opts) {
    this.parent = opts.parent
    this.rotation.copy(opts.rotation)
    this.position.copy(opts.position || new THREE.Vector3(1, 1, 1))
    this.position.z -= 0.1
    this.position.z -= 0.1
    this.velocity.copy(opts.velocity || new THREE.Vector3(
      (Math.random() * 2 - 1) * 0.1,
      (Math.random() * 2 - 1) * 0.1 + 0.4,
      (Math.random() * 2 - 1) * 0.1
    ))
    this.life = opts.life !== undefined
      ? (!opts.dead ? opts.life : 0)
      : 100

    const wasDead = this.dead
    const isNowDead = opts.dead || (this.life <= 0)

    this.mesh.material = getMaterial(opts.color)

    if (!wasDead && isNowDead) this.die()
    else if (wasDead && !isNowDead) this.born()
    else if (!wasDead && !isNowDead) { this.die(); this.born() }
  }

  update (dt) {
    if (this.dead) return

    this.life -= 1 * 0.8

    if (this.velocity.y < 0 && this.position.y <= 0) {
      this.velocity.y = Math.abs(this.velocity.y) * BOUNCYNESS
      this.velocity.x *= FRICTION * 0.4
      this.velocity.z *= FRICTION * 0.4
    }

    this.velocity.y -= GRAVITY
    this.velocity.x *= FRICTION
    this.velocity.z *= FRICTION

    const s = this.life * 0.01
    if (s > 0) {
      this.scale.set(s * 0.05, s * 0.01, Math.max(0.0001, Math.abs(this.velocity.y) * 0.2))
    }

    const newPos = new THREE.Vector3()
    newPos.x = this.position.x + (this.velocity.x)
    newPos.y = Math.max(0, this.position.y + this.velocity.y)
    newPos.z = this.position.z + (this.velocity.z)

    // this.mesh.lookAt(newPos)
    // this.mesh.rotateX(Math.PI / 2)
    // this.position.copy(newPos)

    if (this.life < 0) this.die()
  }
}
