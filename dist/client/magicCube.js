import * as THREE from '/build/three.module.js';
import { Matrix4, Vector3 } from '/build/three.module.js';
import { roundPosition } from "./vectorHelper";
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
export class baseVectorObj {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
export class MagicCube {
    constructor(scene, num) {
        this.maxRanks = 0;
        this.cubeOffset = 0.1;
        this.cubeRadius = 1;
        this.cubeDiameter = this.cubeRadius * 2;
        this.direction = cubeDirection.None;
        this.rtDirect = rotateDirection.Clockwise;
        this.targetAngle = 0;
        this.animationSpeed = 1;
        this.rotateShowUUid = "";
        this.dic = {};
        this.scene = scene;
        this.cubeArr = new Array();
        this.maxRanks = num;
        //正方体6个面，每个面num*num
        // this.createMagicCube(num)
        this.createTestCube();
    }
    //#region  测试代码 
    // 结论：两个旋转结果不同，是因为最后一个平移决定的。绕自身旋转后，自身坐标系发生变化，所以平移后的位置不再是原位置，表现为绕轴旋转
    createTestCube() {
        //0
        let dirs = this.getCubeDir(0, 0, 0, 3);
        this.createCube(0, 0, 0, dirs);
        //1
        dirs = this.getCubeDir(8, 0, 0, 3);
        this.createCube(8, 0, 0, dirs);
    }
    // 世界平移-自身旋转-世界平移的逆(表现为原地旋转)
    worldTranslation_SelfRotate() {
        let worldPosZero = this.getWorldPosition(this.cubeArr[0]);
        let worldPosOne = this.getWorldPosition(this.cubeArr[1]);
        let worldOffset = worldPosZero.sub(worldPosOne);
        let goZeroMatrix = new Matrix4().makeTranslation(worldOffset.x, worldOffset.y, worldOffset.z);
        this.cubeArr[1].matrix.premultiply(goZeroMatrix);
        let angle = 30 * Math.PI / 180;
        let absAngle = Math.abs(angle);
        this.cubeArr[1].matrix.multiply(new THREE.Matrix4().makeRotationZ(absAngle));
        let mat4I = new THREE.Matrix4();
        mat4I.getInverse(goZeroMatrix);
        this.cubeArr[1].matrix.premultiply(mat4I);
    }
    // 自身平移-自身旋转-自身平移的逆（表现为绕轴旋转）
    SelfTranslation_SelfRotate() {
        let worldPosZero = this.getWorldPosition(this.cubeArr[0]);
        let worldPosOne = this.getWorldPosition(this.cubeArr[1]);
        let worldOffset = worldPosZero.sub(worldPosOne);
        // 世界空间转局部空间
        let itemBaseVec = this.getBasisVec(this.cubeArr[1].matrix);
        let localOffset = this.vectorChangBasic(worldOffset, itemBaseVec);
        let goZeroMatrix = new Matrix4().makeTranslation(localOffset.x, localOffset.y, localOffset.z);
        this.cubeArr[1].matrix.multiply(goZeroMatrix);
        let angle = 30 * Math.PI / 180;
        let absAngle = Math.abs(angle);
        this.cubeArr[1].matrix.multiply(new THREE.Matrix4().makeRotationZ(absAngle));
        let mat4I = new THREE.Matrix4();
        mat4I.getInverse(goZeroMatrix);
        this.cubeArr[1].matrix.multiply(mat4I);
    }
    //#endregion
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
        // console.log('xyz:', x, y, z);
        const geometry = new THREE.BoxGeometry(this.cubeDiameter, this.cubeDiameter, this.cubeDiameter);
        let mats = [];
        for (var i = 0; i < geometry.faces.length; i++) {
            let boxColor = cubeColor.Black;
            if (dirs.includes(i)) {
                boxColor = this.getCubeColor(i);
            }
            let material = new THREE.MeshBasicMaterial({
                color: boxColor, wireframe: false,
                transparent: true, opacity: 0.4
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
        var cubeAxis = new THREE.AxesHelper(2);
        cube.add(cubeAxis);
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
    isFloatSame(a, b) {
        let result = false;
        result = Math.abs(a - b) <= 1e-8;
        return result;
    }
    /**
     * 获取物体的世界坐标，并将位置四舍五入，保留1位小数
     * @param obj
     */
    getWorldPosition(obj) {
        let worldPositon = new THREE.Vector3();
        obj.getWorldPosition(worldPositon);
        worldPositon = roundPosition(worldPositon);
        return worldPositon;
    }
    getMidCube(direction) {
        for (let i = 0; i < this.cubeArr.length; i++) {
            let item = this.cubeArr[i];
            //local position
            // let position = item.position;
            //world position
            let worldPositon = this.getWorldPosition(item);
            switch (direction) {
                case cubeDirection.Right:
                    // x: 5.2, y: 3.1, z: 3.1
                    if (this.isFloatSame(worldPositon.x, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius))
                        return item;
                    break;
                case cubeDirection.Left:
                    // x: 1, y: 3.1, z: 3.1
                    if (this.isFloatSame(worldPositon.x, this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius))
                        return item;
                    break;
                case cubeDirection.Up:
                    // x: 3.1, y: 5.2, z: 3.1,
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius))
                        return item;
                    break;
                case cubeDirection.Down:
                    // x: 3.1, y: 1, z: 3.1
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius))
                        return item;
                    break;
                case cubeDirection.Front:
                    // x: 3.1, y: 3.1, z: 5.2
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius))
                        return item;
                    break;
                case cubeDirection.Back:
                    // x: 3.1, y: 3.1, z: 1
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeRadius))
                        return item;
                    break;
                default:
                    break;
            }
        }
    }
    getFaceCube(direction) {
        let resultArr = new Array();
        let rightSign = this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset);
        let upSign = this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset);
        let frontSign = this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset);
        for (let i = 0; i < this.cubeArr.length; i++) {
            let item = this.cubeArr[i];
            //local position
            // let position = item.position;
            //world position
            let worldPositon = this.getWorldPosition(item);
            switch (direction) {
                case cubeDirection.Right:
                    if (this.isFloatSame(worldPositon.x, rightSign)) {
                        resultArr.push(item);
                    }
                    break;
                case cubeDirection.Left:
                    if (this.isFloatSame(worldPositon.x, this.cubeRadius)) {
                        resultArr.push(item);
                    }
                    break;
                case cubeDirection.Up:
                    if (this.isFloatSame(worldPositon.y, upSign)) {
                        resultArr.push(item);
                    }
                    break;
                case cubeDirection.Down:
                    if (this.isFloatSame(worldPositon.y, this.cubeRadius)) {
                        resultArr.push(item);
                    }
                    break;
                case cubeDirection.Front:
                    if (this.isFloatSame(worldPositon.z, frontSign)) {
                        // item.visible=false;
                        resultArr.push(item);
                    }
                    break;
                case cubeDirection.Back:
                    if (this.isFloatSame(worldPositon.z, this.cubeRadius)) {
                        resultArr.push(item);
                    }
                    break;
                default:
                    break;
            }
        }
        // console.log('------------------------')
        // for (let i = 0; i < resultArr.length; i++) {
        //     console.log(resultArr[i].position);
        // }
        return resultArr;
    }
    getCubes() {
        return this.cubeArr;
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
            this.setRelativePos(direction);
            this.direction = direction;
            this.rtDirect = rtDirect;
            this.targetAngle = angle;
        }
        else {
            this.setRelativePos(direction);
            if (this.isAnimating()) {
                this.imediateApply();
            }
            this.rotateImediate(direction, rtDirect, angle);
        }
    }
    setRotateShowUUid(uuidStr) {
        this.rotateShowUUid = uuidStr;
    }
    //判断2个物体的基坐标系是否相等
    isBaseVecEqual(mata, matb) {
        let BaseA = this.getBasisVec(mata);
        let BaseB = this.getBasisVec(matb);
        if (BaseA.x.equals(BaseB.x) && BaseA.y.equals(BaseB.y) && BaseA.z.equals(BaseB.z)) {
            return true;
        }
        return false;
    }
    getBasisVec(mat) {
        let vectX = new Vector3();
        let vectY = new Vector3();
        let vectZ = new Vector3();
        mat.extractBasis(vectX, vectY, vectZ);
        vectX = roundPosition(vectX);
        vectY = roundPosition(vectY);
        vectZ = roundPosition(vectZ);
        // console.log('基向量:', 'x: ', vectX, 'y: ', vectY, 'z: ', vectZ);
        return new baseVectorObj(vectX, vectY, vectZ);
    }
    vectorChangBasic(needChangeVec, baseVec) {
        // 世界空间的相对位置，转成基于baseVec坐标系下的相对位置
        let newVec = new Vector3();
        newVec.x = needChangeVec.dot(baseVec.x);
        newVec.y = needChangeVec.dot(baseVec.y);
        newVec.z = needChangeVec.dot(baseVec.z);
        return newVec;
    }
    setRelativePos(direction) {
        let arr = this.getFaceCube(direction);
        let midCube = this.getMidCube(direction);
        let mideBaseVec = this.getBasisVec(midCube.matrix);
        let mideCubeWorldPos = this.getWorldPosition(midCube);
        for (let index = 0; index < arr.length; index++) {
            const item = arr[index];
            let itemWorldPos = this.getWorldPosition(item);
            let relativePos = new Vector3(itemWorldPos.x - mideCubeWorldPos.x, itemWorldPos.y - mideCubeWorldPos.y, itemWorldPos.z - mideCubeWorldPos.z);
            // 世界空间的相对位置，转成基于中间方块坐标系下的相对位置
            // let baseRelativePos: Vector3 = new Vector3();
            // baseRelativePos.x = relativePos.dot(mideBaseVec.x);
            // baseRelativePos.y = relativePos.dot(mideBaseVec.y);
            // baseRelativePos.z = relativePos.dot(mideBaseVec.z);
            let baseRelativePos = this.vectorChangBasic(relativePos, mideBaseVec);
            this.dic[item.uuid] = baseRelativePos;
            // console.log('baseRelativePos: ', baseRelativePos);
        }
    }
    getRelativePos(uuid) {
        if (this.dic[uuid] != null) {
            return this.dic[uuid];
        }
        return null;
    }
    rotateImediate(direction, rtDirect, angle) {
        let arr = this.getFaceCube(direction);
        let resultAngle = 0;
        if (direction == cubeDirection.Right || direction == cubeDirection.Up || direction == cubeDirection.Front) {
            resultAngle = rtDirect == rotateDirection.Clockwise ? -1 : 1;
        }
        else if (direction == cubeDirection.Left || direction == cubeDirection.Down || direction == cubeDirection.Back) {
            resultAngle = rtDirect == rotateDirection.Clockwise ? 1 : -1;
        }
        angle = angle * Math.PI / 180;
        let absAngle = Math.abs(angle);
        resultAngle = resultAngle * absAngle;
        // console.log("resultAngle: ", resultAngle);
        let midCube = this.getMidCube(direction);
        let midCube_matrix = midCube.matrix;
        // console.log("++++++++++++++++++++++++++++++++++");
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            let offsetPos = this.getRelativePos(item.uuid);
            // item.visible = item == midCube;
            if (this.rotateShowUUid != "") {
                // || item == midCube
                item.visible = item.uuid == this.rotateShowUUid;
            }
            else {
                item.visible = true;
            }
            if (this.isBaseVecEqual(item.matrix, midCube_matrix)) {
                // 基坐标一致，移动方块=把方块等于中心方块-旋转-平移 
                item.matrix = midCube_matrix.clone();
                if (direction == cubeDirection.Left || direction == cubeDirection.Right) {
                    item.matrix.multiply(new THREE.Matrix4().makeRotationX(resultAngle));
                    item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
                }
                else if (direction == cubeDirection.Up || direction == cubeDirection.Down) {
                    item.matrix.multiply(new THREE.Matrix4().makeRotationY(resultAngle));
                    item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
                }
                else if (direction == cubeDirection.Front || direction == cubeDirection.Back) {
                    item.matrix.multiply(new THREE.Matrix4().makeRotationZ(resultAngle));
                    item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
                }
            }
            else {
                //基坐标不一致，移动方块
                let itemBaseVec = this.getBasisVec(item.matrix);
                // console.log('itemBaseVec:', itemBaseVec);
                let mideCubeWorldPos = this.getWorldPosition(midCube);
                let itemWorldPos = this.getWorldPosition(item);
                let offset = new Vector3(mideCubeWorldPos.x - itemWorldPos.x, mideCubeWorldPos.y - itemWorldPos.y, mideCubeWorldPos.z - itemWorldPos.z);
                let translate2Mid = new Matrix4();
                if (item.visible) {
                    //世界坐标系的偏移转换到局部坐标系的偏移
                    // let offset2Base = this.vectorChangBasic(offset, itemBaseVec);
                    // // 在局部坐标系下，平移到中间
                    // translate2Mid = new Matrix4().makeTranslation(offset2Base.x, offset2Base.y, offset2Base.z);
                    // item.matrix.multiply(translate2Mid);
                    // console.log('offset: ', offset);
                    // console.log('offset2Base: ', offset2Base);
                    //使用世界坐标系平移
                    translate2Mid = new Matrix4().makeTranslation(offset.x, offset.y, offset.z);
                    item.matrix.premultiply(translate2Mid);
                }
                // let angle = 1 * Math.PI / 180;
                // let absAngle = Math.abs(angle);
                // // item.matrix.multiply(new THREE.Matrix4().makeRotationY(absAngle));
                // // item.matrix.multiply(new THREE.Matrix4().makeRotationY(resultAngle));
                let worldBaseVec = new baseVectorObj(new Vector3(1, 0, 0), new Vector3(0, 1, 0), new Vector3(0, 0, 1));
                if (true && direction == cubeDirection.Front || direction == cubeDirection.Back) {
                    let yDotZ = itemBaseVec.y.dot(worldBaseVec.z);
                    let isYZSameLine = Math.abs(yDotZ) == 1; //不管同向还是反向，是否共线
                    if (this.isVectSameDirection(itemBaseVec.z, worldBaseVec.z)) {
                        console.log('z,same z');
                        // item.matrix.multiply(new THREE.Matrix4().makeRotationZ(resultAngle));
                    }
                    else if (isYZSameLine) {
                        console.log('y,same z');
                        item.matrix.multiply(new THREE.Matrix4().makeRotationY(yDotZ * resultAngle));
                    }
                    else if (this.isVectSameDirection(itemBaseVec.x, worldBaseVec.z)) {
                        console.log('x,same z');
                        // item.matrix.multiply(new THREE.Matrix4().makeRotationX(resultAngle));
                    }
                    // console.log('offsetPos', offsetPos);
                    // var mat4I = new THREE.Matrix4();
                    // mat4I.getInverse(translate2Mid);
                    // item.matrix.multiply(mat4I);
                    //世界坐标系逆
                    var mat4I = new THREE.Matrix4();
                    mat4I.getInverse(translate2Mid);
                    item.matrix.premultiply(mat4I);
                }
            }
        }
    }
    isVectSameDirection(v1, v2) {
        let result = v1.dot(v2);
        return result > 0;
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
