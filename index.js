import * as R from 'rodin/core';
R.start();

R.Scene.add(new R.Sculpt(new THREE.AmbientLight()));

const points = [];

const getRandomPoint = () => {

    let res = new THREE.Vector3(
        Math.random(),
        Math.random(),
        Math.random() - 5
    );
    return res;
};


for (let i = 0; i < 40; i++) {
    let sphere = new R.Sphere(.05, 5, 5, new THREE.MeshNormalMaterial({color: 0x996633}));
    R.Scene.add(sphere);
    points.push(sphere);
    
    sphere.position = getRandomPoint();
}

// {
//     let sphere = new R.Sphere(.05, 5, 5, new THREE.MeshNormalMaterial({color: 0x996633}));
//     R.Scene.add(sphere);
//     points.push(sphere);
    
//     sphere.position = new THREE.Vector3(-2, 1.6, -2);
// }



let boundingSphere = new R.Sphere(10, 100, 100, new THREE.MeshBasicMaterial({wireframe: true}));

const bs = {R: 0.5, x: 0, y: 0, z: 0};

R.Scene.add(boundingSphere);

const dist = (a, b) => {
    return (a.x - b.x) * (a.x - b.x) + 
    (a.y - b.y) * (a.y - b.y) +
    (a.z - b.z) * (a.z - b.z);
};

const normalizePoints = (points) => {
    const center = new THREE.Vector3(0,0,0);
    const resPoints = [];
    
    for (let i in points) {
        center.x += points[i].position.x;
        center.y += points[i].position.y;
        center.z += points[i].position.z;
    }
    
    center.x /= points.length;
    center.y /= points.length;
    center.z /= points.length;
    
    let furthest = null;
    for (let i in points) {
        if (furthest === null || dist(center, points[i].position)) {
            furthest = i;
        }
    }
    
    let distCoef = dist(points[furthest].position, center);
    for (let i in points) {
        resPoints.push(new THREE.Vector3(
            points[i].x - center.x,
            points[i].y - center.y,
            points[i].z - center.z
        ));
        resPoints.x /= distCoef;
        resPoints.y /= distCoef;
        resPoints.z /= distCoef;
    }
    
    return {points: resPoints, offset: center, coef: distCoef};
};


const alpha = 1;
let step = 0.005;
const normalizedPoints = normalizePoints(points);

const optimizationStep = () => {
    const grad = {R: 1, x: 0, y: 0, z: 0};

    

    for (let p of points) {
        if (dist(bs, p.position) > bs.R * bs.R) {
            grad.R += alpha * (-2 * bs.R);
            grad.x += alpha * 2 * (bs.x - p.position.x);
            grad.y += alpha * 2 * (bs.y - p.position.y);
            grad.z += alpha * 2 * (bs.z - p.position.z);
        }
    }
    //step = 0.001 * Math.abs(grad.x + grad.y + grad.R);
    bs.x -= step * grad.x;
    bs.y -= step * grad.y;
    bs.z -= step * grad.z;
    bs.R -= step * grad.R;
    
    R.Scene.remove(boundingSphere);
    boundingSphere = new R.Sphere(bs.R, 10, 10, new THREE.MeshBasicMaterial({wireframe: true}));
    boundingSphere.position.set(bs.x, bs.y, bs.z);
    R.Scene.add(boundingSphere);
    console.log(bs);
};

R.Scene.preRender(()=>{
   optimizationStep();
});