import Color from './Color.js';
import Point from './Point.js';
import Segment from './Segment.js';
import Animal from './Animal.js';
import { Eye, BackFin, SideFin, TailFin, BodyPart, Antenna, Leg } from './BodyPart.js';

/** Describes an animal. */
export class AnimalDescriptor {
	/**
	 * Creates an AnimalDescriptor object.
	 * @param {SegmentDescriptor[]} segmentDescriptors The segments of the animal.
	 * @param {number} turnAngle The maximum angle the animal can turn with.
	 * @param {Color} color The color of the body.
	 * @param {number} speed The speed of the animal.
	 */
	constructor(segmentDescriptors, turnAngle, color, speed) {
		this.segmentDescriptors = segmentDescriptors;
		this.turnAngle = turnAngle;
		this.color = color;
		this.speed = speed;
	}

	/**
	 * Creates an Animal object by this descriptor.
	 * @param {Point} headPosition The head starting position.
	 * @returns The Animal object.
	 */
	create(headPosition) { return new Animal(headPosition, this.segmentDescriptors, this.turnAngle, this.color, this.speed); }
}

/** Describes a segment. */
export class SegmentDescriptor {
	/**
	 * Creates a SegmentDescriptor object.
	 * @param {number} segmentDistance The distance form the previous segment.
	 * @param {number} skinRadius The radius of the skin at the segment.
	 * @param {BodyPartDescriptor[]} bodyPartDescriptors The body parts of the segment.
	 */
	constructor(segmentDistance, skinRadius, bodyPartDescriptors = undefined) {
		this.segmentDistance = segmentDistance;
		this.skinRadius = Math.abs(skinRadius);
		this.bodyPartDescriptors = bodyPartDescriptors;
	}

	/**
	 * Creates a Segment object by this descriptor.
	 * @returns The Segment object.
	 */
	create(prevOrigin) {
		return new Segment(
			new Point(prevOrigin.x - this.segmentDistance, prevOrigin.y),
			Math.abs(this.segmentDistance),
			this.skinRadius,
			this.bodyPartDescriptors
		);
	}
}

/** Describes a segment with turning angles. */
export class AngledSegmentDescriptor extends SegmentDescriptor {
	/**
	 * Creates a LegSegmentDescriptor object.
	 * @param {number} segmentDistance The distance form the previous segment.
	 * @param {number} skinRadius The radius of the skin at the segment.
	 * @param {number} minAngle The minimum angle of the joint.
	 * @param {number} maxAngle The maximum angle of the joint.
	 * @param {BodyPartDescriptor[]} bodyPartDescriptors The body parts of the segment.
	 */
	constructor(segmentDistance, skinRadius, minAngle, maxAngle, bodyPartDescriptors = null) {
		super(segmentDistance, skinRadius, bodyPartDescriptors);

		if (this.minAngle > this.maxAngle)
			throw "The maxAngle should be bigger or equal than minAngle!"

		this.minAngle = minAngle;
		this.maxAngle = maxAngle;
	}

	/**
	 * Creates a Segment object by this descriptor.
	 * @param {Point} prevOrigin The origin of the previous segment.
	 * @returns The Segment object.
	 */
	create(prevOrigin) {
		const segment = new Segment(
			new Point(prevOrigin.x - this.segmentDistance, prevOrigin.y),
			Math.abs(this.segmentDistance),
			this.skinRadius,
			this.bodyPartDescriptors
		);

		segment.maxAngle = this.maxAngle;
		segment.minAngle = this.minAngle;

		return segment;
	}
}

/** Describes a body part. */
export class BodyPartDescriptor {
	/**
	 * Creates a BodyPartDescriptor object.
	 * @param {boolean} render Where to render.
	 * @param {Color} color The color of the body part.
	 */
	constructor(render, color) {
		this.render = render;
		this.color = color;
	}

	/**
	 * Creates a BodyPart object by this descriptor.
	 * @param {Segment} segment The parent segment.
	 * @returns The BodyPart object.
	 */
	create(segment) { throw "This function must be implemented in an inherited class!"; }
}

/** Describes an eye. */
export class EyeDescriptor extends BodyPartDescriptor {
	/**
	 * Creates an EyeDescriptor object.
	 * @param {number} angleToFront The angle to push the eye from the center of the segment.
	 * @param {number} distanceToOrigin The distance to push the eye from the center of the segment.
	 * @param {number} radius The radius of the eye.
	 * @param {Color} color The color of the body part.
	 * @param {boolean} render Where to render.
	 */
	constructor(angleToFront, distanceToOrigin, radius, color, render = BodyPart.TOP) {
		super(render, color);

		this.degreeToFront = Math.abs(angleToFront);
		this.distanceToOrigin = Math.abs(distanceToOrigin);
		this.radius = Math.abs(radius);
	}

	/**
	 * Creates an Eye object by this descriptor.
	 * @param {Segment} segment The parent segment.
	 * @returns The Eye object.
	 */
	create(segment) { return new Eye(segment, this.render, this.degreeToFront, this.distanceToOrigin, this.radius, this.color); }
}

/** Describes a fin. */
export class SideFinDescriptor extends BodyPartDescriptor {
	/**
	 * Creates a SideFinDescriptor object.
	 * @param {number} length The length of the fin.
	 * @param {number} width The width of the fin.
	 * @param {number} angle The angle of the fin.
	 * @param {Color} color The color of the fin.
	 * @param {boolean} render Where to render.
	 */
	constructor(length, width, angle, color, render = BodyPart.BOTTOM) {
		super(render, color);

		this.length = Math.abs(length);
		this.width = Math.abs(width);
		this.angle = angle;
	}

	/**
	 * Creates a SideFin object by this descriptor.
	 * @param {Segment} segment The parent segment.
	 * @returns The SideFin object.
	 */
	create(segment) { return new SideFin(segment, this.render, this.length, this.width, this.angle, this.color); }
}

/** Describes a fin. */
export class BackFinDescriptor extends BodyPartDescriptor {
	/**
	 * Creates a BackFinDescriptor object.
	 * @param {number} lengthInSegments The number of segments the fin will go through.
	 * @param {Color} color The color of the fin.
	 * @param {boolean} render Where to render.
	 */
	constructor(lengthInSegments, color, render = BodyPart.TOP) {
		super(render, color);

		this.lengthInSegments = lengthInSegments;
	}

	/**
	 * Creates a BackFin object by this descriptor.
	 * @param {Segment} segment The parent segment.
	 * @returns The BackFin object.
	 */
	create(segment) { return new BackFin(segment, this.render, this.lengthInSegments, this.color); }
}

/** Describes a fin. */
export class TailFinDescriptor extends BodyPartDescriptor {
	/**
	 * Creates a TailFinDescriptor object.
	 * @param {number[]} segmentDistances The distances of the segments of the fin.
	 * @param {Color} color The color of the fin.
	 * @param {boolean} render Where to render.
	 */
	constructor(segmentDistances, color, render = BodyPart.BOTTOM) {
		super(render, color);

		this.segmentDistances = segmentDistances;
	}

	/**
	 * Creates a TailFin object by this descriptor.
	 * @param {Segment} segment The parent segment.
	 * @returns The TailFin object.
	 */
	create(segment) { return new TailFin(segment, this.render, this.segmentDistances, this.color); }
}

/** Describes an antenna. */
export class AntennaDescriptor extends BodyPartDescriptor {
	/**
	 * Creates an AntennaDescriptor object.
	 * @param {AntennaSegmentDescriptor[]} antennaSegmentDescriptors The segments of the antenna.
	 * @param {number} angle The angle to push the eye from the center of the segment.
	 * @param {Color} color The color of the antenna.
	 * @param {boolean} render Where to render.
	 */
	constructor(antennaSegmentDescriptors, angle, color, render = BodyPart.TOP) {
		super(render, color);

		this.segmentDescriptors = antennaSegmentDescriptors;
		this.angle = angle;
	}

	/**
	 * Creates an Antenna object by this descriptor.
	 * @param {Segment} segment The parent segment.
	 * @returns The Antenna object.
	 */
	create(segment) { return new Antenna(segment, this.render, this.segmentDescriptors, this.angle, this.color); }
}

/** Describes a segment of an antenna. */
export class AntennaSegmentDescriptor extends SegmentDescriptor {
	/**
	 * Creates an AntennaSegmentDescriptor object.
	 * @param {number} segmentDistance The distance form the previous segment.
	 * @param {number} skinRadius The radius of the skin at the segment.
	 * @param {number} angle The angle of the segment from the previous one.
	 */
	constructor(segmentDistance, skinRadius, angle) {
		super(segmentDistance, skinRadius);

		this.angle = angle;
	}

	/**
	 * Creates a Segment object by this descriptor.
	 * @param {Point} prevOrigin The origin of the previous segment.
	 * @returns The Segment object.
	 */
	create(prevOrigin) {
		return new Segment(
			Point.rotateDegree(new Point(prevOrigin.x - this.segmentDistance, prevOrigin.y), this.angle),
			this.segmentDistance,
			this.skinRadius,
			null
		);
	}
}

/** Describes a leg. */
export class LegDescriptor extends BodyPartDescriptor {
	/**
	 * Creates a LegDescriptor object.
	 * @param {LegSegmentDescriptor[]} legSegmentDescriptors The segments of the leg.
	 * @param {Point} stepTo The position to step to.
	 * @param {Color} color The color of the leg.
	 * @param {boolean} render Where to render.
	 */
	constructor(legSegmentDescriptors, stepTo, color, render = BodyPart.BOTTOM) {
		super(render, color);

		this.segmentDescriptors = legSegmentDescriptors;
		this.stepTo = stepTo;
	}

	/**
	 * Creates a Leg object by this descriptor.
	 * @param {Segment} segment The parent segment.
	 * @returns The Leg object.
	 */
	create(segment) { return new Leg(segment, this.render, this.segmentDescriptors, this.stepTo, this.color); }
}

/** Describes a segment of a leg. */
export class LegSegmentDescriptor extends AngledSegmentDescriptor {
	/**
	 * Creates a LegSegmentDescriptor object.
	 * @param {number} segmentDistance The distance form the previous segment.
	 * @param {number} skinRadius The radius of the skin at the segment.
	 * @param {number} minAngle The minimum angle of the joint.
	 * @param {number} maxAngle The maximum angle of the joint.
	 * @param {BodyPartDescriptor[]} bodyPartDescriptors The body parts of the segment.
	 */
	constructor(segmentDistance, skinRadius, minAngle, maxAngle, bodyPartDescriptors = null) {
		super(segmentDistance, skinRadius, minAngle, maxAngle, bodyPartDescriptors);
	}

	/**
	 * Mirrors the position one LegSegmentDescriptor.
	 * @param {LegSegmentDescriptor} descriptor The LegSegmentDescriptor to mirror.
	 * @returns A new LegSegmentDescriptor object with mirrored coordinates.
	 */
	static mirror(descriptor) {
		return new LegSegmentDescriptor(
			-descriptor.segmentDistance,
			descriptor.skinRadius,
			-descriptor.maxAngle,
			-descriptor.minAngle,
			descriptor.bodyPartDescriptors
		);
	}

	/**
	 * Creates a Segment object by this descriptor.
	 * @param {Point} prevOrigin The origin of the previous segment.
	 * @returns The Segment object.
	 */
	create(prevOrigin) {
		const segment = new Segment(
			new Point(prevOrigin.x, prevOrigin.y - this.segmentDistance),
			Math.abs(this.segmentDistance),
			this.skinRadius,
			this.bodyPartDescriptors
		);

		segment.maxAngle = this.maxAngle;
		segment.minAngle = this.minAngle;

		return segment;
	}
}