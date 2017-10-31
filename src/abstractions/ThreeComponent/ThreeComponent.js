/* global THREE */
import three from 'controllers/three/three'

export default class ThreeComponent {
  constructor (...args) {
    this.scene = three.getScene()
    this.world = three.getWorld()
    this.meshes = {}
    this.geometries = {}
    this.materials = {}
    this.components = []
    this.group = new THREE.Group()
    this.setup(...args)
    if (this.body) this.world.addBody(this.body)
    if (this.vehicle) this.vehicle.addToWorld(this.world)
  }

  addComponent (component) {
    if (~this.components.indexOf(component) || !component.group) return
    this.group.add(component.group)
    this.components.push(component)
    return component
  }

  removeComponent (component) {
    const index = this.components.indexOf(component)
    if (!~index || !component.group) return
    this.group.remove(component.group)
    this.components.splice(index, 1)
    return null
  }

  setup () {}
  update (dt) { this.components.forEach(component => component.update(dt)) }
  resize (size) { this.components.forEach(component => component.resize(size)) }

  destroy () {
    this.components.forEach(component => component.destroy())
    for (let k in this.meshes) this.meshes[k].parent.remove(this.meshes[k])
    for (let k in this.materials) this.materials[k].dispose()
    for (let k in this.geometries) this.geometries[k].dispose()

    this.components = []
    this.meshes = {}
    this.geometries = {}
    this.materials = {}

    if (this.body) this.world.removeBody(this.body)
    if (this.vehicle) this.vehicle.removeFromWorld()
    this.shape = null
    this.body = null
    this.vehicle = null
    this.scene = null
    this.world = null
  }
}
