import { version } from 'typescript';
import * as THREE from '/build/three.module.js'
import { AxesHelper, Matrix4, Mesh, Quaternion, Texture, Vector3 } from '/build/three.module.js';

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

        const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.cubeDiameter, this.cubeDiameter, this.cubeDiameter);
        let mats = [];

        for (var i = 0; i < geometry.faces.length; i++) {
            let boxColor: string = cubeColor.Black;
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

    private getMidCube(direction: cubeDirection): THREE.Mesh {
        for (let i = 0; i < this.cubeArr.length; i++) {
            let item = this.cubeArr[i];
            let position = item.position;
            switch (direction) {
                case cubeDirection.Right:
                    // x: 5.2, y: 3.1, z: 3.1
                    if (this.isFloatSame(position.x, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Left:
                    // x: 1, y: 3.1, z: 3.1
                    if (this.isFloatSame(position.x, this.cubeRadius) &&
                        this.isFloatSame(position.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Up:
                    // x: 3.1, y: 5.2, z: 3.1,
                    if (this.isFloatSame(position.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.y, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Down:
                    // x: 3.1, y: 1, z: 3.1
                    if (this.isFloatSame(position.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.y, this.cubeRadius) &&
                        this.isFloatSame(position.z, this.cubeDiameter + this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Front:
                    // x: 3.1, y: 3.1, z: 5.2
                    if (this.isFloatSame(position.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.z, 2 * this.cubeDiameter + 2 * this.cubeOffset + this.cubeRadius)
                    )
                        return item;
                    break;
                case cubeDirection.Back:
                    // x: 3.1, y: 3.1, z: 1
                    if (this.isFloatSame(position.x, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.y, this.cubeDiameter + this.cubeOffset + this.cubeRadius) &&
                        this.isFloatSame(position.z, this.cubeRadius)
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
        for (let i = 0; i < this.cubeArr.length; i++) {

            // let position = new THREE.Vector3(0, 0, 0).applyMatrix4(this.cubeArr[i].matrix);
            let position = this.cubeArr[i].position;
            switch (direction) {
                case cubeDirection.Right:
                    if (this.isFloatSame(position.x, this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset))) {
                        resultArr.push(this.cubeArr[i]);
                        resultArr.sort(this.sortBy(new Array<string>("y", "z"), new Array<boolean>(false, false)));
                    }
                    break;
                case cubeDirection.Left:
                    if (this.isFloatSame(position.x, this.cubeRadius)) {
                        resultArr.push(this.cubeArr[i]);
                        resultArr.sort(this.sortBy(new Array<string>("y", "z"), new Array<boolean>(false, false)));
                    }
                    break;
                case cubeDirection.Up:
                    if (this.isFloatSame(position.y, this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset))) {
                        resultArr.push(this.cubeArr[i]);
                        resultArr.sort(this.sortBy(new Array<string>("z", "x"), new Array<boolean>(true, true)));
                    }
                    break;
                case cubeDirection.Down:
                    if (this.isFloatSame(position.y, this.cubeRadius)) {
                        resultArr.push(this.cubeArr[i]);
                        resultArr.sort(this.sortBy(new Array<string>("z", "x"), new Array<boolean>(true, true)));
                    }
                    break;
                case cubeDirection.Front:
                    if (this.isFloatSame(position.z, this.cubeRadius + (this.maxRanks - 1) * (this.cubeDiameter + this.cubeOffset))) {
                        resultArr.push(this.cubeArr[i]);
                        resultArr.sort(this.sortBy(new Array<string>("y", "x"), new Array<boolean>(false, true)));
                    }
                    break;
                case cubeDirection.Back:
                    if (this.isFloatSame(position.z, this.cubeRadius)) {
                        resultArr.push(this.cubeArr[i]);
                        resultArr.sort(this.sortBy(new Array<string>("y", "x"), new Array<boolean>(false, true)));
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

    getCubeOffset(cubeArr: Array<Mesh>): Array<Vector3> {
        let arr = new Array<Vector3>();
        let mid = cubeArr[4];
        for (let i = 0; i < cubeArr.length; i++) {
            const element = cubeArr[i];
            arr[i] = new Vector3(element.position.x - mid.position.x,
                element.position.y - mid.position.y,
                element.position.z - mid.position.z);
        }
        return arr;
    }

    sortBy(names: Array<string>, ascendings: Array<boolean>) {
        return function (x, y) {
            for (let i = 0; i < names.length; i++) {
                const element = names[i];

                if (x.position[element] != y.position[element]) {
                    if (x.position[element] - y.position[element] < 0)
                        return ascendings[i] ? -1 : 1;
                    return ascendings[i] ? 1 : -1;
                }
            }

            return 0;
        }
    }

    public getCubes() {
        return this.cubeArr;
    }

    private direction: cubeDirection = cubeDirection.None;
    private rtDirect: rotateDirection = rotateDirection.Clockwise;
    private targetAngle: number = 0;
    private animCubeArr: Array<THREE.Mesh>;
    private animCubeOffsetDic: Map<cubeDirection, Array<Vector3>> = new Map<cubeDirection, Array<Vector3>>();
    private animationSpeed: number = 1;

    private resetAnimateInfo() {
        this.direction = cubeDirection.None;
        this.rtDirect = rotateDirection.Clockwise;
        this.targetAngle = 0;
        this.animCubeArr = null;
    }

    public imediateApply() {
        this.rotateImediate(this.animCubeArr, this.direction, this.rtDirect, this.targetAngle);
        this.resetAnimateInfo();
    }
    public rotate(direction: cubeDirection, rtDirect: rotateDirection, angle: number, isNeedAnimation = true) {
        if (isNeedAnimation) {
            if (this.isAnimating()) {
                console.log("动画过程中不允许旋转");
                return;
            }
            this.direction = direction;
            this.rtDirect = rtDirect;
            this.targetAngle = angle;
            this.animCubeArr = this.getFaceCube(direction);
            this.animCubeOffsetDic.set(direction, this.getCubeOffset(this.animCubeArr));
        }
        else {
            if (this.isAnimating()) {
                this.imediateApply();
            }
            let arr: Array<THREE.Mesh> = this.getFaceCube(direction);
            this.rotateImediate(arr, direction, rtDirect, angle);
        }
    }

    public makeMid(direction: cubeDirection, rtDirect: rotateDirection, angle: number) {
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
        console.log("resultAngle: ", resultAngle);
        let midCube = arr[4];
        let midCube_matrix: Matrix4 = midCube.matrix.clone();

        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            item.matrix = midCube_matrix.clone();

            // let offsetPos: Vector3 = new Vector3(item.position.x - midCube.position.x, item.position.y - midCube.position.y, item.position.z - midCube.position.z)
            // console.log(i, offsetPos.x, offsetPos.y, offsetPos.z);

            // 验证偏移是否正确
            // item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));

        }
    }

    private rotateImediate(arr: Array<THREE.Mesh>, direction: cubeDirection, rtDirect: rotateDirection, angle: number) {
        let resultAngle: number = 0;
        if (direction == cubeDirection.Right || direction == cubeDirection.Up || direction == cubeDirection.Front) {
            resultAngle = rtDirect == rotateDirection.Clockwise ? -1 : 1;
        } else if (direction == cubeDirection.Left || direction == cubeDirection.Down || direction == cubeDirection.Back) {

            resultAngle = rtDirect == rotateDirection.Clockwise ? 1 : -1;
        }
        angle = angle * Math.PI / 180;
        let absAngle = Math.abs(angle);
        resultAngle = resultAngle * absAngle;
        console.log("resultAngle: ", resultAngle);
        let midCube = arr[4];
        // console.log("++++++++++++++++++++++++++++++++++");


        if (direction == cubeDirection.Left || direction == cubeDirection.Right) {
            midCube.matrix.multiply(new THREE.Matrix4().makeRotationX(resultAngle));
        }
        else if (direction == cubeDirection.Up || direction == cubeDirection.Down) {
            midCube.matrix.multiply(new THREE.Matrix4().makeRotationY(resultAngle));
        }
        else if (direction == cubeDirection.Front || direction == cubeDirection.Back) {
            midCube.matrix.multiply(new THREE.Matrix4().makeRotationZ(resultAngle));
        }
        midCube.matrix.decompose(midCube.position, midCube.quaternion, midCube.scale);

        for (let i = 0; i < arr.length; i++) {
            let item = arr[i];
            if (item == midCube)
                continue;


            let distance = new Vector3(item.position.x - midCube.position.x, item.position.y - midCube.position.y, item.position.z - midCube.position.z);
            let relativePosition = new Vector3();
            relativePosition.x = distance.dot(MagicCube.mul(midCube.quaternion, new Vector3(-1, 0, 0)));
            relativePosition.y = distance.dot(MagicCube.mul(midCube.quaternion, new Vector3(0, 1, 0)));
            relativePosition.z = distance.dot(MagicCube.mul(midCube.quaternion, new Vector3(0, 0, -1)));

            let offsetPos: Vector3 = relativePosition;//this.animCubeOffsetDic.get(direction)[i];// new Vector3(item.position.x - midCube.position.x, item.position.y - midCube.position.y, item.position.z - midCube.position.z)
            // console.log(i, offsetPos.x, offsetPos.y, offsetPos.z);

            item.matrix = midCube.matrix.clone();

            // 验证偏移是否正确
            // item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));

            // 把所有方块移动到中心，先旋转，再平移
            if (direction == cubeDirection.Left || direction == cubeDirection.Right) {
                item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
                // item.matrix.multiply(new THREE.Matrix4().makeTranslation(0, -1 * (this.cubeDiameter + this.cubeOffset), 0));
            }
            else if (direction == cubeDirection.Up || direction == cubeDirection.Down) {
                item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z))
            }
            else if (direction == cubeDirection.Front || direction == cubeDirection.Back) {
                item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z))
            }
            item.matrix.decompose(item.position, item.quaternion, item.scale);
        }

        // for (let i = 0; i < arr.length; i++) {
        //     let item = arr[i];
        //     item.matrix = midCube_matrix.clone();

        //     let offsetPos: Vector3 = new Vector3(item.position.x - midCube.position.x, item.position.y - midCube.position.y, item.position.z - midCube.position.z)
        //     // console.log(i, offsetPos.x, offsetPos.y, offsetPos.z);

        //     // 验证偏移是否正确
        //     // item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));

        //     // 把所有方块移动到中心，先旋转，再平移
        //     if (direction == cubeDirection.Left || direction == cubeDirection.Right) {
        //         item.matrix.multiply(new THREE.Matrix4().makeRotationX(resultAngle));
        //         item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z));
        //     }
        //     else if (direction == cubeDirection.Up || direction == cubeDirection.Down) {
        //         item.matrix.multiply(new THREE.Matrix4().makeRotationY(resultAngle));
        //         item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z))
        //     }
        //     else if (direction == cubeDirection.Front || direction == cubeDirection.Back) {
        //         item.matrix.multiply(new THREE.Matrix4().makeRotationZ(resultAngle));
        //         item.matrix.multiply(new THREE.Matrix4().makeTranslation(offsetPos.x, offsetPos.y, offsetPos.z))
        //     }
        //     // item.updateMatrix();
        //     // item.matrix.decompose(item.position, new Quaternion(), new Vector3());
        //     // console.log(item.position.clone().applyMatrix4(item.matrix));
        //     // console.log(item.position);
        // }
        // // console.log('mid: ', midCube.position);

    }

    static mul(rotation: Quaternion, point: Vector3): Vector3 {
        let x: number = rotation.x * 2;
        let y: number = rotation.y * 2;
        let z: number = rotation.z * 2;
        let xx: number = rotation.x * x;
        let yy: number = rotation.y * y;
        let zz: number = rotation.z * z;
        let xy: number = rotation.x * y;
        let xz: number = rotation.x * z;
        let yz: number = rotation.y * z;
        let wx: number = rotation.w * x;
        let wy: number = rotation.w * y;
        let wz: number = rotation.w * z;

        let res: Vector3 = new Vector3(0, 0, 0);
        res.x = (1 - (yy + zz)) * point.x + (xy - wz) * point.y + (xz + wy) * point.z;
        res.y = (xy + wz) * point.x + (1 - (xx + zz)) * point.y + (yz - wx) * point.z;
        res.z = (xz - wy) * point.x + (yz + wx) * point.y + (1 - (xx + yy)) * point.z;
        return res;
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

            this.rotateImediate(this.animCubeArr, this.direction, this.rtDirect, angle);

            if (this.targetAngle == 0) {
                this.resetAnimateInfo();

                // for (let i = 0; i < this.cubeArr.length; i++) {
                //     let item = this.cubeArr[i];
                //     item.matrix.decompose(item.position, item.quaternion, item.scale);
                // }
            }
        }
    }
}