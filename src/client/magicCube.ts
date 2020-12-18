
// 以下按照面的渲染顺序排序(上黄下白，前蓝后绿，左橙右红)
enum cubeDirect {
    None = -1,
    Right,
    Left,
    Up,
    Down,
    Front,
    Back
}
enum cubeColor {
    Black = "#222831",
    Red = "#854e4b",
    Orange = "#de7921",
    Yellow = "#F9CE00",
    White = "#fafbfd",
    Blue = "#336699",
    Green = "#739e3b"
}

export class MagicCube {

    private cubeOffset: number = 0.1;
    private cubeRadius: number = 0.5;
    private cubeDiameter: number = this.cubeRadius * 2;
    private scene: THREE.Scene;
    constructor(scene: THREE.Scene) {
        this.scene = scene;
    }

    public createMagicCube(num: number) {
        let ix, iy, iz: number = 0
        for (ix = 0; ix < num; ix++) {
            for (iy = 0; iy < num; iy++) {
                for (iz = 0; iz < num; iz++) {
                    let dirs = this.getCubeDir(ix, iy, iz, num);
                    // createCube(ix, iy, iz, dir);
                    //平移
                    // createCube(ix + cubeRadius, iy + cubeRadius, iz + cubeRadius, dir);
                    //分割
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
        const cube = new THREE.Mesh(geometry, mats);
        cube.position.set(x, y, z);
        this.scene.add(cube);
    }

    private getCubeDir(ix: number, iy: number, iz: number, maxNum: number): number[] {
        let dir: Array<number> = new Array<number>();
        let dirx = ix == maxNum - 1 ? cubeDirect.Right : ix == 0 ? cubeDirect.Left : cubeDirect.None;
        let diry = iy == maxNum - 1 ? cubeDirect.Up : iy == 0 ? cubeDirect.Down : cubeDirect.None;
        let dirz = iz == maxNum - 1 ? cubeDirect.Front : iz == 0 ? cubeDirect.Back : cubeDirect.None;
        dir.push(dirx);
        dir.push(diry);
        dir.push(dirz);
        return dir;
    }

    private getCubeColor(direct: number): string {
        let result: string = "";
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
}