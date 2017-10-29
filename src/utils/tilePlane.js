/* global THREE */

export default function tilePlane ({ x, y, tileSize, texSize }) {
  const minX = x / texSize
  const minY = y / texSize
  const maxX = (x + tileSize) / texSize
  const maxY = (y + tileSize) / texSize

  const vertices = new Float32Array([
    -0.5, 0, -0.5,
    0.5, 0, -0.5,
    0.5, 0, 0.5,
    -0.5, 0, 0.5
  ])

  const indices = new Uint32Array([
    0, 2, 1, 0, 3, 2
  ])

  const uvs = new Float32Array([
    minX, minY,
    maxX, minY,
    maxX, maxY,
    minX, maxY
  ])

  const geometry = new THREE.BufferGeometry()
  geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3))
  geometry.addAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))

  return geometry
}
