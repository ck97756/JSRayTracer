import { Camera } from './Object';
import { Vec2 } from './RMath';
import RenderWorker from './RayTracer.worker.js';

// console.log(RenderWorker);
function main() {
	let objects = [];
	let camera = new Camera();
	let canvas;
	let canvasContext;
	let imageBuffer;

	//Setup canvas
	canvas = document.getElementById('canvas');
	canvasContext = canvas.getContext('2d');
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	camera.size = new Vec2(10, 10 * canvas.height / canvas.width);
	camera.canvasSize = new Vec2(canvas.width, canvas.height);
	imageBuffer = new Uint8ClampedArray(canvas.width * canvas.height * 4);

	// window.addEventListener('resize', () => {
		// canvas.width = canvas.clientWidth;
		// canvas.height = canvas.clientHeight;
		// camera.size = new Vec2(10, 10 * canvas.height / canvas.width);
		// camera.canvasSize = new Vec2(canvas.width, canvas.height);
		// imageBuffer = new Uint8ClampedArray(canvas.width * canvas.height * 4);
	// });

	canvas.addEventListener('click', (event) => {
		console.log(`position: ${event.offsetX}, ${event.offsetY}`);
		let imageData = canvasContext.getImageData(event.offsetX, event.offsetY, 1, 1);
		console.log(`color: ${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}`);
	});

	//Setup worker
	const threadCount = 3;
	let tileSize = 20;
	let tileCount = new Vec2(Math.ceil(camera.canvasSize.x / tileSize), Math.ceil(camera.canvasSize.y / tileSize));
	let workers = [];

	let currentTileX = 0;
	let currentTileY = 0;

	let startTime = performance.now();

	for (let t = 0; t < threadCount; t++) {
		let worker = new RenderWorker();

		worker.onmessage = (event) => {
			let eventType = event.data.type;
			if (eventType === 'doneRender') {
				let x = event.data.x;
				let y = event.data.y;
				let width = event.data.width;
				let height = event.data.height;
				let imageBuffer = new Uint8ClampedArray(event.data.data);
				canvasContext.putImageData(new ImageData(imageBuffer, width, height), x, y);
				arrangeTile(worker);
			}
		};

		worker.postMessage({
			type: 'initial'
			, cameraSize: new Vec2(10, 10 * canvas.height / canvas.width)
			, canvasSize: new Vec2(canvas.width, canvas.height)
		});

		arrangeTile(worker);

		workers.push(worker);
	}

	function arrangeTile(worker) {
		if (currentTileX >= tileCount.x) {
			currentTileX = 0;
			currentTileY += 1;
		}
		if (currentTileY >= tileCount.y) {
			//done rendering
			let endTime = performance.now();
			let timeDiff = endTime - startTime;
			printMillisecond(timeDiff);
			return;
		}

		let endX = tileSize * (currentTileX + 1);
		let endY = tileSize * (currentTileY + 1);
		if (currentTileX === tileCount.x - 1) {
			endX = camera.canvasSize.x;
		}
		if (currentTileY === tileCount.y - 1) {
			endY = camera.canvasSize.y;
		}
		worker.postMessage({
			type: 'renderRange'
			, rangeStart: new Vec2(tileSize * currentTileX, tileSize * currentTileY)
			, rangeEnd: new Vec2(endX, endY)
		});

		currentTileX++;
	}
}

function printMillisecond(time) {
	let outStr = '';
	let millisecond = time % 1000;
	let second = Math.floor(time / 1000);
	let minute = Math.floor(second / 60);
	let hour = Math.floor(minute / 60);
	let day = Math.floor(hour / 24);

	second = second % 60;
	minute = minute % 60;
	hour = hour % 24;

	let num = [day, hour, minute, second];
	const unit = ['day', 'hour', 'minute', 'second'];

	let startFrom = 0;
	for (; startFrom < num.length; startFrom++){
		if (num[startFrom] > 0) {
			break;
		}
	}
	for (; startFrom < num.length; startFrom++){
		if (num[startFrom] > 1) {
			outStr = `${outStr}${num[startFrom]} ${unit[startFrom]}s `;
		} else {
			outStr = `${outStr}${num[startFrom]} ${unit[startFrom]} `;
		}
	}
	if (millisecond > 1) {
		outStr = `${outStr}${millisecond} milliseconds`;
	} else {
		outStr = `${outStr}${millisecond} millisecond`;
	}

	console.log(outStr);
}

document.addEventListener("DOMContentLoaded", () => {
	main();
}, false);