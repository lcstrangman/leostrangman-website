import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('hero-container');
  
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const loader = new GLTFLoader();
  loader.load('public/models/glassrender1.glb', (gltf) => {
    const model = gltf.scene;
    scene.add(model);
  }, undefined, (error) => {
    console.error('Error loading the GLB model:', error);
  });

  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(2, 2, 3);
  scene.add(light);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
});
