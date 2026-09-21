/* ===========================================================
   scene3d.js — visualizador 3D reutilizável (Three.js)
   Um único canvas ao vivo (galeria 3D), troca de modelo sem
   recriar o renderer/luzes — leve, mesma receita testada:
   luz de estúdio + 2 luzes de destaque vermelho coral + ambiente
   PBR + sombra de contato suave, sobre fundo branco.
   =========================================================== */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.169.0/examples/jsm/libs/draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
const gltfCache = new Map();

function loadModel(url) {
  if (gltfCache.has(url)) return gltfCache.get(url);
  const p = new Promise((resolve, reject) => gltfLoader.load(url, resolve, undefined, reject));
  gltfCache.set(url, p);
  return p;
}

/**
 * Cria um visualizador 3D vivo dentro de `container`.
 * Retorna { setModel(url), destroy() }.
 */
export function createViewer(container, opts = {}) {
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(2.05, 1.5, 2.5);
  camera.lookAt(0, 0.55, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
  container.appendChild(renderer.domElement);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 2.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3;
  key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
  key.shadow.bias = -0.0004;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xdbe6ff, 0.55);
  fill.position.set(-3, 2, -2);
  scene.add(fill);

  const rim1 = new THREE.PointLight(0xff385c, 8, 9, 2);
  rim1.position.set(-1.5, 1.0, -1.7);
  scene.add(rim1);

  const rim2 = new THREE.PointLight(0xff385c, 3, 7, 2);
  rim2.position.set(1.6, 0.4, -1.3);
  scene.add(rim2);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.ShadowMaterial({ opacity: 0.15 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const rig = new THREE.Group(); // gira o modelo atual; a troca de modelo só troca o filho
  scene.add(rig);
  let current = null;

  function fitAndAdd(root) {
    root.traverse((n) => { if (n.isMesh) n.castShadow = true; });
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = 1.62 / Math.max(size.x, size.y, size.z);
    root.scale.setScalar(scale);
    root.position.x -= center.x * scale;
    root.position.z -= center.z * scale;
    root.position.y -= box.min.y * scale;
    rig.add(root);
  }

  function setModel(url) {
    const fadeOld = current;
    loadModel(url).then((gltf) => {
      const fresh = gltf.scene.clone(true);
      if (fadeOld) rig.remove(fadeOld);
      fitAndAdd(fresh);
      current = fresh;
      container.dispatchEvent(new CustomEvent('viewer:loaded', { detail: { url } }));
    }).catch((err) => {
      console.error('scene3d: falha ao carregar', url, err);
    });
  }

  // parallax sutil pelo mouse (não depende de arrastar; some ao sair)
  let mx = 0, my = 0;
  function onMove(e) {
    const r = container.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
  }
  function onLeave() { mx = 0; my = 0; }
  container.addEventListener('mousemove', onMove);
  container.addEventListener('mouseleave', onLeave);

  let running = false, raf = null;
  function animate() {
    raf = requestAnimationFrame(animate);
    if (!reduceMotion) rig.rotation.y += 0.0028 + mx * 0.012;
    rig.rotation.x += ((my * 0.22) - rig.rotation.x) * 0.06;
    renderer.render(scene, camera);
  }
  function start() { if (!running) { running = true; animate(); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { en.isIntersecting ? start() : stop(); });
  }, { threshold: 0.08 });
  io.observe(container);

  if (opts.model) setModel(opts.model);

  return {
    setModel,
    destroy() {
      stop(); io.disconnect(); ro.disconnect();
      container.removeEventListener('mousemove', onMove);
      container.removeEventListener('mouseleave', onLeave);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
