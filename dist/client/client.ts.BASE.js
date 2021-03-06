import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { cubeDirection, MagicCube, rotateDirection } from "./magicCube";
let scene;
let renderer;
let camera;
let controls;
let magicCube;
const MAGICCUBE_RANKS = 3;
const MAGICCUBE_ROTATE_SPEED = 10;
let curCubeDirection = cubeDirection.None;
let curRotateDirection = rotateDirection.Clockwise;
initBase();
initMagicCube();
createAxis();
creatPlane();
createLights();
function createLights() {
    // 添加环境光，提高场景亮度
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);
    // 添加聚光灯，以产生阴影
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);
}
function creatPlane() {
    // 创建一个平面几何体
    var planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // 平面接受别的物体产生的阴影
    plane.receiveShadow = true;
    // 旋转并设置平面的位置
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;
    // 添加平面至场景中
    scene.add(plane);
}
function initCamera(type) {
    if (type == 1) {
        // 正交投影摄像机
        camera = new THREE.OrthographicCamera(window.innerWidth / -160, window.innerWidth / 160, window.innerHeight / 160, window.innerHeight / -160, -200, 500);
    }
    else {
        // 透视摄像机
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;
    }
}
function initBase() {
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    // 开启渲染器的阴影 
    renderer.shadowMapEnabled = true;
    document.body.appendChild(renderer.domElement);
    initCamera(2);
    controls = new OrbitControls(camera, renderer.domElement);
    window.requestAnimationFrame(animate);
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', oneKeyDown);
}
function initMagicCube() {
    //绘制魔方
    magicCube = new MagicCube(scene, MAGICCUBE_RANKS);
    magicCube.setAnimationSpeed(MAGICCUBE_ROTATE_SPEED);
}
function createAxis() {
    // 创建坐标轴（RGB颜色 分别代表 XYZ轴）
    var axisHelper = new THREE.AxesHelper(6);
    scene.add(axisHelper);
}
function oneKeyDown(e) {
    console.log(e.keyCode);
    let isNeedRotate = false;
    switch (e.keyCode) {
        case 87:
            console.log("Up");
            curCubeDirection = cubeDirection.Up;
            isNeedRotate = true;
            break;
        case 83:
            console.log("Down");
            curCubeDirection = cubeDirection.Down;
            isNeedRotate = true;
            break;
        case 65:
            console.log("Left");
            curCubeDirection = cubeDirection.Left;
            isNeedRotate = true;
            break;
        case 68:
            console.log("Right");
            curCubeDirection = cubeDirection.Right;
            isNeedRotate = true;
            break;
        case 81:
            console.log("Front");
            curCubeDirection = cubeDirection.Front;
            isNeedRotate = true;
            break;
        case 69:
            console.log("Back");
            curCubeDirection = cubeDirection.Back;
            isNeedRotate = true;
            break;
        case 74:
            console.log("J 切换顺时针");
            curRotateDirection = rotateDirection.Clockwise;
            break;
        case 75:
            console.log("K 切换逆时针");
            curRotateDirection = rotateDirection.AntiClockwise;
            break;
        default:
            break;
    }
    if (isNeedRotate) {
        console.log(curRotateDirection);
        magicCube.rotate(curCubeDirection, curRotateDirection, 90);
    }
}
function onWindowResize() {
    let perCam = camera;
    if (perCam != null) {
        perCam.aspect = window.innerWidth / window.innerHeight;
        perCam.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
function render() {
    renderer.render(scene, camera);
}
function animate() {
    requestAnimationFrame(animate);
    magicCube.updateAnimation();
    controls.update();
    render();
}
;
$("#rotateClockwise").click(function () {
    magicCube.rotate(cubeDirection.Up, rotateDirection.Clockwise, 90);
});
$("#rotateAntiClockwise").click(function () {
    magicCube.rotate(cubeDirection.Up, rotateDirection.AntiClockwise, 90);
});
$("#imediateApply").click(function () {
    magicCube.imediateApply();
});
$("#rotateClockwiseNoAmimate").click(function () {
    magicCube.rotate(cubeDirection.Up, rotateDirection.Clockwise, 90, false);
});
$("#rotateAntiClockwiseNoAmimate").click(function () {
    magicCube.rotate(cubeDirection.Up, rotateDirection.AntiClockwise, 90, false);
});
