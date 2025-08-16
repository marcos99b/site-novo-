'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Conjuntos3DProps {
  className?: string;
}

export default function Conjuntos3D({ className = '' }: Conjuntos3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Configuração da cena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Fundo sutil
    sceneRef.current = scene;

    // Configuração da câmera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);

    // Configuração do renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Iluminação elegante para conjuntos
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(4, 5, 4);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Luz de preenchimento sutil
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-4, 3, -4);
    scene.add(fillLight);

    // Carregar o modelo 3D dos conjuntos
    const loader = new GLTFLoader();
    loader.load(
      '/models/conjuntos/textured.glb', // Versão com texturas
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Centralizar e escalar o modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3.3 / maxDim; // Escala bem maior para conjuntos ficarem muito visíveis
        model.scale.setScalar(scale);
        
        model.position.sub(center.multiplyScalar(scale));
        model.position.y = -0.1; // Ajustar posição vertical para o novo tamanho

        // Adicionar sombras
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        scene.add(model);
      },
      (progress) => {
        console.log('Carregando modelo 3D dos Conjuntos:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('Erro ao carregar modelo 3D dos Conjuntos:', error);
      }
    );

    // Função de animação
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotação suave do modelo
      if (modelRef.current) {
        modelRef.current.rotation.y += 0.007; // Rotação ligeiramente mais rápida
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;

      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className={`w-full h-full min-h-[400px] rounded-2xl overflow-hidden ${className}`}
    />
  );
}
