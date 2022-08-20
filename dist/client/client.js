import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
let scene;
let renderer;
let camera;
let controls;
let box;
let box_matrix;
let cylinder;
let cylinder_matrix;
let start_cylinder_matrix;
const MAGICCUBERANKS = 3;
initBase();
initObject();
createAxis();
// creatPlane();
createLights();
function createLights() {
    // 添加环境光，提高场景亮度
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);
    // 添加聚光灯，以产生阴影
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(2, 5, 2);
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
function initObject() {
    // var box_geometry = new THREE.BoxGeometry();
    var sphere_geometry = new THREE.SphereGeometry(0.5, 32, 32);
    var cylinder_geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
    var material = new THREE.MeshLambertMaterial({ color: new THREE.Color(0.9, 0.55, 0.4) });
    // box = new THREE.Mesh(box_geometry, material);
    var sphere = new THREE.Mesh(sphere_geometry, material);
    cylinder = new THREE.Mesh(cylinder_geometry, material);
    var pile = new THREE.Object3D();
    pile.scale.multiplyScalar(0.5);
    // pile.add(box);
    pile.add(sphere);
    pile.add(cylinder);
    scene.add(pile);
    // 就不能再通过position，scale和rotation去修改矩阵。
    // box.matrixAutoUpdate = false;
    sphere.matrixAutoUpdate = false;
    cylinder.matrixAutoUpdate = false;
    // box_matrix = new THREE.Matrix4();
    // box.applyMatrix4(box_matrix);
    var sphere_matrix = new THREE.Matrix4().makeTranslation(0.0, 1.0, 0.0);
    sphere.applyMatrix4(sphere_matrix);
    updateCylinder(0);
    start_cylinder_matrix = cylinder.matrix.clone();
}
function resetCylinder() {
    cylinder.matrix = start_cylinder_matrix.clone();
}
function updateCylinder(angle) {
    cylinder.matrix = new THREE.Matrix4();
    // cylinder_matrix = new THREE.Matrix4().makeTranslation(0.0, 1.0, 0.0);
    // cylinder_matrix.multiply(new THREE.Matrix4().makeRotationZ(angle * Math.PI / 180));
    var q = new THREE.Quaternion();
    q.setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle * Math.PI / 180);
    cylinder_matrix = new THREE.Matrix4().compose(new Vector3(0.0, 1.0, 0.0), q, new Vector3(1, 1, 1));
    cylinder_matrix.multiply(new THREE.Matrix4().makeTranslation(0.0, 0.75, 0.0));
    cylinder.applyMatrix4(cylinder_matrix);
    // console.log(cylinder.position)
    // cylinder.updateMatrix();
    // console.log(cylinder.quaternion);
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
    //绘制魔方
    // let magicCube = new MagicCube(scene, MAGICCUBERANKS);
    // magicCube.rotate(cubeDirection.Right, rotateDirection.AntiClockwise, 30);
}
function createAxis() {
    // 创建坐标轴（RGB颜色 分别代表 XYZ轴）
    var axisHelper = new THREE.AxesHelper(6);
    scene.add(axisHelper);
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
let angle = 10;
let start;
let lastTime;
window.requestAnimationFrame(animate);
function animate(timestamp) {
    if (start === undefined)
        start = timestamp;
    if (lastTime === undefined)
        lastTime = timestamp;
    const deltTime = timestamp - lastTime;
    const elapsed = timestamp - start;
    // if (deltTime > 1000) {
    //     if (elapsed < 360 * 1000) {
    //         updateCylinder(angle);
    //     }
    // }
    updateCylinder(angle);
    lastTime = timestamp;
    controls.update();
    angle++;
    render();
    requestAnimationFrame(animate);
}
;
$("#updateCylinder").click(function (e) {
    resetCylinder();
    updateCylinder(angle);
    angle += 10;
});
$("#resetCylinder").click(function (e) {
    resetCylinder();
    angle = 0;
});
// animate();
