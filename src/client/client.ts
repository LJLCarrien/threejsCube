import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls'
import { cubeDirection, MagicCube, rotateDirection } from "./magicCube"
import { roundPosition } from "./vectorHelper";

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.Camera;
let controls: OrbitControls;

let magicCube: MagicCube;
const MAGICCUBE_RANKS = 3;
const MAGICCUBE_ROTATE_SPEED = 10;

let curCubeDirection: cubeDirection = cubeDirection.None;
let curRotateDirection: rotateDirection = rotateDirection.Clockwise;

initBase();
initMagicCube();
createAxis();

// creatPlane();
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
    var axisHelper = new THREE.AxesHelper(10);
    scene.add(axisHelper);
}

function oneKeyDown(e: KeyboardEvent) {
    // console.log(e.keyCode);
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
        // console.log(curRotateDirection)
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
    render();
}

// 创建一个时钟对象Clock
var clock = new THREE.Clock();
// 设置渲染频率为30FBS，也就是每秒调用渲染器render方法大约30次
var FPS = 60;
var renderT = 1 / FPS; //单位秒  间隔多长时间渲染渲染一次
// 声明一个变量表示render()函数被多次调用累积时间
// 如果执行一次renderer.render，timeS重新置0
var timeS = 0;

function render() {
    renderer.render(scene, camera);
}


function animate() {
    requestAnimationFrame(animate);

    controls.update();

    var T = clock.getDelta();
    timeS = timeS + T;
    // requestAnimationFrame默认调用render函数60次，通过时间判断，降低renderer.render执行频率
    if (timeS > renderT) {
        // console.log(`调用.render时间间隔`, timeS * 1000 + '毫秒');
        magicCube.updateAnimation();
        timeS = 0;
    }

    render();
};

$("#rotateClockwise").click(function () {
    magicCube.setIsReturn();
    // magicCube.rotate(cubeDirection.Up, rotateDirection.Clockwise, 90);
})

$("#rotateAntiClockwise").click(function () {
    magicCube.setRotateShowUUid("");
})

$("#imediateApply").click(function () {
    magicCube.imediateApply();
})

$("#rotateClockwiseNoAmimate").click(function () {
    magicCube.rotate(cubeDirection.Up, rotateDirection.Clockwise, 90, false);
})

$("#rotateAntiClockwiseNoAmimate").click(function () {
    magicCube.rotate(cubeDirection.Up, rotateDirection.AntiClockwise, 90, false);
})


var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
function onDocumentMouseDown(event) {

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
        worldPos = roundPosition(worldPos);

        console.log('localPos:', obj.position, 'worldPos:', worldPos);

        magicCube.setRotateShowUUid(obj.uuid);
        console.log(obj.uuid);
    }
}
window.addEventListener('click', onDocumentMouseDown, false);