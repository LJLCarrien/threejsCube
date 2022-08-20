import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { cubeDirection, MagicCube, rotateDirection } from "./magicCube"
import { roundPosition } from "./vectorHelper";

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.Camera;
let controls: OrbitControls;

let magicCube: MagicCube;
const MAGICCUBE_RANKS = 2;
const MAGICCUBE_ROTATE_SPEED = 10;

let curCubeDirection: cubeDirection = cubeDirection.None;
let curRotateDirection: rotateDirection = rotateDirection.Clockwise;

initBase();
initMagicCube();
createAxis();

// creatPlane();
createLights();

/**
 * 创建灯光（环境光、聚光灯）
 */
function createLights() {
    // 环境光：提高场景亮度
    var ambientLight = new THREE.AmbientLight(0x0c0c0c);
    scene.add(ambientLight);

    // 聚光灯：产生阴影
    var spotLight = new THREE.SpotLight(0xffffff);
    spotLight.position.set(-40, 60, -10);
    spotLight.castShadow = true;
    scene.add(spotLight);
}

/**
 * 创建平面几何体
 */
function creatPlane() {
    var planeGeometry = new THREE.PlaneGeometry(10, 10, 1, 1);
    var planeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    // 平面接受别的物体产生的阴影
    plane.receiveShadow = true;

    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = 0;
    plane.position.z = 0;

    scene.add(plane);
}


function initCamera(type: number) {
    if (type == 1) {
        // 正交投影摄像机
        camera = new THREE.OrthographicCamera(window.innerWidth / -160, window.innerWidth / 160, window.innerHeight / 160, window.innerHeight / -160, -200, 500);
    }
    else {
        // 透视摄像机
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(12, 12, 12);
    }
}
/**
 * 初始化基础条件
 */
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
    window.addEventListener('keydown', onWKeyDown);
    window.addEventListener('click', onWDocMouseDown, false);

}
/**
 * 初始化魔方
 */
function initMagicCube() {
    magicCube = new MagicCube(scene, MAGICCUBE_RANKS);
    magicCube.setAnimationSpeed(MAGICCUBE_ROTATE_SPEED);
}

/**
 * 创建坐标轴（RGB颜色-XYZ轴）
 */
function createAxis() {
    var axisHelper = new THREE.AxesHelper(10);
    scene.add(axisHelper);
}


var clock = new THREE.Clock();
/**
 * FBS:渲染频率
 * 30FBS:每秒调用渲染器render方法大约30次
 */
var FPS = 60;
/**
 * renderT：单位秒 
 * 每次渲染需要多少秒
 */
var renderT = 1 / FPS;
/**
 * 表示render()函数被多次调用累积时间
 */
var timeS = 0;


function animate() {
    requestAnimationFrame(animate);

    var T = clock.getDelta();
    timeS = timeS + T;
    //通过时间判断，降低renderer.render执行频率
    if (timeS > renderT) {
        // console.log(`调用.render时间间隔`, timeS * 1000 + '毫秒',renderT * 1000 + '毫秒');
        magicCube.updateAnimation();
        timeS = 0;
        renderer.render(scene, camera);
    }
};


$("#clearShowUUid").on("click", function () {
    magicCube.setRotateShowUUid("");
})

$("#imediateApply").on("click", function () {
    magicCube.imediateApply();
})

$("#test").on("click", function () {
    // console.log(camera.position);
})



var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
function onWDocMouseDown(event) {

    event.preventDefault();

    mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = - (event.clientY / renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(magicCube.getCubes());

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        // console.log(obj.position, obj.quaternion, obj.scale);

        var worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        var roudnWorldPos = roundPosition(worldPos);

        // console.log('localPos:', obj.position, 'roudnWorldPos:', roudnWorldPos, 'worldPos:', worldPos);
        console.log('worldPos:', worldPos,obj.uuid);

        magicCube.setRotateShowUUid(obj.uuid);
        // console.log(obj.uuid);
    }
}


function onWKeyDown(e: KeyboardEvent) {
    // console.log(e.keyCode, e.code);
    let isNeedRotate = false;
    switch (e.code) {
        case 'KeyW': case 'KeyI':
            console.log("Up");
            curCubeDirection = cubeDirection.Up;
            isNeedRotate = true;
            curRotateDirection = e.code == 'KeyW' ? rotateDirection.Clockwise : rotateDirection.AntiClockwise;
            break;
        case 'KeyS': case 'KeyK':
            console.log("Down");
            curCubeDirection = cubeDirection.Down;
            isNeedRotate = true;
            curRotateDirection = e.code == 'KeyS' ? rotateDirection.Clockwise : rotateDirection.AntiClockwise;
            break;
        case 'KeyA': case 'KeyJ':
            console.log("Left");
            curCubeDirection = cubeDirection.Left;
            isNeedRotate = true;
            curRotateDirection = e.code == 'KeyA' ? rotateDirection.Clockwise : rotateDirection.AntiClockwise;
            break;
        case 'KeyD': case 'KeyL':
            console.log("Right");
            curCubeDirection = cubeDirection.Right;
            isNeedRotate = true;
            curRotateDirection = e.code == 'KeyD' ? rotateDirection.Clockwise : rotateDirection.AntiClockwise;
            break;
        case 'KeyQ': case 'KeyU':
            console.log("Front");
            curCubeDirection = cubeDirection.Front;
            isNeedRotate = true;
            curRotateDirection = e.code == 'KeyQ' ? rotateDirection.Clockwise : rotateDirection.AntiClockwise;
            break;
        case 'KeyE': case 'KeyO':
            console.log("Back");
            curCubeDirection = cubeDirection.Back;
            isNeedRotate = true;
            curRotateDirection = e.code == 'KeyE' ? rotateDirection.Clockwise : rotateDirection.AntiClockwise;
            break;
        default:
            break;
    }

    if (isNeedRotate) {
        // console.log(curRotateDirection == rotateDirection.Clockwise ? "顺时针" : "逆时针");
        magicCube.rotate(curCubeDirection, curRotateDirection, 90);
    }
}

function onWindowResize() {
    let perCam = camera as THREE.PerspectiveCamera
    if (perCam != null) {
        perCam.aspect = window.innerWidth / window.innerHeight;
        perCam.updateProjectionMatrix();
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
}