/* global THREE */
import three from 'controllers/three'

export default class ThreeComponent {
  constructor (...args) {
    this.scene = three.getScene()
    this.meshes = {}
    this.geometries = {}
    this.materials = {}
    this.components = []
    this.group = new THREE.Group()
    this.setup(...args)
  }

  addComponent (component) {
    if (~this.components.indexOf(component) || !component.group) return
    this.group.add(component.group)
    this.components.push(component)
  }

  removeComponent (component) {
    const index = this.components.indexOf(component)
    if (!~index || !component.group) return
    this.group.remove(component.group)
    this.components.splice(index, 1)
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
    this.scene = null
  }
}
