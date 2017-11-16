/* global dat */

import config from 'config'

let gui

function init () {
  console.log(window.dat)
  gui = new dat.GUI()
  gui.close()
  console.log(gui.domElement)
  gui.domElement.parentNode.style.zIndex = '1000'
  if (!config.datgui) gui.domElement.parentNode.parentNode.removeChild(gui.domElement.parentNode)
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
