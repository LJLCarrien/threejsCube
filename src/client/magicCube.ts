import * as THREE from '/build/three.module.js'
import { Matrix4, Vector3 } from '/build/three.module.js';
import { roundPosition } from "./vectorHelper";

// 以下按照面的渲染顺序排序(上黄下白，前蓝后绿，左橙右红)
export enum rotateDirection {
    // 顺时针
    Clockwise,
    // 逆时针
    AntiClockwise,
}
export enum cubeDirection {
    None = -1,
    Right,
    Left,
    Up,
    Down,
    Front,
    Back
}
export enum cubeColor {
    Black = "#222831",
    Red = "#854e4b",
    Orange = "#de7921",
    Yellow = "#F9CE00",
    White = "#fafbfd",
    Blue = "#336699",
    Green = "#739e3b"
}

export class MagicCube {

    private maxRanks: number = 0;
    private cubeOffset: number = 0.1;
    private cubeRadius: number = 1;
    private cubeDiameter: number = this.cubeRadius * 2;
    private scene: THREE.Scene;
    private cubeArr: Array<THREE.Mesh>;
    constructor(scene: THREE.Scene, num: number) {
        this.scene = scene;
        this.cubeArr = new Array<THREE.Mesh>();
        this.maxRanks = num;
        //正方体6个面，每个面num*num
        this.createMagicCube(num)
    }

    /**
     * nxnxn的立方体
     * @param num 
     */
    public createMagicCube(num: number) {
        let ix, iy, iz: number = 0;
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

    private createCube(x: number, y: number, z: number, dirs: number[]) {

        // console.log('xyz:', x, y, z);
        const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.cubeDiameter, this.cubeDiameter, this.cubeDiameter);
        let mats = [];

        for (var i = 0; i < geometry.faces.length; i++) {
            let boxColor: string = cubeColor.Black;
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

    private getCubeDir(ix: number, iy: number, iz: number, maxNum: number): number[] {
        let dir: Array<number> = new Array<number>();
        let dirx = ix == maxNum - 1 ? cubeDirection.Right : ix == 0 ? cubeDirection.Left : cubeDirection.None;
        let diry = iy == maxNum - 1 ? cubeDirection.Up : iy == 0 ? cubeDirection.Down : cubeDirection.None;
        let dirz = iz == maxNum - 1 ? cubeDirection.Front : iz == 0 ? cubeDirection.Back : cubeDirection.None;
        dir.push(dirx);
        dir.push(diry);
        dir.push(dirz);
        return dir;
    }

    private getCubeColor(direction: number): string {
        let result: string = "";
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

    private isFloatSame(a: number, b: number) {
        let result = false;
        result = Math.abs(a - b) <= 1e-8;
        return result;
    }

    /**
     * 获取物体的世界坐标，并将位置四舍五入，保留1位小数
     * @param obj 
     */
    private getWorldPosition(obj: THREE.Object3D): Vector3 {
        let worldPositon = new THREE.Vector3();
        obj.getWorldPosition(worldPositon);
        worldPositon = roundPosition(worldPositon);
        return worldPositon;
    }

    private getMidCube(direction: cubeDirection): THREE.Mesh {
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
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Left:
                    // x: 1, y: 3.1, z: 3.1
                    if (this.isFloatSame(worldPositon.x, this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Up:
                    // x: 3.1, y: 5.2, z: 3.1,
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Down:
                    // x: 3.1, y: 1, z: 3.1
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Front:
                    // x: 3.1, y: 3.1, z: 5.2
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Back:
                    // x: 3.1, y: 3.1, z: 1
                    if (this.isFloatSame(worldPositon.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(worldPositon.z, this.cubeRadius)
                    )
                        return item;
                    break;

                default:
                    break;
            }
        }
    }

    public getFaceCube(direction: cubeDirection) {
        let resultArr = new Array<THREE.Mesh>();
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



    public getCubes() {
        return this.cubeArr;
    }

    private direction: cubeDirection = cubeDirection.None;
    private rtDirect: rotateDirection = rotateDirection.Clockwise;
    private targetAngle: number = 0;
    private animationSpeed: number = 1;
    private rotateShowUUid: string = "";

    private resetAnimateInfo() {
        this.direction = cubeDirection.None;
        this.rtDirect = rotateDirection.Clockwise;
        this.targetAngle = 0;
    }

    public imediateApply() {
        this.rotateImediate(this.direction, this.rtDirect, this.targetAngle);
        this.resetAnimateInfo();
    }
    public rotate(direction: cubeDirection, rtDirect: rotateDirection, angle: number, isNeedAnimation = true) {
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
            if (this.isAnimating()) {
                this.imediateApply();
            }
            this.rotateImediate(direction, rtDirect, angle);
        }
    }

    public setRotateShowUUid(uuidStr: string) {
        this.rotateShowUUid = uuidStr;
    }

    private dic: { [key: string]: Vector3; } = {};


    public setRelativePos(direction: cubeDirection) {
        this.dic = {};
        let arr: Array<THREE.Mesh> = this.getFaceCube(direction);
        let midCube = this.getMidCube(direction);
        let mideCubeWorldPos = this.getWorldPosition(midCube);
        for (let index = 0; index < arr.length; index++) {
            const item = arr[index];
            let itemWorldPos = this.getWorldPosition(item);
            let relativePos: Vector3 = new Vector3(itemWorldPos.x - mideCubeWorldPos.x, itemWorldPos.y - mideCubeWorldPos.y, itemWorldPos.z - mideCubeWorldPos.z);
            this.dic[item.uuid] = relativePos;
            // console.log(item.uuid, relativePos)
        }
    }

    private getRelativePos(uuid: string): Vector3 {
        if (this.dic[uuid] != null) {
            return this.dic[uuid];
        }
        return null;
    }

    private rotateImediate(direction: cubeDirection, rtDirect: rotateDirection, angle: number) {
        let arr: Array<THREE.Mesh> = this.getFaceCube(direction);

        let resultAngle: number = 0;
        if (direction == cubeDirection.Right || direction == cubeDirection.Up || direction == cubeDirection.Front) {
            resultAngle = rtDirect == rotateDirection.Clockwise ? -1 : 1;
        } else if (direction == cubeDirection.Left || direction == cubeDirection.Down || direction == cubeDirection.Back) {
            resultAngle = rtDirect == rotateDirection.Clockwise ? 1 : -1;
        }
        angle = angle * Math.PI / 180;
        let absAngle = Math.abs(angle);
        resultAngle = resultAngle * absAngle;
        // console.log("resultAngle: ", resultAngle);
        let midCube = this.getMidCube(direction);
        let midCube_matrix: Matrix4 = midCube.matrix;
        // console.log("++++++++++++++++++++++++++++++++++");

        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];

            let offsetPos: Vector3 = this.getRelativePos(item.uuid);

            // item.visible = item == midCube;
            if (this.rotateShowUUid != "") {
                item.visible = item.uuid == this.rotateShowUUid;
            }
            else {
                item.visible = true;
            }

            // 验证偏移是否正确
            // item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));

            // 把所有方块移动到中心，先旋转，再平移 
            item.matrix = midCube_matrix.clone();

            if (direction == cubeDirection.Left || direction == cubeDirection.Right) {
                item.matrix.multiply(new THREE.Matrix4().makeRotationX(resultAngle));
                item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
            }
            else if (direction == cubeDirection.Up || direction == cubeDirection.Down) {
                item.matrix.multiply(new THREE.Matrix4().makeRotationY(resultAngle));
                item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z))
            }
            else if (direction == cubeDirection.Front || direction == cubeDirection.Back) {
                item.matrix.multiply(new THREE.Matrix4().makeRotationZ(resultAngle));
                item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z))
            }
            // item.matrix.decompose(item.position, item.quaternion, item.scale);
            // console.log(item.position.clone().applyMatrix4(item.matrix));
            // console.log('pos:',item.position);

        }
        // console.log('mid: ', midCube.position);

    }



    public isAnimating() {
        return this.targetAngle > 0;
    }

    public setAnimationSpeed(speed: number) {
        this.animationSpeed = speed;
    }

    public updateAnimation() {
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