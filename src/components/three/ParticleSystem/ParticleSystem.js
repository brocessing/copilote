import Particle from 'components/three/Particle/Particle'

export default class ParticleSystem {
  constructor (opts = {}) {
    this.onParticleBirth = this.onParticleBirth.bind(this)
    this.onParticleDeath = this.onParticleDeath.bind(this)

    this.count = opts.count || 100

    this.deadParticles = []
    this.aliveParticles = []
    this.life = 0

    for (let i = 0; i < this.count; i++) {
      new Particle({ // eslint-disable-line
        onBirth: this.onParticleBirth,
        onDeath: this.onParticleDeath
      })
    }
  }

  emit ({ count, position, rotation, color, parent, life }) {
    const particles = this.allocateParticles(count)
    particles.forEach(particle => particle.reset({ parent, position, rotation, life, color }))
  }

  update (dt) {
    this.life += dt
    this.aliveParticles.forEach(particle => particle.update(dt))
  }

  onParticleBirth (particle) {
    const deadIndex = this.deadParticles.indexOf(particle)
    if (~deadIndex) this.deadParticles.splice(deadIndex, 1)
    const aliveIndex = this.aliveParticles.indexOf(particle)
    if (!~aliveIndex) this.aliveParticles.push(particle)
  }

  onParticleDeath (particle) {
    const aliveIndex = this.aliveParticles.indexOf(particle)
    if (~aliveIndex) this.aliveParticles.splice(aliveIndex, 1)
    const deadIndex = this.deadParticles.indexOf(particle)
    if (!~deadIndex) this.deadParticles.push(particle)
  }

  killAll () {
    this.aliveParticles.forEach(particle => particle.die())
  }

  allocateParticles (needed = 5) {
    // console.log(this.deadParticles)
    const dead = this.deadParticles.length
    const alive = this.aliveParticles.length
    const total = dead + alive

    let particles = []

    if (needed > total) needed = total
    const deadNeeded = Math.min(needed, dead)
    const aliveNeeded = needed - deadNeeded

    particles = particles.concat(this.deadParticles.splice(0, deadNeeded))
    if (aliveNeeded) particles = particles.concat(this.aliveParticles.splice(0, aliveNeeded))
    console.log(this.aliveParticles.length, aliveNeeded, particles.length)
    return particles
  }
}
