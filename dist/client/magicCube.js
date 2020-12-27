import * as THREE from '/build/three.module.js';
import { Vector3 } from '/build/three.module.js';
// 以下按照面的渲染顺序排序(上黄下白，前蓝后绿，左橙右红)
export var rotateDirection;
(function (rotateDirection) {
    // 顺时针
    rotateDirection[rotateDirection["Clockwise"] = 0] = "Clockwise";
    // 逆时针
    rotateDirection[rotateDirection["AntiClockwise"] = 1] = "AntiClockwise";
})(rotateDirection || (rotateDirection = {}));
export var cubeDirection;
(function (cubeDirection) {
    cubeDirection[cubeDirection["None"] = -1] = "None";
    cubeDirection[cubeDirection["Right"] = 0] = "Right";
    cubeDirection[cubeDirection["Left"] = 1] = "Left";
    cubeDirection[cubeDirection["Up"] = 2] = "Up";
    cubeDirection[cubeDirection["Down"] = 3] = "Down";
    cubeDirection[cubeDirection["Front"] = 4] = "Front";
    cubeDirection[cubeDirection["Back"] = 5] = "Back";
})(cubeDirection || (cubeDirection = {}));
export var cubeColor;
(function (cubeColor) {
    cubeColor["Black"] = "#222831";
    cubeColor["Red"] = "#854e4b";
    cubeColor["Orange"] = "#de7921";
    cubeColor["Yellow"] = "#F9CE00";
    cubeColor["White"] = "#fafbfd";
    cubeColor["Blue"] = "#336699";
    cubeColor["Green"] = "#739e3b";
})(cubeColor || (cubeColor = {}));
export class MagicCube {
    constructor(scene, num) {
        this.maxRanks = 0;
        this.cubeOffset = 0.1;
        this.cubeRadius = 0.5;
        this.cubeDiameter = this.cubeRadius * 2;
        this.direction = cubeDirection.None;
        this.rtDirect = rotateDirection.Clockwise;
        this.targetAngle = 0;
        this.animationSpeed = 1;
        this.scene = scene;
        this.cubeArr = new Array();
        this.maxRanks = num;
        //正方体6个面，每个面num*num
        this.createMagicCube(num);
    }
    /**
     * nxnxn的立方体
     * @param num
     */
    createMagicCube(num) {
        let ix, iy, iz = 0;
        for (ix = 0; ix < num; ix++) {
            for (iy = 0; iy < num; iy++) {
                for (iz = 0; iz < num; iz++) {
                    let dirs = this.getCubeDir(ix, iy, iz, num);
                    // createCube(ix, iy, iz, dir);
                    //平移
                    // createCube(ix + cubeRadius, iy + cubeRadius, iz + cubeRadius, dir);
                    //分割
                    // console.log(ix, iy, iz);
                    this.createCube(this.cubeRadius + ix * (this.cubeDiameter + this.cubeOffset), this.cubeRadius + iy * (this.cubeDiameter + this.cubeOffset), this.cubeRadius + iz * (this.cubeDiameter + this.cubeOffset), dirs);
                }
            }
        }
    }
    createCube(x, y, z, dirs) {
        const geometry = new THREE.BoxGeometry(this.cubeDiameter, this.cubeDiameter, this.cubeDiameter);
        let mats = [];
        for (var i = 0; i < geometry.faces.length; i++) {
            let boxColor = cubeColor.Black;
            if (dirs.includes(i)) {
                boxColor = this.getCubeColor(i);
            }
            let material = new THREE.MeshBasicMaterial({
                color: boxColor, wireframe: false
            });
            mats.push(material);
        }
        // MeshLambertMaterial
        let cube = new THREE.Mesh(geometry, mats);
        // cube.position.set(x, y, z);
        cube.matrixAutoUpdate = false;
        let cube_matrix = new THREE.Matrix4();
        cube_matrix.multiply(new THREE.Matrix4().makeTranslation(x, y, z));
        cube.applyMatrix4(cube_matrix);
        this.cubeArr.push(cube);
        this.scene.add(cube);
    }
    getCubeDir(ix, iy, iz, maxNum) {
        let dir = new Array();
        let dirx = ix == maxNum - 1 ? cubeDirection.Right : ix == 0 ? cubeDirection.Left : cubeDirection.None;
        let diry = iy == maxNum - 1 ? cubeDirection.Up : iy == 0 ? cubeDirection.Down : cubeDirection.None;
        let dirz = iz == maxNum - 1 ? cubeDirection.Front : iz == 0 ? cubeDirection.Back : cubeDirection.None;
        dir.push(dirx);
        dir.push(diry);
        dir.push(dirz);
        return dir;
    }
    getCubeColor(direction) {
        let result = "";
        switch (direction) {
            case cubeDirection.None:
                result = cubeColor.Black;
                break;
            case cubeDirection.Up:
                result = cubeColor.Yellow;
                break;
            case cubeDirection.Down:
                result = cubeColor.White;
                break;
            case cubeDirection.Front:
                result = cubeColor.Blue;
                break;
            case cubeDirection.Back:
                result = cubeColor.Green;
                break;
            case cubeDirection.Left:
                result = cubeColor.Orange;
                break;
            case cubeDirection.Right:
                result = cubeColor.Red;
                break;
            default:
                break;
        }
        return result;
    }
    getFaceCube(direction) {
        let resultArr = new Array();
        for (let i = 0; i < this.cubeArr.length; i++) {
            switch (direction) {
                case cubeDirection.Right:
                    if (this.cubeArr[i].position.x == this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset)) {
                        resultArr.push(this.cubeArr[i]);
                    }
                    break;
                case cubeDirection.Left:
                    if (this.cubeArr[i].position.x == this.cubeRadius) {
                        resultArr.push(this.cubeArr[i]);
                    }
                    break;
                case cubeDirection.Up:
                    if (this.cubeArr[i].position.y == this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset)) {
                        resultArr.push(this.cubeArr[i]);
                    }
                    break;
                case cubeDirection.Down:
                    if (this.cubeArr[i].position.y == this.cubeRadius) {
                        resultArr.push(this.cubeArr[i]);
                    }
                    break;
                case cubeDirection.Front:
                    if (this.cubeArr[i].position.z == this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset)) {
                        resultArr.push(this.cubeArr[i]);
                    }
                    break;
                case cubeDirection.Back:
                    if (this.cubeArr[i].position.z == this.cubeRadius) {
                        resultArr.push(this.cubeArr[i]);
                    }
                    break;
                default:
                    break;
            }
        }
        return resultArr;
    }
    resetAnimateInfo() {
        this.direction = cubeDirection.None;
        this.rtDirect = rotateDirection.Clockwise;
        this.targetAngle = 0;
    }
    imediateApply() {
        this.rotateImediate(this.direction, this.rtDirect, this.targetAngle);
        this.resetAnimateInfo();
    }
    rotate(direction, rtDirect, angle, isNeedAnimation = true) {
        if (isNeedAnimation) {
            if (this.isAnimating()) {
                console.log("动画过程中不允许旋转");
                return;
            }
            this.direction = direction;
            this.rtDirect = rtDirect;
            this.targetAngle = angle;
        }
        else {
            if (this.isAnimating()) {
                this.imediateApply();
            }
            this.rotateImediate(direction, rtDirect, angle);
        }
    }
    rotateImediate(direction, rtDirect, angle) {
        let arr = this.getFaceCube(direction);
        let resultAngle = rtDirect == rotateDirection.Clockwise ? -1 : 1;
        angle = angle * Math.PI / 180;
        let absAngle = Math.abs(angle);
        resultAngle = resultAngle * absAngle;
        let midCube = arr[4];
        let midCube_matrix = midCube.matrix.clone();
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            item.matrix = midCube_matrix.clone();
            let offsetPos = new Vector3(item.position.x - midCube.position.x, item.position.y - midCube.position.y, item.position.z - midCube.position.z);
            console.log(i, offsetPos.x, offsetPos.y, offsetPos.z);
            // 验证偏移是否正确
            // item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
            // 把所有方块移动到中心，先旋转，再平移
            item.matrix.multiply(new THREE.Matrix4().makeRotationX(resultAngle));
            item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
        }
    }
    isAnimating() {
        return this.targetAngle > 0;
    }
    setAnimationSpeed(speed) {
        this.animationSpeed = speed;
    }
    updateAnimation() {
        if (this.targetAngle > 0) {
            let angle = Math.min(this.targetAngle, this.animationSpeed);
            this.targetAngle -= angle;
            this.rotateImediate(this.direction, this.rtDirect, angle);
            if (this.targetAngle == 0) {
                this.resetAnimateInfo();
            }
        }
    }
}
