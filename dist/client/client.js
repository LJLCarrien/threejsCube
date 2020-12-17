import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
let scene;
let renderer;
let camera;
let controls;
// 以下按照面的渲染顺序排序(上黄下白，前蓝后绿，左橙右红)
var cubeDirect;
(function (cubeDirect) {
    cubeDirect[cubeDirect["None"] = -1] = "None";
    cubeDirect[cubeDirect["Right"] = 0] = "Right";
    cubeDirect[cubeDirect["Left"] = 1] = "Left";
    cubeDirect[cubeDirect["Up"] = 2] = "Up";
    cubeDirect[cubeDirect["Down"] = 3] = "Down";
    cubeDirect[cubeDirect["Front"] = 4] = "Front";
    cubeDirect[cubeDirect["Back"] = 5] = "Back";
})(cubeDirect || (cubeDirect = {}));
var cubeColor;
(function (cubeColor) {
    cubeColor["Black"] = "#222831";
    cubeColor["Red"] = "#854e4b";
    cubeColor["Orange"] = "#de7921";
    cubeColor["Yellow"] = "#F9CE00";
    cubeColor["White"] = "#fafbfd";
    cubeColor["Blue"] = "#336699";
    cubeColor["Green"] = "#739e3b";
})(cubeColor || (cubeColor = {}));
const cubeOffset = 0.1;
const cubeRadius = 0.5;
const cubeDiameter = cubeRadius * 2;
const MAGICCUBERANKS = 3;
initBase();
createAxis();
creatPlane();
createLights();
createMagicCube(MAGICCUBERANKS);
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
function getCubeDir(ix, iy, iz, maxNum) {
    let dir = new Array();
    let dirx = ix == maxNum - 1 ? cubeDirect.Right : ix == 0 ? cubeDirect.Left : cubeDirect.None;
    let diry = iy == maxNum - 1 ? cubeDirect.Up : iy == 0 ? cubeDirect.Down : cubeDirect.None;
    let dirz = iz == maxNum - 1 ? cubeDirect.Front : iz == 0 ? cubeDirect.Back : cubeDirect.None;
    dir.push(dirx);
    dir.push(diry);
    dir.push(dirz);
    return dir;
}
function createMagicCube(num) {
    let ix, iy, iz = 0;
    for (ix = 0; ix < num; ix++) {
        for (iy = 0; iy < num; iy++) {
            for (iz = 0; iz < num; iz++) {
                let dirs = getCubeDir(ix, iy, iz, num);
                // createCube(ix, iy, iz, dir);
                //平移
                // createCube(ix + cubeRadius, iy + cubeRadius, iz + cubeRadius, dir);
                //分割
                createCube(cubeRadius + ix * (cubeDiameter + cubeOffset), cubeRadius + iy * (cubeDiameter + cubeOffset), cubeRadius + iz * (cubeDiameter + cubeOffset), dirs);
            }
        }
    }
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
    window.addEventListener('resize', onWindowResize, false);
}
function createAxis() {
    // 创建坐标轴（RGB颜色 分别代表 XYZ轴）
    var axisHelper = new THREE.AxesHelper(6);
    scene.add(axisHelper);
}
function getCubeColor(direct) {
    let result = "";
    switch (direct) {
        case cubeDirect.None:
            result = cubeColor.Black;
            break;
        case cubeDirect.Up:
            result = cubeColor.Yellow;
            break;
        case cubeDirect.Down:
            result = cubeColor.White;
            break;
        case cubeDirect.Front:
            result = cubeColor.Blue;
            break;
        case cubeDirect.Back:
            result = cubeColor.Green;
            break;
        case cubeDirect.Left:
            result = cubeColor.Orange;
            break;
        case cubeDirect.Right:
            result = cubeColor.Red;
            break;
        default:
            break;
    }
    return result;
}
function createCube(x, y, z, dirs) {
    const geometry = new THREE.BoxGeometry(cubeDiameter, cubeDiameter, cubeDiameter);
    let mats = [];
    for (var i = 0; i < geometry.faces.length; i++) {
        let boxColor = cubeColor.Black;
        if (dirs.includes(i)) {
            boxColor = getCubeColor(i);
        }
        let material = new THREE.MeshBasicMaterial({
            color: boxColor, wireframe: false
        });
        mats.push(material);
    }
    // MeshLambertMaterial
    const cube = new THREE.Mesh(geometry, mats);
    cube.position.set(x, y, z);
    scene.add(cube);
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
var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    render();
};
animate();
