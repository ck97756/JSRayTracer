import { Vec3 } from './RMath';

export class Ray{
	constructor(startPosition, direction, iterationCount, weight, absort) {
		this.startPosition = startPosition;
		if (direction === null) {
			this.direction = null;
		} else {
			this.direction = direction.normalize();
		}
		this.iterationCounter = iterationCount;
		this.weight = weight;
		this.absort = absort ? new Vec3(absort) : new Vec3(1, 1, 1);
		this.ior = 1.000277;
	}
}