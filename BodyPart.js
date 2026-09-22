import * as bezierLine from './bezierLine.js';
import Color from './Color.js';
import Point from './Point.js';
import Segment from './Segment.js';
import {
	AntennaSegmentDescriptor,
	LegSegmentDescriptor,
	SegmentDescriptor
} from './Descriptor.js';

/** Describes a body part of a creature. */
export class BodyPart {
	/** Render on top. */
	static TOP = true;
	/** Render on bottom. */
	static BOTTOM = false;

	/**
	 * Creates a BodyPart object.
	 * @param {Segment} segment The parent segment.
	 * @param {boolean} render Where to render.
	 * @param {Color} color The color of the body part.
	 */
	constructor(segment, render, color) {
		this.segment = segment;
		this.render = render;
		this.color = color;
	}

	/** Draws this body part instance. */
	draw() { throw "This function must be implemented in an inherited class!"; }
}

/** Describes one pair of eyes of a creature. */
export class Eye extends BodyPart {
	/**
	 * Creates an Eye object.
	 * @param {Segment} segment The parent segment.
	 * @param {boolean} render Where to render.
	 * @param {number} angleToFront The angle of the eye from the front vector of the segment.
	 * @param {number} distanceToOrigin The distance of the eye from the center of the segment.
	 * @param {number} diameter The diameter of the eye.
	 * @param {Color} color The color of the eye.
	 */
	constructor(segment, render, angleToFront, distanceToOrigin, diameter, color) {
		super(segment, render, color);

		this.angleToFront = angleToFront;
		this.distanceToOrigin = distanceToOrigin;
		this.diameter = diameter;
	}

	/** Draws this eye instance. */
	draw() {
		fill(this.color.r, this.color.g, this.color.b, this.color.a);

		const frontScaled = Point.scale(Segment.getFrontVector(this.segment), this.distanceToOrigin);
		const radianToFront = radians(this.angleToFront);

		const eyePoint = Point.add(this.segment.origin, Point.rotateRadian(frontScaled, radianToFront));
		ellipse(eyePoint.x, eyePoint.y, this.diameter, this.diameter);

		const eyePointMirrored = Point.add(this.segment.origin, Point.rotateRadian(frontScaled, -radianToFront));
		ellipse(eyePointMirrored.x, eyePointMirrored.y, this.diameter, this.diameter);
	}
}

/** Describes a pair of fins of a creature. */
export class SideFin extends BodyPart {
	/**
	 * Creates a SideFin object.
	 * @param {Segment} segment The parent segment.
	 * @param {boolean} render Where to render.
	 * @param {*} width The width of the fin.
	 * @param {*} length The length of the fin.
	 * @param {*} angle The angle between the fin and the spine of the animal.
	 * @param {Color} color The color of the fin.
	 */
	constructor(segment, render, width, length, angle, color) {
		super(segment, render, color);

		this.width = width;
		this.length = length;
		this.angle = angle;
	}

	/**
	 * Draws an ellipse.
	 * @param {Point} position The position of the ellipse.
	 * @param {number} angle The angle of the ellipse.
	 * @param {number} width The width of the ellipse.
	 * @param {number} length The height of the ellipse.
	 */
	static drawEllipseByOrientation(position, angle, width, length) {
		translate(position.x, position.y);
		rotate(radians(angle));

		ellipse(-(length / 2), 0, length, width);

		resetMatrix();
	}

	/** Draws this fin instance. */
	draw() {
		fill(this.color.r, this.color.g, this.color.b, this.color.a);

		const front = Segment.getFrontVector(this.segment);
		const frontAngle = Point.angleOfVector(front);

		const originLeft = Point.add(this.segment.origin, Point.normalLeft(front));
		SideFin.drawEllipseByOrientation(originLeft, frontAngle - this.angle, this.width, this.length);

		const originRight = Point.add(this.segment.origin, Point.normalRight(front));
		SideFin.drawEllipseByOrientation(originRight, frontAngle + this.angle, this.width, this.length);
	}
}

/** Describes the back fin of a creature. */
export class BackFin extends BodyPart {
	/**
	 * Creates a BackFin object.
	 * @param {Segment} segment The parent segment.
	 * @param {boolean} render Where to render.
	 * @param {number} lengthInSegments The number of segments the fin will go through.
	 * @param {Color} color The color of the body part.
	 */
	constructor(segment, render, lengthInSegments, color) {
		super(segment, render, color);

		if (lengthInSegments < 2)
			throw "A backfin must have a length of 2 or more!";

		this.lengthInSegments = lengthInSegments;
	}

	/**
	 * Calculates the outline points of the fin.
	 * @param {BackFin} fin The fin to calculate with.
	 * @returns The calculated points.
	 */
	static getPoints(fin) {
		const points = [];

		let counter = 0;
		for (const nextSegment of fin.segment) {
			if (counter > fin.lengthInSegments)
				break;

			points.push(nextSegment.origin);
			++counter;
		}

		const angle = Point.sinOfPoints(points[points.length - 3], points[points.length - 2], points[points.length - 1]);

		for (let index = points.length - 1; index > 0; --index) {
			const topPoint = Point.normalRight(Point.subtract(points[index - 1], points[index]));
			points.push(Point.add(points[index], Point.multiply(topPoint, angle)));
		}

		return points;
	}

	/** Draws this fin instance. */
	draw() {
		fill(this.color.r, this.color.g, this.color.b, this.color.a);

		bezierLine.drawLoop(BackFin.getPoints(this));
	}
}

/** Describes the tail fin of a creature. */
export class TailFin extends BodyPart {
	/**
	 * Creates a TailFin object.
	 * @param {Segment} segment The parent segment.
	 * @param {boolean} render Where to render.
	 * @param {number[]} distances The distances between the segments of the fin.
	 * @param {Color} color The color of the body part.
	 */
	constructor(segment, render, distances, color) {
		super(segment, render, color);

		if (distances.length < 2)
			throw "A tailfin must have at least 2 distance descriptors!";

		const descriptors = [new SegmentDescriptor(1, 1, undefined)];
		for (const distance of distances)
			descriptors.push(new SegmentDescriptor(distance, 1, undefined));

		this.headJoint = Segment.createAndLink(segment.origin, descriptors);
	}

	/**
	 * Calculates the outline points of the fin.
	 * @param {BackFin} fin The fin to calculate with.
	 * @returns The calculated points.
	 */
	static getPoints(fin) {
		const points = [];

		for (const nextSegment of fin.headJoint)
			points.push(nextSegment.origin);

		const angle = Point.sinOfPoints(points[points.length - 3], points[points.length - 2], points[points.length - 1]);
		const magicMultiplier = (13 * angle) / (points.length - 1);

		for (let index = points.length - 1; index > 0; --index) {
			const topPoint = Point.normalRight(Point.subtract(points[index - 1], points[index]));
			points.push(Point.add(points[index], Point.multiply(topPoint, index * magicMultiplier)));
		}

		return points;
	}

	/** Draws this fin instance. */
	draw() {
		this.headJoint.origin = this.segment.origin;
		Segment.pullNext(this.headJoint);

		fill(this.color.r, this.color.g, this.color.b, this.color.a);

		bezierLine.drawLoop(TailFin.getPoints(this));
	}
}

/** Describes a pair of antennas of a creature. */
export class Antenna extends BodyPart {
	/**
	 * Creates a TailFin object.
	 * @param {Segment} segment The parent segment.
	 * @param {boolean} render Where to render.
	 * @param {AntennaSegmentDescriptor} descriptors The descriptors of the segments of the antenna.
	 * @param {number} angle The angle of the antennas.
	 * @param {Color} color The color of the body part.
	 */
	constructor(segment, render, descriptors, angle, color) {
		super(segment, render, color);

		this.points = Segment.getPoints(Segment.createAndLink(new Point(0, 0), descriptors));

		if (Math.abs(this.angle) < 1)
			this.pointsMirrored = null;
		else {
			this.pointsMirrored = [];

			for (const point of this.points)
				this.pointsMirrored.push(new Point(point.x, -point.y));
		}

		this.angle = angle;
	}

	/**
	 * Draws a loop.
	 * @param {Point} position The position of the loop.
	 * @param {number} angle The angle of the loop.
	 * @param {Point[]} points The points of the loop.
	 */
	static drawLoopByOrientation(position, angle, points) {
		translate(position.x, position.y);
		rotate(radians(angle));

		bezierLine.drawLoop(points);

		resetMatrix();
	}

	/** Draws this antenna instance. */
	draw() {
		fill(this.color.r, this.color.g, this.color.b, this.color.a);

		const bodyAngle = Point.angleOfVector(Point.reverse(Segment.getFrontVector(this.segment)));

		if (this.pointsMirrored instanceof Array) {
			Antenna.drawLoopByOrientation(this.segment.origin, bodyAngle + this.angle, this.points);
			Antenna.drawLoopByOrientation(this.segment.origin, bodyAngle - this.angle, this.pointsMirrored);
		}
		else
			Antenna.drawLoopByOrientation(this.segment.origin, bodyAngle, this.points);
	}
}

/** Describes one leg of a creature. */
class OneLeg {
	/**
	 * Creates a OneLeg object.
	 * @param {Point} origin The origin of the parent segment.
	 * @param {LegSegmentDescriptor[]} descriptors The descriptors of the segments of the leg.
	 */
	constructor(origin, descriptors) {
		this.headSegment = Segment.createAndLink(origin, descriptors);

		let counter = 0;
		let tail = null;
		for (const nextSegment of this.headSegment) {
			++counter;
			tail = nextSegment;
		}

		if (counter < 2)
			throw "A leg must have at least 2 segment descriptors!";

		this.tailSegment = tail;
		this.standsOn = this.tailSegment.origin;

		this.range = Point.distance(this.tailSegment.origin, this.headSegment.origin);
	}

	/**
	 * Gets a new step location for the given leg.
	 * @param {OneLeg} leg The leg to get a new target for.
	 * @param {Point} frontVector The normalized front vector of the parent segment.
	 * @param {Point} normalVector The normalized normal vector of the parent segment pointing towards the legs direction.
	 * @param {Point} stepStyler The direction vector to calculate the location of the next step.
	 * @returns The new location to step to.
	 */
	static getNewTarget(leg, frontVector, normalVector, stepStyler) {
		const toSide = Point.multiply(normalVector, stepStyler.x);
		const toFront = Point.multiply(frontVector, stepStyler.y);
		const direction = Point.add(toSide, toFront);

		return Point.add(leg.headSegment.origin, (Point.magnitude(direction) > leg.range ? Point.scale(direction, leg.range) : direction));
	}

	/**
	 * Performs two way inverse kinematics on the given leg.
	 * @param {OneLeg} leg The given leg.
	 */
	static twoWayKinematics(leg) {
		const joinPoint = leg.headSegment.origin;

		leg.tailSegment.origin = leg.standsOn;
		Segment.pullPrev(leg.tailSegment);

		leg.headSegment.origin = joinPoint;
		Segment.pullNext(leg.headSegment);
	}

	/**
	 * Mirrors the position of the points of the leg around a certain point.
	 * @param {Point} origin The point to mirror around.
	 * @param {OneLeg} leg The given leg.
	 */
	static break(origin, leg) {
		for (const segment of leg.headSegment)
			segment.origin = Point.subtract(Point.multiply(origin, 2), segment.origin);
	}

	/**
	 * Draws a OneLeg instance.
	 * @param {OneLeg} leg The leg to draw.
	 * @param {Color} color The color of the leg.
	 */
	static draw(leg, color) {
		OneLeg.twoWayKinematics(leg);

		const distanceFromTarget = Point.magnitude(Point.subtract(leg.standsOn, leg.tailSegment.origin));

		if (distanceFromTarget > leg.tailSegment.distanceFromPrev) {
			OneLeg.break(leg.headSegment.origin, leg);

			for (let i = 0; i < 5; ++i)
				OneLeg.twoWayKinematics(leg);
		}

		for (const segment of leg.headSegment)
			Segment.drawBodyParts(segment, BodyPart.BOTTOM);

		fill(color.r, color.g, color.b, color.a);

		bezierLine.drawLoop(Segment.getPoints(leg.headSegment));

		for (const segment of leg.headSegment)
			Segment.drawBodyParts(segment, BodyPart.TOP);
	}
}

/** Describes one pair of legs of a creature. */
export class Leg extends BodyPart {
	/**
	 * Creates a Leg object.
	 * @param {Segment} segment The parent segment.
	 * @param {boolean} render Where to render.
	 * @param {LegSegmentDescriptor[]} descriptors The descriptors of the segments of one leg.
	 * @param {Point} stepTo Point to step on.
	 * @param {Color} color The color of the legs.
	 */
	constructor(segment, render, descriptors, stepTo, color) {
		super(segment, render, color);

		const mirroredDescriptors = [];
		for (const descriptor of descriptors)
			mirroredDescriptors.push(LegSegmentDescriptor.mirror(descriptor));

		this.left = new OneLeg(segment.origin, descriptors);
		this.right = new OneLeg(segment.origin, mirroredDescriptors);

		this.stepTo = stepTo;
	}

	/**
	 * Draws one leg.
	 * @param {Point} origin The origin of the parent segment.
	 * @param {Point} frontVector The normalized front vector of the parent segment.
	 * @param {Point} normalVector The normalized normal vector of the parent segment pointing towards the legs direction.
	 * @param {OneLeg} leg The leg to draw.
	 * @param {Color} color The color of the leg.
	 * @param {Point} stepTo Point to step on.
	 */
	static drawOne(origin, frontVector, normalVector, leg, color, stepTo) {
		leg.headSegment.origin = Point.add(origin, Point.scale(normalVector, leg.headSegment.distanceFromPrev));

		const distanceFromTarget = Point.distance(leg.standsOn, leg.headSegment.origin);
		const bodyLegAngle = Math.abs(Point.angleOfVectors(frontVector, Point.subtract(leg.headSegment.origin, leg.headSegment.nextSegment.origin)));

		if (distanceFromTarget > leg.range || bodyLegAngle < 30)
			leg.standsOn = OneLeg.getNewTarget(leg, frontVector, normalVector, stepTo);

		OneLeg.draw(leg, color);
	}

	/** Draws this leg instance. */
	draw() {
		const normalizedFrontVector = Point.normalize(Segment.getFrontVector(this.segment));

		Leg.drawOne(this.segment.origin, normalizedFrontVector, Point.normalRight(normalizedFrontVector), this.left, this.color, this.stepTo);
		Leg.drawOne(this.segment.origin, normalizedFrontVector, Point.normalLeft(normalizedFrontVector), this.right, this.color, this.stepTo);
	}
}