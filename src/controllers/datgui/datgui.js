/* global dat */

let gui

function init () {
  gui = new dat.GUI()
  console.log(gui.domElement)
  gui.domElement.parentNode.style.zIndex = '1000'
}

function add (obj, key) {
  if (!gui) init()
  return gui.add(obj, key)
}

function addColor (obj, key) {
  if (!gui) init()
  return gui.addColor(obj, key)
}

function folder (name) {
  if (!gui) init()
  return gui.addFolder(name)
}

export default {
  add,
  addColor,
  folder
}
