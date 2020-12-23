import { match } from 'assert';
import * as THREE from '/build/three.module.js'
import { Vector3 } from '/build/three.module.js';

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
    private cubeRadius: number = 0.5;
    private cubeDiameter: number = this.cubeRadius * 2;
    private scene: THREE.Scene;
    private cubeArr: Array<THREE.Mesh>;
    // constructor(scene: THREE.Scene, num: number) {
    //     this.scene = scene;
    //     this.cubeArr = new Array<THREE.Mesh>();
    //     this.maxRanks = num;
    //     //正方体6个面，每个面num*num
    //     this.createMagicCube(num)
    // }

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.cubeArr = new Array<THREE.Mesh>();
    }

    /**
     * createNormCube
     */
    public createNormCube(pos: Vector3): THREE.Mesh {
        const geometry: THREE.BoxGeometry = new THREE.BoxGeometry(this.cubeDiameter, this.cubeDiameter, this.cubeDiameter);
        let mats = [];

        for (var i = 0; i < geometry.faces.length; i++) {
            let material = new THREE.MeshBasicMaterial({
                color: 0xFFFFFF * Math.random(), wireframe: false
            });
            mats.push(material);
        }

        // MeshLambertMaterial
        let cube = new THREE.Mesh(geometry, mats);
        cube.position.set(pos.x, pos.y, pos.z);
        this.cubeArr.push(cube);
        this.scene.add(cube);
        return cube;
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
        cube.position.set(x, y, z);
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

    public getFaceCube(direction: cubeDirection) {
        let resultArr = new Array<THREE.Mesh>();
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

    /**
     * rotate
     */
    public rotate(direction: cubeDirection, rtDirect: rotateDirection, angle: number) {
        let arr: Array<THREE.Mesh> = this.getFaceCube(direction);
        let resultAngle: number = rtDirect == rotateDirection.Clockwise ? -1 : 1;
        resultAngle = resultAngle * Math.abs(angle);
        let absAngle = Math.abs(angle);
        let midCube: Vector3 = arr[4].position;
        arr.forEach(item => {
            item.rotateX(resultAngle);
            // let oriPos = item.position;
            // let kb = new Vector3(oriPos.x - midCube.x, oriPos.y - midCube.y, oriPos.z - midCube.z);
            // kb.y = kb.y * Math.cos(absAngle) - kb.z * Math.sin(absAngle);
            // kb.z = kb.z * Math.cos(absAngle) + kb.y * Math.sin(absAngle);
            // item.position.set(oriPos.x, kb.y, kb.z);
        });
    }
}