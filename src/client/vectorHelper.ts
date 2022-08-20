import { Vector3 } from '/build/three.module.js';

/**
* 对位置四舍五入，保留一位小数（因为间隔在这是1位小数
*/
function roundPosition(pos: Vector3): Vector3 {
    // return pos;
    let result: Vector3 = new Vector3(); pos
    result.x = Number(pos.x.toFixed(1));
    result.y = Number(pos.y.toFixed(1));
    result.z = Number(pos.z.toFixed(1));
    // console.log('round:', result);
    return result;
}

export { roundPosition }; 