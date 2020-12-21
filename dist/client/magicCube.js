import * as THREE from '/build/three.module.js';
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
        cube.position.set(x, y, z);
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
    /**
     * rotate
     */
    rotate(direction, rtDirect, angle) {
        let arr = this.getFaceCube(direction);
        let resultAngle = rtDirect == rotateDirection.Clockwise ? -1 : 1;
        resultAngle = resultAngle * Math.abs(angle);
        let absAngle = Math.abs(angle);
        let midCube = arr[4].position;
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
