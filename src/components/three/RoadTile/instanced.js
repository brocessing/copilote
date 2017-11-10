/* global THREE */
import store from 'utils/store'

export default function getInstances () {

  var src = new THREE.BufferGeometry().fromGeometry(
    new THREE.PlaneGeometry(1, 1, 1, 1)
  )

  // instances geometry
  var geometry = new THREE.InstancedBufferGeometry()
  geometry.addAttribute(
    'position',
    new THREE.BufferAttribute(src.getAttribute('position').array, 3)
  )
  geometry.addAttribute(
    'uv',
    new THREE.BufferAttribute(src.getAttribute('uv').array, 2)
  )

  var size = { x: 1, y: 1 }
  var width = 11*3
  var height = 11*3
  var count = width * height
  var offsets = new Float32Array(count * 3)
  var uvOffset = new Float32Array(count * 2)
  var uvScales = new Float32Array(count * 2)

  // iterators
  var offsetIterator = 0
  var uvOffsetIterator = 0
  var uvScalesIterator = 0

  var center = new THREE.Vector2(5.5, 5.5)

  var uvScale = new THREE.Vector2(1 / width, 1 / height)

  for (var i = 0; i < width; i++) {
    for (var j = 0; j < height; j++) {
      offsets[offsetIterator++] = i * size.x * 1.1 - center.x
      offsets[offsetIterator++] = j * size.y * 1.1 - center.y
      offsets[offsetIterator++] = 0

      uvOffset[uvOffsetIterator++] = i * uvScale.x
      uvOffset[uvOffsetIterator++] = j * uvScale.y

      uvScales[uvScalesIterator++] = uvScale.x
      uvScales[uvScalesIterator++] = uvScale.y
    }
  }

  // add buffers
  geometry.addAttribute(
    'offset',
    new THREE.InstancedBufferAttribute(offsets, 3, 1)
  )
  geometry.addAttribute(
    'uvOffset',
    new THREE.InstancedBufferAttribute(uvOffset, 2, 1)
  )
  geometry.addAttribute(
    'uvScale',
    new THREE.InstancedBufferAttribute(uvScales, 2, 1)
  )

  // material
  var material = store.get('mat.road.instanced')
  var mesh = new THREE.Mesh(geometry, material)
  mesh.rotation.x = -Math.PI / 2
  mesh.frustumCulled = false
  return mesh
}
