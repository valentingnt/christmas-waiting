import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

THREE.ColorManagement.enabled = false
const gui = new GUI()

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTextTexture = textureLoader.load('./textures/matcaps/3.png')

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, .2)

scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, .8)
pointLight.position.set(-5, 4.5, 6.5)
pointLight.castShadow = true
pointLight.shadow.camera.top = 2
pointLight.shadow.camera.right = 2
pointLight.shadow.camera.bottom = - 2
pointLight.shadow.camera.left = - 2
pointLight.shadow.mapSize.set(1024, 1024)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 3)
scene.add(pointLightHelper)

scene.add(pointLight)

/**
 * Models & objects
 */
// Mario block
const gltfLoader = new GLTFLoader()

gltfLoader.load(
  '/models/mario_block/scene.gltf',
  (gltf) => {
    for (let i = 0; i < 300; i++) {
      const clone = gltf.scene.clone()

      clone.position.x = (Math.random() - .5) * 30
      clone.position.y = (Math.random() - .5) * 30
      clone.position.z = (Math.random() - .5) * 30

      clone.rotation.x = Math.random() * Math.PI
      clone.rotation.y = Math.random() * Math.PI

      const scale = Math.random() * .8
      clone.scale.set(scale, scale, scale)

      scene.add(clone)
    }
  },
)

// Walls
const wallRight = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ color: '#c8c6bf' })
)
wallRight.position.set(8, 0, -8)
wallRight.rotation.y = Math.PI * 1.5
wallRight.castShadow = true
wallRight.receiveShadow = true

const wallLeft = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: '#c8c6bf' })
)
wallLeft.position.set(-8, 0, -8)
wallLeft.rotation.y = Math.PI * .5
wallLeft.castShadow = true
wallLeft.receiveShadow = true

const roof = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: '#c8c6bf' })
)
roof.position.set(0, 8, -8)
roof.rotation.x = Math.PI * .5
roof.castShadow = true
roof.receiveShadow = true

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: '#c8c6bf' })
)
floor.position.set(0, -8, -8)
floor.rotation.x = Math.PI * -.5
floor.castShadow = true
floor.receiveShadow = true

const backgroundWall = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({ color: '#c8c6bf' })
)
backgroundWall.position.set(0, 0, -5)
backgroundWall.castShadow = true
backgroundWall.receiveShadow = true

scene.add(wallRight, wallLeft, roof, floor, backgroundWall)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

/**
 * Fonts
 */
const fontLoader = new FontLoader()
let fontObject = null

function loadFont(size) {
  fontLoader.loadAsync(
    '/fonts/helvetiker_regular.typeface.json',
    (xhr) => {
      console.log(`${(xhr.loaded / xhr.total * 100)}% loaded`)
    }
  ).then((font) => {
    const textGeometry = new TextGeometry(
      `HO HO HO !\nSois patient...`,
      {
        font,
        size,
        height: .2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: .03,
        bevelSize: .02,
        bevelOffset: 0,
        bevelSegments: 5
      }
    )

    textGeometry.center()

    const textMaterial = new THREE.MeshMatcapMaterial({ matcap: matcapTextTexture })
    fontObject = new THREE.Mesh(textGeometry, textMaterial)

    scene.add(fontObject)
  })
}

loadFont((sizes.width / sizes.height) * .7)

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 0, 10)

const cursor = {
  x: 0,
  y: 0
}

const button = document.getElementById('btn')
button.addEventListener('click', onClick)

function onClick() {
  console.log('click')
  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          window.addEventListener('deviceorientation', handleMobileOrientation, true)
        }
      })
      .catch(console.error);
  } else {
    window.addEventListener('deviceorientation', handleMobileOrientation, true)
  }
}

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5
  cursor.y = - (event.clientY / sizes.height - 0.5)
}, { passive: true })

window.addEventListener('touchmove', (event) => {
  cursor.x = event.touches[0].clientX / sizes.width - 0.5
  cursor.y = - (event.touches[0].clientY / sizes.height - 0.5)
}, { passive: true })

function handleMobileOrientation(event) {
  const x = event.beta
  const y = event.gamma

  cursor.x = x / 180
  cursor.y = y / 180
}


/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
})
renderer.outputColorSpace = THREE.LinearSRGBColorSpace
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update camera
  camera.position.x = (cursor.x * .8) + 1
  camera.position.y = (cursor.y * .8) + 1
  camera.lookAt(0, 0, 0)

  // animate camera.z from 10 to 5 only once. Make it ease in and out
  // camera.position.z = Math.sin(elapsedTime) * 2 + 8


  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()