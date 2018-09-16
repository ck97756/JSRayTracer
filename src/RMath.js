export class Vec3 {
	constructor() {
		if (arguments.length === 1 && arguments[0] instanceof Vec3) {
			this.x = arguments[0].x;
			this.y = arguments[0].y;
			this.z = arguments[0].z;
		} else if (arguments.length === 3) {
			this.x = arguments[0];
			this.y = arguments[1];
			this.z = arguments[2];
		} else {
			this.x = 0;
			this.y = 0;
			this.z = 0;
		}
	}

	plus(r) {
		return new Vec3(
			this.x + r.x
			, this.y + r.y
			, this.z + r.z
		);
	}

	minus(r) {
		return new Vec3(
			this.x - r.x
			, this.y - r.y
			, this.z - r.z
		);
	}

	multiply(r) {
		return new Vec3(
			this.x * r
			, this.y * r
			, this.z * r
		);
	}

	scaleToLength(l) {
		let length = this.length();
		let scale = l / length;
		return new Vec3(
			this.x * scale
			, this.y * scale
			, this.z * scale
		);
	}

	normalize() {
		return this.scaleToLength(1);
	}

	cross(r) {
		return new Vec3(
			this.y * r.z - this.z * r.y
			, this.z * r.x - this.x * r.z
			, this.x * r.y - this.y * r.x
		);
	}

	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	dot(r) {
		return this.x * r.x + this.y * r.y + this.z * r.z;
	}

	negative() {
		return new Vec3(
			-this.x
			, -this.y
			, -this.z
		);
	}

	multiplyByVec3(r) {
		return new Vec3(
			this.x * r.x
			, this.y * r.y
			, this.z * r.z
		);
	}

	divide(r) {
		return new Vec3(
			this.x / r
			, this.y / r
			, this.z / r
		);
	}

	projectOnto(r) {
		return r.multiply(this.dot(r.normalize()));
	}

	projectLength(r) {
		return this.dot(r.normalize());
	}
}

export class Vec2 {
	constructor() {
		if (arguments.length === 1 && arguments[0] instanceof Vec2) {
			this.x = arguments[0].x;
			this.y = arguments[0].y;
		} else if (arguments.length === 2) {
			this.x = arguments[0];
			this.y = arguments[1];
		} else {
			this.x = 0;
			this.y = 0;
		}
	}

	divide(r) {
		return new Vec2(this.x / r, this.y / r);
	}

	divideByVec2(r) {
		return new Vec2(this.x / r.x, this.y / r.y);
	}

	multiplyByVec2(r) {
		return new Vec2(this.x * r.x, this.y * r.y);
	}

	floor() {
		return new Vec2(Math.floor(this.x), Math.floor(this.y));
	}

	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}

export class Quaternion {
	constructor(w, x, y, z) {
		this.w = w;
		this.x = x;
		this.y = y;
		this.z = z;
	}
}