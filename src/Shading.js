import { Vec3 } from "./RMath";
import { Ray } from "./Ray";
import { isDebugging } from "./debug";

export class Material {
	constructor(BRDF, materialParam) {
		this.BRDF = BRDF;
		this.baseColor = materialParam.baseColor || new Vec3(1, 1, 1);
		this.materialParam = materialParam;
	}
}

export function generateRays(ray, position, normal, material, numberOfRay) {
	let BRDF = material.BRDF;
	let absort = ray.absort.multiplyByVec3(material.baseColor);
	if (BRDF.numberOfRay === null) {
		return null;
	}
	if (BRDF.numberOfRay && numberOfRay > BRDF.numberOfRay) {
		numberOfRay = BRDF.numberOfRay;
	}
	let newRays = new Array(numberOfRay);
	let totalEnergy = BRDF.totalEnergy(numberOfRay);
	for (let lightCount = 0; lightCount < numberOfRay; lightCount++) {
		let direction = BRDF.generateDirection(normal, ray, material);
		let energy = BRDF.BRDF(normal, direction);
		let newRay = new Ray(position, direction, ray.iterationCounter + 1, energy / totalEnergy, absort);
		if (material.materialParam.ior !== undefined) {
			newRay.ior = material.materialParam.ior;
		}
		newRays[lightCount] = newRay;
	}

	return newRays;
}

export const diffuseBRDF = {
	generateDirection(normal, ray) {
		if (normal.dot(ray.direction) > 0) {
			normal = normal.negative();
		}
		let direction = new Vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
		while (direction.dot(normal) < 0.1) {
			direction = direction.negative();
			if (direction.dot(normal) < 0.1) {
				direction = new Vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1).normalize();
			} else {
				break;
			}
		}
		return direction;
	}
	, totalEnergy(numberOfRay) {
		return numberOfRay;
	}
	, BRDF() {
		return 1;
	}
};

export const emissionBRDF = {
	numberOfRay: null
};

export const reflectionBRDF = {
	generateDirection(normal, ray) {
		let direction = normal.multiply(2).minus(ray.direction);
		return direction;
	}
	, totalEnergy() {
		return 1;
	}
	, BRDF() {
		return 1;
	}
	, numberOfRay: 1
};