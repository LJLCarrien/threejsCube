import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let controls: OrbitControls;

const cubeRadius = 0.5;
const MAGICCUBERANKS = 3;
initBase();

createAxis();
createMagicCube(MAGICCUBERANKS);

function createMagicCube(num: number) {
    let ix, iy, iz: number = 0
    for (ix = 0; ix < num; ix++) {
        for (iy = 0; iy < num; iy++) {
            for (iz = 0; iz < num; iz++) {
                createCube(ix + cubeRadius, iy + cubeRadius, iz + cubeRadius);
            }
        }
    }
}
function initBase() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 2;

    controls = new OrbitControls(camera, renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
}

function createAxis() {
    // 创建坐标轴（RGB颜色 分别代表 XYZ轴）
    var axisHelper = new THREE.AxesHelper(6);
    scene.add(axisHelper);
}

function createCube(x: number, y: number, z: number) {
    const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(cubeRadius * 2, cubeRadius * 2);
    const material: THREE.MeshBasicMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(x, y, z);
    scene.add(cube);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}

function render() {
    renderer.render(scene, camera);
}

var animate = function () {
    requestAnimationFrame(animate);

    controls.update();

    render();
};


animate();
