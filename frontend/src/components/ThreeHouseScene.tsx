import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { RotateCw, Sparkles, Layers } from 'lucide-react'

export const ThreeHouseScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRotating, setIsRotating] = useState(true)
  const isRotatingRef = useRef(true)

  // Keep ref synced
  useEffect(() => {
    isRotatingRef.current = isRotating
  }, [isRotating])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    // Soft fog for atmospheric depth
    scene.fog = new THREE.FogExp2(0x0b1329, 0.045)

    const width = container.clientWidth || 500
    const height = container.clientHeight || 420

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100)
    camera.position.set(6.5, 4.2, 7.5)

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    container.appendChild(renderer.domElement)

    // Main House & World Group
    const worldGroup = new THREE.Group()
    scene.add(worldGroup)

    // 1. Foundation Podium (Modernist Elevated Concrete Slab)
    const baseGeo = new THREE.BoxGeometry(4.4, 0.22, 3.6)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.3,
      roughness: 0.7,
    })
    const baseMesh = new THREE.Mesh(baseGeo, baseMat)
    baseMesh.position.y = -0.11
    baseMesh.receiveShadow = true
    worldGroup.add(baseMesh)

    // Glow outline around podium
    const baseEdgeGeo = new THREE.EdgesGeometry(baseGeo)
    const baseEdgeMat = new THREE.LineBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.75,
    })
    const baseWire = new THREE.LineSegments(baseEdgeGeo, baseEdgeMat)
    baseWire.position.copy(baseMesh.position)
    worldGroup.add(baseWire)

    // 2. Ground Floor Living Pavilion (Glass & Architectural concrete)
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.42,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.6,
      ior: 1.5,
    })

    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.5,
      metalness: 0.2,
    })

    const woodMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.8,
      metalness: 0.1,
    })

    // Glass main room
    const glassGeo = new THREE.BoxGeometry(2.6, 1.4, 2.2)
    const glassRoom = new THREE.Mesh(glassGeo, glassMat)
    glassRoom.position.set(-0.5, 0.7, 0)
    glassRoom.castShadow = true
    worldGroup.add(glassRoom)

    // Interior Warm Core (Living Room Core)
    const coreGeo = new THREE.BoxGeometry(1.0, 1.35, 1.1)
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    })
    const coreRoom = new THREE.Mesh(coreGeo, coreMat)
    coreRoom.position.set(-0.8, 0.68, 0)
    worldGroup.add(coreRoom)

    // Concrete Master Wing (Opaque Modern Volume)
    const wingGeo = new THREE.BoxGeometry(1.6, 1.8, 2.8)
    const wingRoom = new THREE.Mesh(wingGeo, wallMat)
    wingRoom.position.set(1.1, 0.9, -0.1)
    wingRoom.castShadow = true
    wingRoom.receiveShadow = true
    worldGroup.add(wingRoom)

    // Upper Overhanging Cantilever Terrace (2nd Floor)
    const upperGeo = new THREE.BoxGeometry(2.4, 1.2, 1.8)
    const upperRoom = new THREE.Mesh(upperGeo, glassMat)
    upperRoom.position.set(-0.2, 1.9, 0.3)
    upperRoom.castShadow = true
    worldGroup.add(upperRoom)

    // Roof Slabs (Signature California Mid-century overhang)
    const roof1Geo = new THREE.BoxGeometry(2.9, 0.1, 2.6)
    const roof1 = new THREE.Mesh(roof1Geo, woodMat)
    roof1.position.set(-0.2, 2.55, 0.3)
    roof1.castShadow = true
    worldGroup.add(roof1)

    const roof2Geo = new THREE.BoxGeometry(1.9, 0.1, 3.1)
    const roof2 = new THREE.Mesh(roof2Geo, woodMat)
    roof2.position.set(1.1, 1.85, -0.1)
    roof2.castShadow = true
    worldGroup.add(roof2)

    // Slender Architectural Pillars
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 })
    const pillarPositions = [
      [-1.6, 0.7, 1.0],
      [-1.6, 0.7, -1.0],
      [0.6, 0.7, 1.0],
    ]
    pillarPositions.forEach(([px, py, pz]) => {
      const pGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12)
      const pillar = new THREE.Mesh(pGeo, pillarMat)
      pillar.position.set(px, py, pz)
      pillar.castShadow = true
      worldGroup.add(pillar)
    })

    // 3. Reflective Pool / Garden Water Feature
    const poolGeo = new THREE.BoxGeometry(1.6, 0.08, 1.2)
    const poolMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.1,
      metalness: 0.9,
    })
    const pool = new THREE.Mesh(poolGeo, poolMat)
    pool.position.set(-1.1, 0.02, 1.4)
    worldGroup.add(pool)

    // 4. Stylized Low-Poly Cypress/Pine Trees
    const createTree = (x: number, z: number, scale = 1) => {
      const treeGroup = new THREE.Group()
      const trunkGeo = new THREE.CylinderGeometry(0.06 * scale, 0.08 * scale, 0.6 * scale, 8)
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350f })
      const trunk = new THREE.Mesh(trunkGeo, trunkMat)
      trunk.position.y = 0.3 * scale
      treeGroup.add(trunk)

      const coneGeo = new THREE.ConeGeometry(0.45 * scale, 1.4 * scale, 7)
      const coneMat = new THREE.MeshStandardMaterial({
        color: 0x059669,
        roughness: 0.7,
        flatShading: true,
      })
      const cone = new THREE.Mesh(coneGeo, coneMat)
      cone.position.y = (0.6 + 0.6) * scale
      cone.castShadow = true
      treeGroup.add(cone)

      treeGroup.position.set(x, 0, z)
      return treeGroup
    }

    worldGroup.add(createTree(2.4, 1.4, 0.9))
    worldGroup.add(createTree(2.6, -1.3, 1.1))
    worldGroup.add(createTree(-2.3, -1.2, 0.8))

    // 5. Holographic Geospatial Data Rings (California Census Block Concept)
    const ringGeo = new THREE.RingGeometry(3.6, 3.65, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
    })
    const ringMesh = new THREE.Mesh(ringGeo, ringMat)
    ringMesh.rotation.x = Math.PI / 2
    ringMesh.position.y = -0.05
    worldGroup.add(ringMesh)

    const ringOuterGeo = new THREE.RingGeometry(4.8, 4.84, 64)
    const ringOuterMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.3,
    })
    const ringOuter = new THREE.Mesh(ringOuterGeo, ringOuterMat)
    ringOuter.rotation.x = Math.PI / 2
    ringOuter.position.y = -0.08
    worldGroup.add(ringOuter)

    // Data Pins (Floating Census Coordinates)
    const pinGroup = new THREE.Group()
    const pinGeo = new THREE.ConeGeometry(0.12, 0.4, 8)
    const pinMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      emissive: 0xe11d48,
      emissiveIntensity: 0.6,
    })

    const pinCoords = [
      [-1.8, 1.8, 1.5],
      [2.2, 2.0, -1.8],
      [1.5, 2.4, 1.8],
      [-2.1, 1.6, -1.6],
    ]

    pinCoords.forEach(([px, py, pz]) => {
      const pin = new THREE.Mesh(pinGeo, pinMat)
      pin.position.set(px, py, pz)
      pin.rotation.x = Math.PI
      pinGroup.add(pin)
    })
    worldGroup.add(pinGroup)

    // 6. Floating Census Coordinate Particle Cloud
    const particleCount = 140
    const particleGeo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 14
      positions[i + 1] = Math.random() * 6 - 0.5
      positions[i + 2] = (Math.random() - 0.5) * 14
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const particleMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.08,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    })
    const particles = new THREE.Points(particleGeo, particleMat)
    worldGroup.add(particles)

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 1.2)
    scene.add(ambientLight)

    // Warm Sun Light
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.4)
    sunLight.position.set(10, 14, 8)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    scene.add(sunLight)

    // Neon Accent Point Light (Emerald Glow)
    const emeraldPoint = new THREE.PointLight(0x10b981, 2.5, 8)
    emeraldPoint.position.set(-1, 1.2, 0)
    worldGroup.add(emeraldPoint)

    // Cyber Cyan Rim Light
    const cyanPoint = new THREE.PointLight(0x06b6d4, 1.8, 10)
    cyanPoint.position.set(2, 3, 2)
    worldGroup.add(cyanPoint)

    // Controls & Mouse Parallax
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      worldGroup.rotation.y += deltaX * 0.007
      worldGroup.rotation.x += deltaY * 0.004
      // Clamp x rotation to avoid flipping upside down
      worldGroup.rotation.x = Math.max(-0.5, Math.min(0.6, worldGroup.rotation.x))

      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const domElement = renderer.domElement
    domElement.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    // Resize handling
    const handleResize = () => {
      if (!container) return
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      camera.aspect = newWidth / newHeight
      camera.updateProjectionMatrix()
      renderer.setSize(newWidth, newHeight)
    }

    window.addEventListener('resize', handleResize)

    // Animation Loop
    let clock = new THREE.Clock()
    let animationFrameId: number

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Auto rotation when enabled and not dragging
      if (isRotatingRef.current && !isDragging) {
        worldGroup.rotation.y += 0.004
      }

      // Gentle floating bob
      worldGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.12

      // Pin hovering oscillation
      pinGroup.position.y = Math.sin(elapsedTime * 2.5) * 0.08

      // Rotate rings at different speeds
      ringMesh.rotation.z = elapsedTime * 0.08
      ringOuter.rotation.z = -elapsedTime * 0.05

      // Particle floating drift
      particles.rotation.y = elapsedTime * 0.03

      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      domElement.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      if (container.contains(domElement)) {
        container.removeChild(domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="three-scene-wrapper">
      {/* 3D Canvas Container */}
      <div
        ref={containerRef}
        className="three-canvas-container"
        style={{ cursor: 'grab' }}
        title="Interactive 3D Architectural Model - Click & drag to rotate"
      />

      {/* Floating Interactive Controls Overlay */}
      <div className="three-scene-controls">
        <button
          type="button"
          onClick={() => setIsRotating((prev) => !prev)}
          className={`three-control-btn ${isRotating ? 'active' : ''}`}
          title={isRotating ? 'Pause rotation' : 'Resume auto rotation'}
          aria-label={isRotating ? 'Pause 3D auto rotation' : 'Resume 3D auto rotation'}
        >
          <RotateCw size={14} className={isRotating ? 'spin-icon' : ''} />
          <span>{isRotating ? 'Orbiting' : 'Paused'}</span>
        </button>

        <div className="three-badge">
          <Sparkles size={12} className="text-emerald" />
          <span>3D Spatial Model</span>
        </div>
      </div>

      <div className="three-drag-hint">
        <Layers size={12} />
        <span>Drag to rotate • Real-time WebGL</span>
      </div>
    </div>
  )
}
