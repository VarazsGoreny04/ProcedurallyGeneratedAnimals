import { BodyPartDescriptor, SegmentDescriptor } from './Descriptor.js';
import Point from './Point.js';

/** Describes a segment of a creature. */
export default class Segment {
	/**
	 * Creates a Segment object.
	 * @param {Point} origin The position of the segment.
	 * @param {number} distanceFromPrev The distance of this segment from the previous one.
	 * @param {number} skinRadius The width of the creature at this segment.
	 * @param {BodyPartDescriptor[]} bodyParts The additional bodyParts.
	 */
	constructor(origin, distanceFromPrev, skinRadius, bodyParts = null) {
		this.origin = origin;
		this.distanceFromPrev = distanceFromPrev;
		this.skinRadius = skinRadius;
		this.maxAngle = Math.min(20 * this.distanceFromPrev / this.skinRadius, 60);
		this.minAngle = -this.maxAngle;

		if (bodyParts instanceof Array) {
			const createdBodyParts = [];
			for (const bodyPart of bodyParts)
				createdBodyParts.push(bodyPart.create(this));

			this.bodyParts = createdBodyParts;
		}
		else
			this.bodyParts = null;

		this.prevSegment = null;
		this.nextSegment = null;
	}

	/** Iterates through the segments. */
	*[Symbol.iterator]() {
		let current = this;
		while (current) {
			yield current;
			current = current.nextSegment;
		}
	}

	/**
	 * Creates the segments by the given descriptors and links them together.
	 * @param {Point} startingPoint The starting position of the first segment.
	 * @param {SegmentDescriptor[]} segmentDescriptors The descriptors of the segments.
	 * @returns The head segment of the linked list.
	 */
	static createAndLink(startingPoint, segmentDescriptors) {
		const result = segmentDescriptors[0].create(startingPoint);

		let prev = result;
		let next;

		for (let index = 1; index < segmentDescriptors.length; ++index) {
			next = segmentDescriptors[index].create(prev.origin);

			prev.nextSegment = next;
			next.prevSegment = prev;

			prev = next;
		}

		Segment.pullNext(result);

		return result;
	}

	/**
	 * Pulls the given neighbour segment towards this segment.
	 * @param {Segment} segment The segment to pull towards.
	 * @param {Segment} segmentToPull The segment to pull.
	 * @param {number} distanceBetween The needed distance in between the two segments.
	 * @param {Segment} segmentInFront The segment on the other side of the main segment.
	 */
	static pull(segment, segmentToPull, distanceBetween, segmentInFront = null) {
		const fromSegmentToNext = Point.subtract(segmentToPull.origin, segment.origin);
		let toJoinPoint = Point.scale(fromSegmentToNext, distanceBetween);

		if (segmentInFront instanceof Segment)
			toJoinPoint = Segment.restrictAngleOfRotation(segment, segmentInFront, toJoinPoint);

		segmentToPull.origin = Point.add(segment.origin, toJoinPoint);
	}

	/**
	 * Pulls the next segment of the given segment.
	 * @param {Segment} segment The given segment.
	 */
	static pullNext(segment) {
		if (segment.nextSegment instanceof Segment) {
			Segment.pull(segment, segment.nextSegment, segment.nextSegment.distanceFromPrev, segment.prevSegment);

			Segment.pullNext(segment.nextSegment);
		}
	}

	/**
	 * Pulls the previous segment of the given segment.
	 * @param {Segment} segment The given segment.
	 */
	static pullPrev(segment) {
		if (segment.prevSegment instanceof Segment) {
			Segment.pull(segment, segment.prevSegment, segment.distanceFromPrev, segment.nextSegment);

			Segment.pullPrev(segment.prevSegment);
		}
	}

	/**
	 * Gets the front vector of the given segment.
	 * @param {Segment} segment The given segment.
	 * @throws If the segment has no neighbours.
	 * @returns The calculated vector.
	 */
	static getFrontVector(segment) {
		let prev = segment.prevSegment;
		let next = segment.nextSegment;

		if (!(prev instanceof Segment) && !(next instanceof Segment))
			throw "Not enough segments!";

		prev ??= segment;
		next ??= segment;

		const vector = Point.subtract(prev.origin, next.origin);

		return Point.scale(vector, segment.skinRadius);
	}

	/**
	 * Gets the outline points of the segment list.
	 * @param {Segment} headSegment The head segment.
	 * @returns The outline points.
	 */
	static getPoints(headSegment) {
		const roundNoseAngle = radians(45);

		const frontVector = Segment.getFrontVector(headSegment);

		const left = [
			Point.add(headSegment.origin, frontVector),
			Point.add(headSegment.origin, Point.rotateRadian(frontVector, roundNoseAngle))
		];
		const right = [
			Point.add(headSegment.origin, Point.rotateRadian(frontVector, -roundNoseAngle))
		];

		let tailSegment;

		for (const segment of headSegment) {
			let front = Segment.getFrontVector(segment);

			left.push(Point.add(segment.origin, Point.normalLeft(front)));
			right.push(Point.add(segment.origin, Point.normalRight(front)));

			tailSegment = segment;
		}

		const backVector = Point.reverse(Segment.getFrontVector(tailSegment));

		left.push(Point.add(tailSegment.origin, Point.rotateRadian(backVector, -roundNoseAngle)));
		right.push(Point.add(tailSegment.origin, Point.rotateRadian(backVector, roundNoseAngle)));

		left.push(Point.add(tailSegment.origin, backVector));

		return left.reverse().concat(right);
	}

	/**
	 * Draws all the body parts of the given segment set to the given render mode.
	 * @param {Segment} segment The segment with the body parts.
	 * @param {boolean} render The render mode.
	 */
	static drawBodyParts(segment, render) {
		if (segment.bodyParts instanceof Array) {
			for (const bodyPart of segment.bodyParts) {
				if (bodyPart.render === render)
					bodyPart.draw();
			}
		}
	}

	/**
	 * Restricts the given direction vector by the vector created between the two segments and the angle properties of the first segment.
	 * @param {Segment} firstSegment The first segment.
	 * @param {Segment} secondSegment The second segment.
	 * @param {Point} direction The vector to restrict.
	 * @returns The restricted vector.
	 */
	static restrictAngleOfRotation(firstSegment, secondSegment, direction) {
		const fromSecondToFirst = Point.subtract(firstSegment.origin, secondSegment.origin);

		return Point.restrictAngleOfRotation(fromSecondToFirst, direction, firstSegment.minAngle, firstSegment.maxAngle);
	}
}