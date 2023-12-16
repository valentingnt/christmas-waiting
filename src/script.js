import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

THREE.ColorManagement.enabled = false
// const gui = new GUI()

/**
 * HTML handling
 */
function hideLoadingModal() {
  const loadingModal = document.getElementById('loading-modal')

  loadingModal.style.display = 'none'
}

// Motion handling
const IS_IOS_SAFARI = typeof DeviceOrientationEvent.requestPermission === 'function'

function handleMobileOrientation(event) {
  const x = -event.gamma
  const y = event.beta

  cursor.x = (x / 60) * 2
  cursor.y = (y / 60) * 2
}

// Gift modal button
const modalButton = document.getElementById('gift-btn')
const modal = document.getElementById('modal')

modalButton.addEventListener('click', dismissModal)

function dismissModal() {
  modal.style.display = 'none'

  if (IS_IOS_SAFARI) {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') window.addEventListener('deviceorientation', handleMobileOrientation, true)
      })
      .catch(console.error);
  } else window.addEventListener('deviceorientation', handleMobileOrientation, true)
}

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

const wrappedGiftTexture = textureLoader.load('./textures/wrapped_gift_paper.jpeg')
wrappedGiftTexture.wrapS = THREE.RepeatWrapping
wrappedGiftTexture.wrapT = THREE.RepeatWrapping
wrappedGiftTexture.repeat.x = 5
wrappedGiftTexture.repeat.y = 5

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, .2)

scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, .8)
pointLight.position.set(-5, 4.5, 6.5)
pointLight.castShadow = true
pointLight.shadow.camera.near = 0.1
pointLight.shadow.camera.far = 25
pointLight.shadow.camera.fov = 50
pointLight.shadow.bias = 0.001
pointLight.shadow.mapSize.set(2048, 2048)

scene.add(pointLight)

/**
 * Models & objects
 */
const gltfLoader = new GLTFLoader()

// Christmas bell
gltfLoader.load(
  '/models/bell/scene.gltf',
  (gltf) => {
    for (let i = 0; i < 200; i++) {
      const clone = gltf.scene.clone()

      clone.name = 'bell'

      clone.position.x = (Math.random() - .5) * 30
      clone.position.y = (Math.random() - .5) * 30
      clone.position.z = (Math.random() - .5) * 30

      clone.rotation.x = Math.random() * Math.PI
      clone.rotation.y = Math.random() * Math.PI

      const scale = Math.random() * 8
      clone.scale.set(scale, scale, scale)

      clone.traverse((child) => {
        child.castShadow = true
      })

      scene.add(clone)
    }
  },
)

// Christmas ball
gltfLoader.load(
  '/models/new-ball/new-ball.gltf',
  (gltf) => {
    for (let i = 0; i < 200; i++) {
      const clone = gltf.scene.children[0].children[0].clone()

      clone.name = 'ball'

      clone.position.x = (Math.random() - .5) * 30
      clone.position.y = (Math.random() - .5) * 30
      clone.position.z = (Math.random() - .5) * 30

      clone.rotation.x = Math.random() * Math.PI
      clone.rotation.y = Math.random() * Math.PI

      const scale = Math.random() * .3
      clone.scale.set(scale, scale, scale)

      clone.traverse((child) => {
        child.castShadow = true
      })

      scene.add(clone)

      if (i === 199) hideLoadingModal()
    }
  },
)

// Christmas stocking
gltfLoader.load(
  '/models/stocking/scene.gltf',
  (gltf) => {
    for (let i = 0; i < 200; i++) {
      const clone = gltf.scene.children[0].clone()

      clone.name = 'stocking'

      clone.position.x = (Math.random() - .5) * 30
      clone.position.y = (Math.random() - .5) * 30
      clone.position.z = (Math.random() - .5) * 30

      clone.rotation.x = Math.random() * Math.PI
      clone.rotation.y = Math.random() * Math.PI

      const scale = Math.random() * .002
      clone.scale.set(scale, scale, scale)

      clone.traverse((child) => {
        child.castShadow = true
      })

      scene.add(clone)
    }
  },
)

// Walls
const wallRight = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({
    color: '#c8c6bf',
    map: wrappedGiftTexture,
    metalness: 0,
    roughness: .8
  })
)
wallRight.position.set(10, 0, -10)
wallRight.rotation.y = Math.PI * 1.5
wallRight.receiveShadow = true

const wallLeft = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: '#c8c6bf',
    map: wrappedGiftTexture,
    metalness: 0,
    roughness: .8
  })
)
wallLeft.position.set(-10, 0, -10)
wallLeft.rotation.y = Math.PI * .5
wallLeft.receiveShadow = true

const roof = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: '#c8c6bf',
    map: wrappedGiftTexture,
    metalness: 0,
    roughness: .8
  })
)
roof.position.set(0, 5, -5)
roof.rotation.x = Math.PI * .5
roof.receiveShadow = true

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: '#c8c6bf',
    map: wrappedGiftTexture,
    metalness: 0,
    roughness: .8
  })
)
floor.position.set(0, -5, -5)
floor.rotation.x = Math.PI * -.5
floor.receiveShadow = true

const backgroundWall = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30),
  new THREE.MeshStandardMaterial({
    color: '#c8c6bf',
    map: wrappedGiftTexture,
    metalness: 0,
    roughness: .8
  })
)
backgroundWall.position.set(0, 0, -3)
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
    '/fonts/christmas.json'
  ).then((font) => {
    const textGeometry = new TextGeometry(
      `Ho Ho Ho !\nSois patient...`,
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

    const textMaterial = new THREE.MeshStandardMaterial({ color: '#1d6b3f' })
    fontObject = new THREE.Mesh(textGeometry, textMaterial)

    scene.add(fontObject)
  })
}

loadFont((sizes.width / sizes.height) * 1.4)

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

window.addEventListener('mousemove', (event) => {
  cursor.x = (event.clientX / sizes.width - 0.5) * 2
  cursor.y = (- (event.clientY / sizes.height - 0.5)) * 2
}, { passive: true })

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
})

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.outputColorSpace = THREE.LinearSRGBColorSpace

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

  // Rotate the blocks and only the blocks
  scene.children.forEach((child) => {
    if (child.name === 'bell' || child.name === 'ball' || child.name === 'stocking') {
      child.rotation.y = elapsedTime * .5
    }
  })

  // Move the camera z position
  camera.position.z = (Math.sin(elapsedTime * .1)) + 6

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()