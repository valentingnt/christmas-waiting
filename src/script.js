import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

THREE.ColorManagement.enabled = false

// HTML handling
const loadingModal = document.getElementById('loading-modal')
const hideLoadingModal = () => loadingModal.style.display = 'none'

// Motion handling
const IS_IOS_SAFARI = typeof DeviceOrientationEvent.requestPermission === 'function'
const handleMobileOrientation = (event) => {
  const x = -event.gamma
  const y = event.beta

  cursor.x = (x / 60) * 2
  cursor.y = (y / 60) * 2
}

// Gift modal button
const modalButton = document.getElementById('gift-btn')
const modal = document.getElementById('modal')

const dismissModal = () => {
  modal.style.display = 'none'

  if (IS_IOS_SAFARI) {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') window.addEventListener('deviceorientation', handleMobileOrientation, true)
      })
      .catch(console.error);
  } else window.addEventListener('deviceorientation', handleMobileOrientation, true)
}

modalButton.addEventListener('click', dismissModal)

// Base
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

// Textures
const textureLoader = new THREE.TextureLoader()
const wrappedGiftTexture = textureLoader.load('./textures/wrapped_gift_paper.jpeg')
wrappedGiftTexture.wrapS = THREE.RepeatWrapping
wrappedGiftTexture.wrapT = THREE.RepeatWrapping
wrappedGiftTexture.repeat.x = 5
wrappedGiftTexture.repeat.y = 5

// Lights
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

// Models & objects
const gltfLoader = new GLTFLoader()

// Function to load and manipulate models
function loadAndManipulateModel(path, name, scaleModifier, hideModal = false) {
  gltfLoader.load(path, (gltf) => {
    for (let i = 0; i < 200; i++) {
      const clone = gltf.scene.clone()
      clone.name = name

      clone.position.x = (Math.random() - .5) * 30
      clone.position.y = (Math.random() - .5) * 30
      clone.position.z = (Math.random() - .5) * 30

      clone.rotation.x = Math.random() * Math.PI
      clone.rotation.y = Math.random() * Math.PI

      const scale = Math.random() * scaleModifier
      clone.scale.set(scale, scale, scale)

      clone.traverse((child) => {
        child.castShadow = true
      })

      scene.add(clone)
    }

    if (hideModal) hideLoadingModal()
  })
}

loadAndManipulateModel('/models/bell/scene.gltf', 'bell', 8)
loadAndManipulateModel('/models/new-ball/new-ball.gltf', 'ball', .3)
loadAndManipulateModel('/models/stocking/scene.gltf', 'stocking', .002, true)

// Function to create walls
function createWall(position, rotation, receiveShadow = true) {
  const wall = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({
      color: '#c8c6bf',
      map: wrappedGiftTexture,
      metalness: 0,
      roughness: .8
    })
  )
  wall.position.set(...position)
  wall.rotation.set(...rotation)
  wall.receiveShadow = receiveShadow
  return wall
}

scene.add(
  createWall([10, 0, -10], [0, Math.PI * 1.5, 0]),
  createWall([-10, 0, -10], [0, Math.PI * .5, 0]),
  createWall([0, 5, -5], [Math.PI * .5, 0, 0]),
  createWall([0, -5, -5], [Math.PI * -.5, 0, 0]),
  createWall([0, 0, -3], [0, 0, 0])
)

// Sizes
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

// Fonts
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

function handleResize() {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

window.addEventListener('resize', handleResize)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 0, 10)

const cursor = {
  x: 0,
  y: 0
}

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

function rotateBlocks(elapsedTime) {
  scene.children.forEach((child) => {
    if (child.name === 'bell' || child.name === 'ball' || child.name === 'stocking') {
      child.rotation.y = elapsedTime * .5
    }
  })
}

function tick() {
  const elapsedTime = clock.getElapsedTime()

  // Update camera
  camera.position.x = (cursor.x * .8) + 1
  camera.position.y = (cursor.y * .8) + 1
  camera.lookAt(0, 0, 0)

  rotateBlocks(elapsedTime)

  // Move the camera z position
  camera.position.z = (Math.sin(elapsedTime * .1)) + 6

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()