import { Vec3, Vec2 } from "./RMath";
import { isDebugging } from './debug';
import { generateRays, diffuseBRDF, reflectionBRDF, Material } from "./Shading";

export class Sphere {
	constructor() {
		if (arguments.length >= 2) {
			if (arguments[0] instanceof Vec3) {
				this.position = new Vec3(arguments[0]);
			} else {
				throw 'The first argument of constructor of Sphere must be type of Vec3';
			}
			if (typeof arguments[1] === 'number' && arguments[1] >= 0) {
				this.radius = arguments[1];
			} else {
				throw 'The second argument of constructor of Sphere must be a nonnegative number';
			}
			if (arguments.length > 2) {
				if (arguments[2] instanceof Material) {
					this.material = arguments[2];
				} else {
					throw 'The third argument of constructor of Sphere must be type of Material';
				}
			} else {
				this.material = new Material(diffuseBRDF);
			}
		} else {
			this.position = new Vec3();
			this.radius = 1.0;
			this.material = new Material(diffuseBRDF);
		}
	}

	* getCollision(ray) {
		let rayToCenter = ray.startPosition.minus(this.position);
		let a = ray.direction.dot(ray.direction);
		let b = 2 * ray.direction.dot(rayToCenter);
		let c = rayToCenter.dot(rayToCenter) - this.radius * this.radius;
		const threshold = 1e-5;
		// b^2 - 4ac;
		let d = b * b - 4 * a * c;
		let l;
		if (d < 0) {
			yield Number.POSITIVE_INFINITY;
		} else if (d === 0) {
			let root = -b / (2 * a);
			if (root > 0) {
				l = root;
				if (l < threshold) {
					yield Number.POSITIVE_INFINITY;
				} else {
					yield l;
				}
			} else {
				yield Number.POSITIVE_INFINITY;
			}
		} else {
			let squrD = Math.sqrt(d);
			let root = -b - squrD;
			if (root > 0) {
				l = root / (2 * a);
				if (l < threshold) {
					yield Number.POSITIVE_INFINITY;
				} else {
					yield l;
				}
			} else if ((root = -b + squrD) > 0) {
				l = root / (2 * a);
				if (l < threshold) {
					yield Number.POSITIVE_INFINITY;
				} else {
					yield l;
				}
			} else {
				yield Number.POSITIVE_INFINITY;
			}
		}
		let collisionPosition = ray.startPosition.plus(ray.direction.multiply(l));
		let normal = collisionPosition.minus(this.position).normalize();
		let newRays = generateRays(ray, collisionPosition, normal, this.material, 1);
		yield newRays;
		if (newRays === null) {
			yield this.material.baseColor;
		}
	}
}

export class Plane {
	constructor(position, firstVec, secondVec, material) {
		this.position = new Vec3(position);
		this.firstVec = new Vec3(firstVec);
		this.secondVec = new Vec3(secondVec);
		this.normal = this.firstVec.cross(this.secondVec).normalize();
		this.material = material;
	}

	*getCollision(ray) {
		const threshold = 1e-5;

		let h = ray.direction.cross(this.secondVec);
		let a = this.firstVec.dot(h);
		if (a > -threshold && a < threshold) {
			yield Number.POSITIVE_INFINITY;
		}

		let f = 1 / a;
		let s = ray.startPosition.minus(this.position);
		let u = f * s.dot(h);

		if (u < 0 || u > 1) {
			yield Number.POSITIVE_INFINITY;
		}

		let q = s.cross(this.firstVec);
		let v = f * ray.direction.dot(q);
		if (v < 0 || v > 1) {
			yield Number.POSITIVE_INFINITY;
		}

		let t = f * this.secondVec.dot(q);
		if (t > threshold) {
			yield t;
		} else {
			yield Number.POSITIVE_INFINITY;
		}

		let normal = this.normal;
		if (normal.dot(ray.direction) > 0) {
			normal = normal.negative();
		}
		let collisionPosition = ray.startPosition.plus(ray.direction.multiply(t));
		let newRays = generateRays(ray, collisionPosition, normal, this.material, 1);
		yield newRays;
		if (newRays === null) {
			yield this.material.baseColor;
		}
	}
}

export class DirectionalLight {
	constructor(direction, color) {
		this.direction = direction.normalize();
		this.color = new Vec3(color);
	}

	* getCollision(ray) {
		if (ray.iterationCounter > 0 && this.direction.negative().dot(ray.direction) > 0) {
			yield 1e9;
			yield null;
			yield this.color;
		} else {
			yield Number.POSITIVE_INFINITY;
		}
	}
}

export class Camera {
	constructor() {
		this.position = new Vec3();
		this.lookAt = new Vec3();
		this.top = new Vec3(0, 0, 1);
		this.focus = 0;
		this.size = new Vec2();
		this.canvasSize = new Vec2();
	}

	setView(position, lookAt, top) {
		this.position = new Vec3(position);
		this.lookAt = new Vec3(lookAt);
		this.top = new Vec3(top);

		let viewDir = this.lookAt.minus(this.position);
		this.leftVector = this.top.cross(viewDir).normalize();
		this.topVector = viewDir.cross(this.leftVector).normalize();
	}
}