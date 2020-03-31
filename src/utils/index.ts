import { DirType } from "../types";

/**
 * 判断指定坐标在指定矩形上的位置
 *
 * @param {number} x 矩形x坐标
 * @param {number} y 矩形y坐标
 * @param {number} width 矩形宽度
 * @param {number} height 矩形高度
 * @param {number} px 待检测坐标x(一般位鼠标x坐标)
 * @param {number} py 待检测坐标y(一般位鼠标y坐标)
 * @returns {number} 1:up 2:down 3:left 4:right -1:center(对角线上)
 */
export function getRectDirection(
    x: number,
    y: number,
    width: number,
    height: number,
    px: number,
    py: number
) {
    const y_ac =
        ((y + height) * px - y * px + y * (x + width) - (y + height) * x) /
        (x + width - x);
    const y_bd =
        (y * px - (y + height) * px + (y + height) * (x + width) - y * x) /
        (x + width - x);

    if (py < y_ac && py < y_bd) {
        return 1;
    } else if (py > y_ac && py > y_bd) {
        return 2;
    } else if (py > y_ac && py < y_bd) {
        return 3;
    } else if (py < y_ac && py > y_bd) {
        return 4;
    } else {
        //处在对角线上
        const middle_x = x + width / 2;
        const middle_y = y + height / 2;

        if (px > middle_x && py < middle_y) {
            //右上对角线
            return 1;
        } else if (px > middle_x && py > middle_y) {
            //右下对角线
            return 2;
        } else if (px < middle_x && py < middle_y) {
            //左上对角线
            return 1;
        } else if (px < middle_x && py > middle_y) {
            //左下对角线
            return 2;
        } else {
            //中心点
            return -1;
        }
    }
}

export function isBeforeRect(
    x: number,
    y: number,
    width: number,
    height: number,
    px: number,
    py: number
) {
    const ret = getRectDirection(x, y, width, height, px, py);

    return ret === 1 || ret === 3;
}

export function getHoverDirection(
    x: number,
    y: number,
    width: number,
    height: number,
    px: number,
    py: number
): DirType {
    const ret = getRectDirection(x, y, width, height, px, py);

    let dir: DirType = "down";

    if (ret === 1) {
        dir = "up";
    } else if (ret === 2) {
        dir = "down";
    } else if (ret === 3) {
        dir = "left";
    } else if (ret === 4) {
        dir = "right";
    }

    return dir;
}

export function isNodeInDocument(node: HTMLElement) {
    return document.body.contains(node);
}

export function last(array: any[]) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : undefined;
}

export function findIndex(
    array: any[],
    predicate: (value: any, index: any, array: any) => boolean
) {
    if (array == null) {
        throw new TypeError('"this" is null or not defined');
    }

    var o = Object(array);

    var len = o.length >>> 0;

    if (typeof predicate !== "function") {
        throw new TypeError("predicate must be a function");
    }

    var k = 0;

    while (k < len) {
        var kValue = o[k];
        if (predicate(kValue, k, o)) {
            return k;
        }

        k++;
    }

    return -1;
}

export function find(array, predicate) {
    const idx = findIndex(array, predicate);

    return array[idx];
}

export function isFunction(value: any): value is (...args: any[]) => any {
    return typeof value === "function";
}
