/* global dat */

let gui

function init () {
  console.log(window.dat)
  gui = new dat.GUI()
  gui.close()
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
