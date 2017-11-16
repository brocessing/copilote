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
    this.contactMaterials = []
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

  bindFuncs (funcs) {
    funcs.forEach(func => { this[func] = this[func].bind(this) })
  }

  setup () {}
  update (dt) { this.components.forEach(component => component.update(dt)) }
  resize (size) { this.components.forEach(component => component.resize(size)) }

  destroy () {
    this.components.forEach(component => component.destroy())
    for (let k in this.meshes) {
      this.meshes[k].parent.remove(this.meshes[k])
    }
    for (let i = this.group.children.length - 1; i >= 0; i--) {
      this.group.remove(this.group.children[i])
    }
    for (let k in this.materials) {
      this.materials[k].dispose()
      delete this.materials[k]
    }
    for (let k in this.geometries) {
      this.geometries[k].dispose()
      delete this.geometries[k]
    }

    if (this.group.parent) this.group.parent.remove(this.group)

    this.group = undefined
    this.components = []
    this.meshes = {}
    this.geometries = {}
    this.materials = {}

    if (this.body) this.world.removeBody(this.body)
    if (this.vehicle) this.vehicle.removeFromWorld()
    this.contactMaterials.forEach(mat => this.world.removeContactMaterial(mat))
    this.contactMaterials = []

    this.shape = undefined
    this.body = undefined
    this.vehicle = undefined
    this.scene = undefined
    this.world = undefined
  }
}
