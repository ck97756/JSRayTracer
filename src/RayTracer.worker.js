import { camera, objects } from "./scene";
import { Vec2, Vec3 } from "./RMath";
import { Ray } from './Ray';

onmessage = (event) => {
	let eventType = event.data.type;
	const samplePerPixel = Math.pow(2, 15);
	if (eventType === 'initial') {
		console.log(`Render with ${samplePerPixel} samples per pixel`);
		camera.size = new Vec2(event.data.cameraSize.x, event.data.cameraSize.y);
		camera.canvasSize = new Vec2(event.data.canvasSize.x, event.data.canvasSize.y);
	} else if (eventType === 'renderRange') {
		let rangeStart = event.data.rangeStart;
		let rangeEnd = event.data.rangeEnd;
		let width = rangeEnd.x - rangeStart.x;
		let height = rangeEnd.y - rangeStart.y;
		let data = new Uint8ClampedArray(width * height * 4);
		let halfCameraSize = camera.size.divide(2);
		let step = camera.size.divideByVec2(camera.canvasSize);
		let focusPosition = camera.position.plus(camera.position.minus(camera.lookAt).scaleToLength(camera.focus));

		let cameraTopLeft = camera.position.plus(camera.leftVector.multiply(halfCameraSize.x)).plus(camera.topVector.multiply(halfCameraSize.y));
		let focusToTopLeft = cameraTopLeft.minus(focusPosition);
		for (let x = rangeStart.x; x < rangeEnd.x; x++) {
			for (let y = rangeStart.y; y < rangeEnd.y; y++) {
				// if (x === 234 && y === 565) {
				// 	startDebugging();
				// } else {
				// 	stopDebugging();
				// }
				let color = new Vec3(0, 0, 0);
				for (let s = 0; s < samplePerPixel; s++) {
					let samplePoint = camera.leftVector.multiply(step.x * (x + Math.random())).plus(camera.topVector.multiply(step.y * (y + Math.random())));
					let rays = [new Ray(focusPosition, focusToTopLeft.minus(samplePoint).normalize(), 0, 1)];
					color = color.plus(traceRay(rays, objects));
				}
				color = color.divide(samplePerPixel);

				let index = ((y - rangeStart.y) * width + (x - rangeStart.x)) * 4;
				data[index++] = color.x * 255;
				data[index++] = color.y * 255;
				data[index++] = color.z * 255;
				data[index++] = 255;
			}
		}
		postMessage({
			type: 'doneRender'
			, x: rangeStart.x
			, y: rangeStart.y
			, width: width
			, height: height
			, data: data
		});
	}
};

function traceRay(rays, objects) {
	let color = new Vec3(0, 0, 0);
	for (let ray of rays) {
		if (ray.iterationCounter > 8) {
			continue;
		}
		let distance = Number.POSITIVE_INFINITY;
		let collisionFunction = null;
		for (let object of objects) {
			let collision = object.getCollision(ray);
			let d = collision.next().value;
			if (d < distance) {
				distance = d;
				collisionFunction = collision;
			}
		}

		if (distance === Number.POSITIVE_INFINITY) {
			continue;
		}

		let newRays = collisionFunction.next().value;

		if (newRays === null) {
			color = color.plus(collisionFunction.next().value.multiply(ray.weight).multiplyByVec3(ray.absort));

		} else {
			color = color.plus(traceRay(newRays, objects).multiply(ray.weight).multiplyByVec3(ray.absort));
		}
	}
	return color;
}
