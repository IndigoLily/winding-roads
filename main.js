const cnv = document.body.appendChild(document.createElement('canvas'));
const ctx = cnv.getContext('2d');

cnv.width  = window.innerWidth;
cnv.height = window.innerHeight;
let min = Math.min(cnv.width, cnv.height);

window.addEventListener('resize', e => {
    cnv.width  = window.innerWidth;
    cnv.height = window.innerHeight;
    min = Math.min(cnv.width, cnv.height);
});

class Camera {
    constructor() {
	this.x = 0;
	this.y = 0;
	this.z = 1;
	this.foclen = 1;
    }

    project(in_x, in_y, in_z=0) {
	const x = in_x - this.x;
	const y = in_y - this.y;
	const z = in_z - this.z;
	const zx = z / x;
	const yx = y / x;
	const screen_x = yx * this.foclen * min;
	const screen_y = zx * this.foclen * min;
	return [screen_x, screen_y];
    }

    project_radius(r, x) {
	return this.project(x, this.y + r, this.z)[0];
    }
}

const cam = new Camera();

const speeds = [];
for (let i = 0; i < 8; i++) {
    speeds.push(Math.random());
}

function wobble(theta) {
    let out = 1;
    for (let i = 0; i < speeds.length; i++) {
	out += Math.sin(theta*speeds[i]);
    }
    return out;
}

cam.z = 10;
cam.foclen = 2;
let frame = 0;
function draw() {
    let t = frame/60 + 1000;

    ctx.resetTransform();
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    ctx.translate(cnv.width/2, cnv.height/2);
    ctx.scale(1, -1);

    ctx.fillStyle = ctx.strokeStyle = '#fff';
    ctx.lineWidth = min/100;

    ctx.globalCompositeOperation = 'destination-over';
    for (let j = -4; j <= 4; j++) {
	ctx.beginPath();
	let left = [];
	for (let i = 0 ;; i += 2) {
	    const x = i;
	    const width = 2 - 2**(x/500);
	    if (width < 0) {
		break;
	    }
	    const theta = i/10 - t*10 + j*1000;
	    const y = wobble(theta) * 2 + j*speeds.length*3;
	    ctx.lineTo(...cam.project(x, y + width));
	    left.unshift( cam.project(x, y - width));
	}
	for (let i = 0; i < left.length; i++) {
	    ctx.lineTo(...left[i]);
	}
	ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';

    let between = new Path2D();
    const width = 0.08;
    for (let i = -7; i <= 7; i++) {
        const x = wobble(t*3 + 1000 + i*1000) / speeds.length * 4 + 30;
        const y = i*3;
        const z = wobble(t*3 + 3000 + i*1000) / speeds.length * 1 + cam.z * 4/3;

        ctx.beginPath();
        ctx.arc(...cam.project(x,y,z), cam.project_radius(2/7, x), 0, Math.PI*2);
        ctx.fill();

        between.lineTo(...cam.project(x,y,z));
    }
    ctx.stroke(between);

    frame++;
    requestAnimationFrame(draw);
}

draw();
