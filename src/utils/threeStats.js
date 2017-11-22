export default function threeStats (renderer) {
  const refreshRate = 30

  const $texts = []
  const nLines = 9

  const $container = document.createElement('div')
  $container.style.zIndex = '10000'
  $container.style.position = 'fixed'
  $container.style.top = '48px'
  $container.style.left = '0'
  $container.style.width = '70px'
  $container.style.padding = '5px'
  $container.style.background = '#0a102d'
  $container.style.color = '#7dfaf1'
  $container.style.fontFamily = 'Arial, sans-serif'
  $container.style.fontSize = '8px'

  for (let i = 0; i < nLines; i++) {
    $texts[i] = document.createElement('p')
    $texts[i].style.padding = '1px 0'
    $texts[i].style.margin = '0'
    $texts[i].style.lineHeight = '9px'
    if (i === 0 || i === 4) {
      $texts[i].style.background = '#091e37'
      $texts[i].style.padding = '3px 0'
      if (i === 4) $texts[i].style.margin = '10px 0 0px 0'
    }
    $container.appendChild($texts[i])
    $texts[i].innerHTML = '-'
  }

  document.body.appendChild($container)

  let lastTime = Date.now()
  return {
    update: function () {
      // refresh only 30time per second
      if (Date.now() - lastTime < 1000 / refreshRate) return
      lastTime = Date.now()

      let i = 0
      $texts[i++].textContent = 'Memory'
      $texts[i++].textContent = 'Programs: ' + renderer.info.programs.length
      $texts[i++].textContent = 'Geometries: ' + renderer.info.memory.geometries
      $texts[i++].textContent = 'Textures: ' + renderer.info.memory.textures

      $texts[i++].textContent = 'Render'
      $texts[i++].textContent = 'Calls: ' + renderer.info.render.calls
      $texts[i++].textContent = 'Vertices: ' + renderer.info.render.vertices
      $texts[i++].textContent = 'Faces: ' + renderer.info.render.faces
      $texts[i++].textContent = 'Points: ' + renderer.info.render.points
    }
  }
}
