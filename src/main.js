import { Camera } from './Object';
import { Vec2, Vec3 } from './RMath';

import RenderWorker from './RayTracer.worker.js';

class PixelInfo {
	constructor(x, y, remainIterator) {
		this.x = x;
		this.y = y;
		this.remainIterator = remainIterator;
	}
}

class PixelData {
	constructor() {
		this.color = new Vec3();
		this.iteratorCount = 0;
	}

	addColor(color) {
		this.color = this.color.plus(color);
		this.iteratorCount++;
	}

	getPixel() {
		let color = this.color.divide(this.iteratorCount);
		let result = new Uint8ClampedArray(4);
		result[0] = color.x * 255;
		result[1] = color.y * 255;
		result[2] = color.z * 255;
		result[3] = 255;
		return result;
	}
}

// console.log(RenderWorker);
function main() {
	let camera = new Camera();
	let canvas;
	let canvasContext;
	let pixelDatas;
	let pixelCount;
	//Setup canvas
	canvas = document.getElementById('canvas');
	canvasContext = canvas.getContext('2d');
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	camera.size = new Vec2(10, 10 * canvas.height / canvas.width);
	camera.canvasSize = new Vec2(canvas.width, canvas.height);
	pixelCount = canvas.width * canvas.height;

	pixelDatas = new Array(pixelCount);

	let pixelInfos = new Array(pixelCount);
	let pixelIndex = 0;
	let iteratorCount = Math.pow(2, 12);
	for (let x = 0; x < canvas.width; x++) {
		for (let y = 0; y < canvas.height; y++) {
			pixelInfos[pixelIndex] = new PixelInfo(x, y, iteratorCount);
			pixelDatas[pixelIndex] = new PixelData();
			pixelIndex++;

		}
	}

	canvas.addEventListener('click', (event) => {
		console.log(`position: ${event.offsetX}, ${event.offsetY}`);
		let imageData = canvasContext.getImageData(event.offsetX, event.offsetY, 1, 1);
		console.log(`color: ${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]}`);
	});

	//Setup worker
	let nextThreadCount = 1;
	let threadCount = nextThreadCount;
	window.getProgress = () => {
		let totalIterator = iteratorCount * canvas.width * canvas.height;
		let remainIterator = 0;
		for (let info of pixelInfos) {
			remainIterator += info.remainIterator;
		}
		return 1 - (remainIterator / totalIterator);
	}

	window.setThreadCount = function (value) {
		nextThreadCount = value;
		for (; threadCount < nextThreadCount; threadCount++) {
			let worker = new RenderWorker();
			worker.onmessage = (event) => {
				let eventType = event.data.type;
				if (eventType === 'doneRender') {
					let x = event.data.x;
					let y = event.data.y;
					let pixelIndex = y * canvas.width + x;
					let color = new Vec3(...event.data.data);
					let pixelData = pixelDatas[pixelIndex];
					pixelData.addColor(color);
					canvasContext.putImageData(new ImageData(pixelData.getPixel(), 1, 1), x, y);
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
	}
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
				let pixelIndex = y * canvas.width + x;
				let color = new Vec3(...event.data.data);
				let pixelData = pixelDatas[pixelIndex];
				pixelData.addColor(color);
				canvasContext.putImageData(new ImageData(pixelData.getPixel(), 1, 1), x, y);
				arrangeTile(worker);
			}
		};;

		worker.postMessage({
			type: 'initial'
			, cameraSize: new Vec2(10, 10 * canvas.height / canvas.width)
			, canvasSize: new Vec2(canvas.width, canvas.height)
		});

		arrangeTile(worker);

		workers.push(worker);
	}

	function arrangeTile(worker) {
		if (nextThreadCount < threadCount) {
			worker.terminate();
			workers.splice(workers.indexOf(worker), 1);
			threadCount--;
			return;
		}

		if (pixelCount <= 0) {
			let endTime = performance.now();
			let timeDiff = endTime - startTime;
			printMillisecond(timeDiff);
			return;
		}

		let currentPixelIndex = Math.floor(Math.random() * pixelCount);
		let currentPixel = pixelInfos[currentPixelIndex];
		currentPixel.remainIterator--;
		if (currentPixel.remainIterator <= 0) {
			pixelInfos.splice(currentPixelIndex, 1);
			pixelCount--;
		}

		worker.postMessage({
			type: 'renderRange'
			, rangeStart: new Vec2(currentPixel.x, currentPixel.y)
			, rangeEnd: new Vec2(currentPixel.x + 1, currentPixel.y + 1)
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
	for (; startFrom < num.length; startFrom++) {
		if (num[startFrom] > 0) {
			break;
		}
	}
	for (; startFrom < num.length; startFrom++) {
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