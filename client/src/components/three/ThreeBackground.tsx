import { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeBackgroundProps {
  className?: string;
}

export function ThreeBackground({ className = "" }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    animationId?: number;
  }>();

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create particle system
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Position
      positions[i3] = (Math.random() - 0.5) * 100;
      positions[i3 + 1] = (Math.random() - 0.5) * 100;
      positions[i3 + 2] = (Math.random() - 0.5) * 100;

      // Color (blue to purple gradient)
      const hue = 0.6 + Math.random() * 0.2; // Blue to purple
      const saturation = 0.8 + Math.random() * 0.2;
      const lightness = 0.4 + Math.random() * 0.4;
      
      const color = new THREE.Color().setHSL(hue, saturation, lightness);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      // Size
      sizes[i] = Math.random() * 2 + 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('particleColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 particleColor;
        varying vec3 vColor;
        uniform float time;

        void main() {
          vColor = particleColor;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Add some movement
          mvPosition.x += sin(time * 0.5 + position.y * 0.01) * 2.0;
          mvPosition.y += cos(time * 0.3 + position.x * 0.01) * 2.0;
          
          gl_PointSize = size * (100.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float strength = distance(gl_PointCoord, vec2(0.5));
          strength = 1.0 - strength;
          strength = pow(strength, 2.0);
          
          vec3 finalColor = mix(vec3(0.0), vColor, strength);
          gl_FragColor = vec4(finalColor, strength * 0.8);
        }
      `,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 30;

    // Animation loop
    let animationId: number | undefined;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      const time = Date.now() * 0.001;
      material.uniforms.time.value = time;

      // Rotate the particle system
      particles.rotation.y = time * 0.1;
      particles.rotation.x = time * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Store refs for cleanup
    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      animationId
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 -z-10 ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,20,40,0.9) 50%, rgba(40,20,60,0.9) 100%)' 
      }}
    />
  );
}