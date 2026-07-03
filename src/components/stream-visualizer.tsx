'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export function StreamVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // Custom GLSL Shaders to achieve native hardware processing and neon overlapping glow
    const vertexShader = `
      uniform float uTime;
      attribute float aSpeed;
      attribute float aOffset;
      attribute vec3 aRandoms;
      
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vec3 pos = position;

        // Infinite loop time progress calculation per curve stream
        float progress = fract(uTime * 0.08 * aSpeed + aOffset);
        
        // Track path elevation along Y-axis
        pos.y = mix(-20.0, 30.0, progress);

        // Replicate converging geometry toward a precise horizon scale focus point (0, 30, 0)
        float squeezeFactor = smoothstep(0.0, 0.9, progress);
        
        // Outer expansion radius spreads broadly at root origin basin
        float radius = mix(16.0, 0.05, squeezeFactor);
        pos.x += sin(aRandoms.x * 6.28) * radius;
        pos.z += cos(aRandoms.y * 6.28) * radius;

        // Infuse structural mathematical ribbons waves/turbulence dynamics
        pos.x += sin(pos.y * 0.15 + uTime * 1.2 + aRandoms.z) * mix(2.5, 0.0, squeezeFactor);
        pos.z += cos(pos.y * 0.12 + uTime * 1.0 + aRandoms.x) * mix(2.5, 0.0, squeezeFactor);

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Color calculation setup mapping values
        vColor = vec3(0.02, 0.45, 0.95); // Deep neon azure palette
        
        // Dynamic edge scaling opacity fade control limits loop pop artifacts
        float fadeIn = smoothstep(0.0, 0.2, progress);
        float fadeOut = smoothstep(1.0, 0.75, progress);
        vAlpha = fadeIn * fadeOut;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Generates glowing particle streams
        gl_FragColor = vec4(vColor, vAlpha * 0.45);
      }
    `;

    // Scene Pipeline Configuration
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020305, 0.015);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
    camera.position.set(0, -2, 28);
    camera.lookAt(0, 6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Instanced Stream Mesh Structure Assembly
    const streamCount = 800; // Number of unique line channels
    const verticesPerLine = 60; // Segmentation rate for curve precision
    const totalPoints = streamCount * verticesPerLine;

    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(totalPoints * 3);
    const speeds = new Float32Array(totalPoints);
    const offsets = new Float32Array(totalPoints);
    const randoms = new Float32Array(totalPoints * 3);
    const lineIndices: number[] = [];

    let pIndex = 0;
    let sIndex = 0;
    let rIndex = 0;

    for (let i = 0; i < streamCount; i++) {
      const speed = 0.6 + Math.random() * 0.8;
      const offset = Math.random();
      const randX = Math.random();
      const randY = Math.random();
      const randZ = Math.random();
      for (let j = 0; j < verticesPerLine; j++) {
        // Initialize default points vector
        positions[pIndex++] = 0;
        positions[pIndex++] = 0;
        positions[pIndex++] = 0;
        speeds[sIndex] = speed;
        offsets[sIndex] = offset;
        sIndex++;
        randoms[rIndex++] = randX;
        randoms[rIndex++] = randY;
        randoms[rIndex++] = randZ;
        if (j < verticesPerLine - 1) {
          const currentIdx = i * verticesPerLine + j;
          lineIndices.push(currentIdx, currentIdx + 1);
        }
      }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geometry.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));
    geometry.setAttribute('aRandoms', new THREE.BufferAttribute(randoms, 3));
    geometry.setIndex(lineIndices);

    // Core Glowing Additive Material Mapping Definition
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 }
      },
      transparent: true,
      blending: THREE.AdditiveBlending, // Forces overlapping lines to accumulate into pure white light
      depthWrite: false,
      depthTest: true
    });
    const lineSystem = new THREE.LineSegments(geometry, material);
    scene.add(lineSystem);

    // Interactive Mouse Parallax Engine Configuration
    let mouseX = 0, mouseY = 0;
    let targetX = 0, targetY = 0;
    
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMouseMove);

    // Loop Frame Execution tick
    const clock = new THREE.Clock();
    let animationFrameId: number;

    function renderFrame() {
      animationFrameId = requestAnimationFrame(renderFrame);
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      // Fluid camera tracking delay damping equations
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;
      lineSystem.rotation.y = targetX * 0.25;
      lineSystem.rotation.x = targetY * 0.1;
      camera.position.x = targetX * 2.0;
      renderer.render(scene, camera);
    }
    renderFrame();

    // Canvas Viewport Update Constraints
    const onResize = () => {
      if (!containerRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
      
      // Cleanup Three.js resources
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 w-full h-full pointer-events-none opacity-45 overflow-hidden" 
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
