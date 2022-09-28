import { __spreadArray } from "tslib";
import { Matrix, Vector3 } from "../Maths/math.vector.js";
// This implementation was based on the original MIT-licensed TRACE repository
// from https://github.com/septagon/TRACE.
/**
 * Generic implementation of Levenshtein distance.
 */
var Levenshtein;
(function (Levenshtein) {
    /**
     * Alphabet from which to construct sequences to be compared using Levenshtein
     * distance.
     */
    var Alphabet = /** @class */ (function () {
        /**
         * Create a new Alphabet.
         * @param characters characters of the alphabet
         * @param charToInsertionCost function mapping characters to insertion costs
         * @param charToDeletionCost function mapping characters to deletion costs
         * @param charsToSubstitutionCost function mapping character pairs to substitution costs
         */
        function Alphabet(characters, charToInsertionCost, charToDeletionCost, charsToSubstitutionCost) {
            if (charToInsertionCost === void 0) { charToInsertionCost = null; }
            if (charToDeletionCost === void 0) { charToDeletionCost = null; }
            if (charsToSubstitutionCost === void 0) { charsToSubstitutionCost = null; }
            charToInsertionCost = charToInsertionCost !== null && charToInsertionCost !== void 0 ? charToInsertionCost : (function () { return 1; });
            charToDeletionCost = charToDeletionCost !== null && charToDeletionCost !== void 0 ? charToDeletionCost : (function () { return 1; });
            charsToSubstitutionCost = charsToSubstitutionCost !== null && charsToSubstitutionCost !== void 0 ? charsToSubstitutionCost : (function (a, b) { return (a === b ? 0 : 1); });
            this._characterToIdx = new Map();
            this._insertionCosts = new Array(characters.length);
            this._deletionCosts = new Array(characters.length);
            this._substitutionCosts = new Array(characters.length);
            var c;
            for (var outerIdx = 0; outerIdx < characters.length; ++outerIdx) {
                c = characters[outerIdx];
                this._characterToIdx.set(c, outerIdx);
                this._insertionCosts[outerIdx] = charToInsertionCost(c);
                this._deletionCosts[outerIdx] = charToDeletionCost(c);
                this._substitutionCosts[outerIdx] = new Array(characters.length);
                for (var innerIdx = outerIdx; innerIdx < characters.length; ++innerIdx) {
                    this._substitutionCosts[outerIdx][innerIdx] = charsToSubstitutionCost(c, characters[innerIdx]);
                }
            }
        }
        /**
         * Serialize the Alphabet to JSON string.
         * @returns JSON serialization
         */
        Alphabet.prototype.serialize = function () {
            var jsonObject = {};
            var characters = new Array(this._characterToIdx.size);
            this._characterToIdx.forEach(function (v, k) {
                characters[v] = k;
            });
            jsonObject["characters"] = characters;
            jsonObject["insertionCosts"] = this._insertionCosts;
            jsonObject["deletionCosts"] = this._deletionCosts;
            jsonObject["substitutionCosts"] = this._substitutionCosts;
            return JSON.stringify(jsonObject);
        };
        /**
         * Parse an Alphabet from a JSON serialization.
         * @param json JSON string to deserialize
         * @returns deserialized Alphabet
         */
        Alphabet.Deserialize = function (json) {
            var jsonObject = JSON.parse(json);
            var alphabet = new Alphabet(jsonObject["characters"]);
            alphabet._insertionCosts = jsonObject["insertionCosts"];
            alphabet._deletionCosts = jsonObject["deletionCosts"];
            alphabet._substitutionCosts = jsonObject["substitutionCosts"];
            return alphabet;
        };
        /**
         * Get the index (internally-assigned number) for a character.
         * @param char character
         * @returns index
         */
        Alphabet.prototype.getCharacterIdx = function (char) {
            return this._characterToIdx.get(char);
        };
        /**
         * Get the insertion cost of a character from its index.
         * @param idx character index
         * @returns insertion cost
         */
        Alphabet.prototype.getInsertionCost = function (idx) {
            return this._insertionCosts[idx];
        };
        /**
         * Get the deletion cost of a character from its index.
         * @param idx character index
         * @returns deletion cost
         */
        Alphabet.prototype.getDeletionCost = function (idx) {
            return this._deletionCosts[idx];
        };
        /**
         * Gets the cost to substitute two characters. NOTE: this cost is
         * required to be bi-directional, meaning it cannot matter which of
         * the provided characters is being removed and which is being inserted.
         * @param idx1 the first character index
         * @param idx2 the second character index
         * @returns substitution cost
         */
        Alphabet.prototype.getSubstitutionCost = function (idx1, idx2) {
            var min = Math.min(idx1, idx2);
            var max = Math.max(idx1, idx2);
            return this._substitutionCosts[min][max];
        };
        return Alphabet;
    }());
    Levenshtein.Alphabet = Alphabet;
    /**
     * Character sequence intended to be compared against other Sequences created
     * with the same Alphabet in order to compute Levenshtein distance.
     */
    var Sequence = /** @class */ (function () {
        /**
         * Create a new Sequence.
         * @param characters characters in the new Sequence
         * @param alphabet Alphabet, which must include all used characters
         */
        function Sequence(characters, alphabet) {
            var _this = this;
            if (characters.length > Sequence._MAX_SEQUENCE_LENGTH) {
                throw new Error("Sequences longer than " + Sequence._MAX_SEQUENCE_LENGTH + " not supported.");
            }
            this._alphabet = alphabet;
            this._characters = characters.map(function (c) { return _this._alphabet.getCharacterIdx(c); });
        }
        /**
         * Serialize to JSON string. JSON representation does NOT include the Alphabet
         * from which this Sequence was created; Alphabet must be independently
         * serialized.
         * @returns JSON string
         */
        Sequence.prototype.serialize = function () {
            return JSON.stringify(this._characters);
        };
        /**
         * Deserialize from JSON string and Alphabet. This should be the same Alphabet
         * from which the Sequence was originally created, which must be serialized and
         * deserialized independently so that it can be passed in here.
         * @param json JSON string representation of Sequence
         * @param alphabet Alphabet from which Sequence was originally created
         * @returns Sequence
         */
        Sequence.Deserialize = function (json, alphabet) {
            var sequence = new Sequence([], alphabet);
            sequence._characters = JSON.parse(json);
            return sequence;
        };
        /**
         * Get the distance between this Sequence and another.
         * @param other sequence to compare to
         * @returns Levenshtein distance
         */
        Sequence.prototype.distance = function (other) {
            return Sequence._Distance(this, other);
        };
        /**
         * Compute the Levenshtein distance between two Sequences.
         * @param a first Sequence
         * @param b second Sequence
         * @returns Levenshtein distance
         */
        Sequence._Distance = function (a, b) {
            var alphabet = a._alphabet;
            if (alphabet !== b._alphabet) {
                throw new Error("Cannot Levenshtein compare Sequences built from different alphabets.");
            }
            var aChars = a._characters;
            var bChars = b._characters;
            var aLength = aChars.length;
            var bLength = bChars.length;
            var costMatrix = Sequence._CostMatrix;
            costMatrix[0][0] = 0;
            for (var idx = 0; idx < aLength; ++idx) {
                costMatrix[idx + 1][0] = costMatrix[idx][0] + alphabet.getInsertionCost(aChars[idx]);
            }
            for (var idx = 0; idx < bLength; ++idx) {
                costMatrix[0][idx + 1] = costMatrix[0][idx] + alphabet.getInsertionCost(bChars[idx]);
            }
            for (var aIdx = 0; aIdx < aLength; ++aIdx) {
                for (var bIdx = 0; bIdx < bLength; ++bIdx) {
                    Sequence._InsertionCost = costMatrix[aIdx + 1][bIdx] + alphabet.getInsertionCost(bChars[bIdx]);
                    Sequence._DeletionCost = costMatrix[aIdx][bIdx + 1] + alphabet.getDeletionCost(aChars[aIdx]);
                    Sequence._SubstitutionCost = costMatrix[aIdx][bIdx] + alphabet.getSubstitutionCost(aChars[aIdx], bChars[bIdx]);
                    costMatrix[aIdx + 1][bIdx + 1] = Math.min(Sequence._InsertionCost, Sequence._DeletionCost, Sequence._SubstitutionCost);
                }
            }
            return costMatrix[aLength][bLength];
        };
        // Scratch values
        Sequence._MAX_SEQUENCE_LENGTH = 256;
        Sequence._CostMatrix = __spreadArray([], Array(Sequence._MAX_SEQUENCE_LENGTH + 1), true).map(function () { return new Array(Sequence._MAX_SEQUENCE_LENGTH + 1); });
        return Sequence;
    }());
    Levenshtein.Sequence = Sequence;
})(Levenshtein || (Levenshtein = {}));
/**
 * A 3D trajectory consisting of an order list of vectors describing a
 * path of motion through 3D space.
 */
var Trajectory = /** @class */ (function () {
    /**
     * Create a new empty Trajectory.
     * @param segmentLength radius of discretization for Trajectory points
     */
    function Trajectory(segmentLength) {
        if (segmentLength === void 0) { segmentLength = 0.01; }
        this._points = [];
        this._segmentLength = segmentLength;
    }
    /**
     * Serialize to JSON.
     * @returns serialized JSON string
     */
    Trajectory.prototype.serialize = function () {
        return JSON.stringify(this);
    };
    /**
     * Deserialize from JSON.
     * @param json serialized JSON string
     * @returns deserialized Trajectory
     */
    Trajectory.Deserialize = function (json) {
        var jsonObject = JSON.parse(json);
        var trajectory = new Trajectory(jsonObject["_segmentLength"]);
        trajectory._points = jsonObject["_points"].map(function (pt) {
            return new Vector3(pt["_x"], pt["_y"], pt["_z"]);
        });
        return trajectory;
    };
    /**
     * Get the length of the Trajectory.
     * @returns length of the Trajectory
     */
    Trajectory.prototype.getLength = function () {
        return this._points.length * this._segmentLength;
    };
    /**
     * Append a new point to the Trajectory.
     * NOTE: This implementation has many allocations.
     * @param point point to append to the Trajectory
     */
    Trajectory.prototype.add = function (point) {
        var _this = this;
        var numPoints = this._points.length;
        if (numPoints === 0) {
            this._points.push(point.clone());
        }
        else {
            var getT = function () { return _this._segmentLength / Vector3.Distance(_this._points[numPoints - 1], point); };
            for (var t = getT(); t <= 1.0; t = getT()) {
                var newPoint = this._points[numPoints - 1].scale(1.0 - t);
                point.scaleAndAddToRef(t, newPoint);
                this._points.push(newPoint);
                ++numPoints;
            }
        }
    };
    /**
     * Create a new Trajectory with a segment length chosen to make it
     * probable that the new Trajectory will have a specified number of
     * segments. This operation is imprecise.
     * @param targetResolution number of segments desired
     * @returns new Trajectory with approximately the requested number of segments
     */
    Trajectory.prototype.resampleAtTargetResolution = function (targetResolution) {
        var resampled = new Trajectory(this.getLength() / targetResolution);
        this._points.forEach(function (pt) {
            resampled.add(pt);
        });
        return resampled;
    };
    /**
     * Convert Trajectory segments into tokenized representation. This
     * representation is an array of numbers where each nth number is the
     * index of the token which is most similar to the nth segment of the
     * Trajectory.
     * @param tokens list of vectors which serve as discrete tokens
     * @returns list of indices of most similar token per segment
     */
    Trajectory.prototype.tokenize = function (tokens) {
        var tokenization = [];
        var segmentDir = new Vector3();
        for (var idx = 2; idx < this._points.length; ++idx) {
            if (Trajectory._TransformSegmentDirToRef(this._points[idx - 2], this._points[idx - 1], this._points[idx], segmentDir)) {
                tokenization.push(Trajectory._TokenizeSegment(segmentDir, tokens));
            }
        }
        return tokenization;
    };
    /**
     * Transform the rotation (i.e., direction) of a segment to isolate
     * the relative transformation represented by the segment. This operation
     * may or may not succeed due to singularities in the equations that define
     * motion relativity in this context.
     * @param priorVec the origin of the prior segment
     * @param fromVec the origin of the current segment
     * @param toVec the destination of the current segment
     * @param result reference to output variable
     * @returns whether or not transformation was successful
     */
    Trajectory._TransformSegmentDirToRef = function (priorVec, fromVec, toVec, result) {
        var DOT_PRODUCT_SAMPLE_REJECTION_THRESHOLD = 0.98;
        fromVec.subtractToRef(priorVec, Trajectory._ForwardDir);
        Trajectory._ForwardDir.normalize();
        fromVec.scaleToRef(-1, Trajectory._InverseFromVec);
        Trajectory._InverseFromVec.normalize();
        if (Math.abs(Vector3.Dot(Trajectory._ForwardDir, Trajectory._InverseFromVec)) > DOT_PRODUCT_SAMPLE_REJECTION_THRESHOLD) {
            return false;
        }
        Vector3.CrossToRef(Trajectory._ForwardDir, Trajectory._InverseFromVec, Trajectory._UpDir);
        Trajectory._UpDir.normalize();
        Matrix.LookAtLHToRef(priorVec, fromVec, Trajectory._UpDir, Trajectory._LookMatrix);
        toVec.subtractToRef(fromVec, Trajectory._FromToVec);
        Trajectory._FromToVec.normalize();
        Vector3.TransformNormalToRef(Trajectory._FromToVec, Trajectory._LookMatrix, result);
        return true;
    };
    /**
     * Determine which token vector is most similar to the
     * segment vector.
     * @param segment segment vector
     * @param tokens token vector list
     * @returns index of the most similar token to the segment
     */
    Trajectory._TokenizeSegment = function (segment, tokens) {
        Trajectory._BestMatch = 0;
        Trajectory._Score = Vector3.Dot(segment, tokens[0]);
        Trajectory._BestScore = Trajectory._Score;
        for (var idx = 1; idx < tokens.length; ++idx) {
            Trajectory._Score = Vector3.Dot(segment, tokens[idx]);
            if (Trajectory._Score > Trajectory._BestScore) {
                Trajectory._BestMatch = idx;
                Trajectory._BestScore = Trajectory._Score;
            }
        }
        return Trajectory._BestMatch;
    };
    Trajectory._ForwardDir = new Vector3();
    Trajectory._InverseFromVec = new Vector3();
    Trajectory._UpDir = new Vector3();
    Trajectory._FromToVec = new Vector3();
    Trajectory._LookMatrix = new Matrix();
    return Trajectory;
}());
export { Trajectory };
/**
 * Collection of vectors intended to be used as the basis of Trajectory
 * tokenization for Levenshtein distance comparison. Canonically, a
 * Vector3Alphabet will resemble a "spikeball" of vectors distributed
 * roughly evenly over the surface of the unit sphere.
 */
var Vector3Alphabet = /** @class */ (function () {
    function Vector3Alphabet(size) {
        this.chars = new Array(size);
    }
    /**
     * Helper method to create new "spikeball" Vector3Alphabets. Uses a naive
     * optimize-from-random strategy to space points around the unit sphere
     * surface as a simple alternative to really doing the math to tile the
     * sphere.
     * @param alphabetSize size of the desired alphabet
     * @param iterations number of iterations over which to optimize the "spikeball"
     * @param startingStepSize distance factor to move points in early optimization iterations
     * @param endingStepSize distance factor to move points in late optimization iterations
     * @param fixedValues alphabet "characters" that are required and cannot be moved by optimization
     * @returns a new randomly generated and optimized Vector3Alphabet of the specified size
     */
    Vector3Alphabet.Generate = function (alphabetSize, iterations, startingStepSize, endingStepSize, fixedValues) {
        if (alphabetSize === void 0) { alphabetSize = 64; }
        if (iterations === void 0) { iterations = 256; }
        if (startingStepSize === void 0) { startingStepSize = 0.1; }
        if (endingStepSize === void 0) { endingStepSize = 0.001; }
        if (fixedValues === void 0) { fixedValues = []; }
        var EPSILON = 0.001;
        var EPSILON_SQUARED = EPSILON * EPSILON;
        var alphabet = new Vector3Alphabet(alphabetSize);
        for (var idx = 0; idx < alphabetSize; ++idx) {
            alphabet.chars[idx] = new Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            alphabet.chars[idx].normalize();
        }
        for (var idx = 0; idx < fixedValues.length; ++idx) {
            alphabet.chars[idx].copyFrom(fixedValues[idx]);
        }
        var stepSize;
        var distSq;
        var force = new Vector3();
        var scratch = new Vector3();
        var lerp = function (l, r, t) { return (1.0 - t) * l + t * r; };
        for (var iteration = 0; iteration < iterations; ++iteration) {
            stepSize = lerp(startingStepSize, endingStepSize, iteration / (iterations - 1));
            var _loop_1 = function (idx) {
                force.copyFromFloats(0, 0, 0);
                alphabet.chars.forEach(function (pt) {
                    alphabet.chars[idx].subtractToRef(pt, scratch);
                    distSq = scratch.lengthSquared();
                    if (distSq > EPSILON_SQUARED) {
                        scratch.scaleAndAddToRef(1 / (scratch.lengthSquared() * distSq), force);
                    }
                });
                force.scaleInPlace(stepSize);
                alphabet.chars[idx].addInPlace(force);
                alphabet.chars[idx].normalize();
            };
            for (var idx = fixedValues.length; idx < alphabet.chars.length; ++idx) {
                _loop_1(idx);
            }
        }
        return alphabet;
    };
    /**
     * Serialize to JSON.
     * @returns JSON serialization
     */
    Vector3Alphabet.prototype.serialize = function () {
        return JSON.stringify(this.chars);
    };
    /**
     * Deserialize from JSON.
     * @param json JSON serialization
     * @returns deserialized Vector3Alphabet
     */
    Vector3Alphabet.Deserialize = function (json) {
        var jsonObject = JSON.parse(json);
        var alphabet = new Vector3Alphabet(jsonObject.length);
        for (var idx = 0; idx < jsonObject.length; ++idx) {
            alphabet.chars[idx] = new Vector3(jsonObject[idx]["_x"], jsonObject[idx]["_y"], jsonObject[idx]["_z"]);
        }
        return alphabet;
    };
    return Vector3Alphabet;
}());
/**
 * Class which formalizes the manner in which a Vector3Alphabet is used to tokenize and
 * describe a Trajectory. This class houses the functionality which determines what
 * attributes of Trajectories are and are not considered important, such as scale.
 */
var TrajectoryDescriptor = /** @class */ (function () {
    function TrajectoryDescriptor() {
        this._sequences = [];
    }
    /**
     * Serialize to JSON.
     * @returns JSON serialization
     */
    TrajectoryDescriptor.prototype.serialize = function () {
        return JSON.stringify(this._sequences.map(function (sequence) { return sequence.serialize(); }));
    };
    /**
     * Deserialize from JSON string and Alphabet. This should be the same Alphabet
     * from which the descriptor was originally created, which must be serialized and
     * deserialized independently so that it can be passed in here.
     * @param json JSON serialization
     * @param alphabet Alphabet from which descriptor was originally created
     * @returns deserialized TrajectoryDescriptor
     */
    TrajectoryDescriptor.Deserialize = function (json, alphabet) {
        var descriptor = new TrajectoryDescriptor();
        descriptor._sequences = JSON.parse(json).map(function (s) { return Levenshtein.Sequence.Deserialize(s, alphabet); });
        return descriptor;
    };
    /**
     * Create a new TrajectoryDescriptor to describe a provided Trajectory according
     * to the provided alphabets.
     * @param trajectory Trajectory to be described
     * @param vector3Alphabet Vector3Alphabet to be used to tokenize the Trajectory
     * @param levenshteinAlphabet Levenshtein.Alphabet to be used as basis for comparison with other descriptors
     * @returns TrajectoryDescriptor describing provided Trajectory
     */
    TrajectoryDescriptor.CreateFromTrajectory = function (trajectory, vector3Alphabet, levenshteinAlphabet) {
        return TrajectoryDescriptor.CreateFromTokenizationPyramid(TrajectoryDescriptor._GetTokenizationPyramid(trajectory, vector3Alphabet), levenshteinAlphabet);
    };
    /**
     * Create a new TrajectoryDescriptor from a pre-existing pyramid of tokens.
     * NOTE: This function exists to support an outdated serialization mechanism and should
     * be deleted if it is no longer useful.
     * @param pyramid tokenization pyramid
     * @param levenshteinAlphabet Levenshtein.Alphabet to be uses as basis for comparison with other descriptors
     * @returns TrajectoryDescriptor describing the Trajectory from which the pyramid was built
     */
    TrajectoryDescriptor.CreateFromTokenizationPyramid = function (pyramid, levenshteinAlphabet) {
        var descriptor = new TrajectoryDescriptor();
        descriptor._sequences = pyramid.map(function (tokens) { return new Levenshtein.Sequence(tokens, levenshteinAlphabet); });
        return descriptor;
    };
    /**
     * Create the tokenization pyramid for the provided Trajectory according to the given
     * Vector3Alphabet.
     * @param trajectory Trajectory to be tokenized
     * @param alphabet Vector3Alphabet containing tokens
     * @param targetResolution finest resolution of descriptor
     * @returns tokenization pyramid for Trajectory
     */
    TrajectoryDescriptor._GetTokenizationPyramid = function (trajectory, alphabet, targetResolution) {
        if (targetResolution === void 0) { targetResolution = TrajectoryDescriptor._FINEST_DESCRIPTOR_RESOLUTION; }
        var pyramid = [];
        for (var res = targetResolution; res > 4; res = Math.floor(res / 2)) {
            pyramid.push(trajectory.resampleAtTargetResolution(res).tokenize(alphabet.chars));
        }
        return pyramid;
    };
    /**
     * Calculate a distance metric between this TrajectoryDescriptor and another. This is
     * essentially a similarity score and does not directly represent Euclidean distance,
     * edit distance, or any other formal distance metric.
     * @param other TrajectoryDescriptor from which to determine distance
     * @returns distance, a nonnegative similarity score where larger values indicate dissimilarity
     */
    TrajectoryDescriptor.prototype.distance = function (other) {
        var totalDistance = 0;
        var weight;
        for (var idx = 0; idx < this._sequences.length; ++idx) {
            weight = Math.pow(2, idx);
            totalDistance += weight * this._sequences[idx].distance(other._sequences[idx]);
        }
        return totalDistance;
    };
    TrajectoryDescriptor._FINEST_DESCRIPTOR_RESOLUTION = 32;
    return TrajectoryDescriptor;
}());
/**
 * A set of TrajectoryDescriptors defined to be "the same." This is essentially a helper
 * class to facilitate methods of Trajectory clustering.
 */
var TrajectoryClass = /** @class */ (function () {
    /**
     * Create a new DescribedTrajectory.
     * @param descriptors currently-known TrajectoryDescriptors, if any
     */
    function TrajectoryClass(descriptors) {
        if (descriptors === void 0) { descriptors = []; }
        this._descriptors = descriptors;
        this._centroidIdx = -1;
        this._averageDistance = 0;
        this._refreshDescription();
    }
    /**
     * Serialize to JSON.
     * @returns JSON serialization
     */
    TrajectoryClass.prototype.serialize = function () {
        var jsonObject = {};
        jsonObject.descriptors = this._descriptors.map(function (desc) { return desc.serialize(); });
        jsonObject.centroidIdx = this._centroidIdx;
        jsonObject.averageDistance = this._averageDistance;
        return JSON.stringify(jsonObject);
    };
    /**
     * Deserialize from JSON string and Alphabet. This should be the same Alphabet
     * from which the descriptors were originally created, which must be serialized and
     * deserialized independently so that it can be passed in here.
     * @param json JSON string representation
     * @param alphabet Alphabet from which TrajectoryDescriptors were originally created
     * @returns deserialized TrajectoryDescriptor
     */
    TrajectoryClass.Deserialize = function (json, alphabet) {
        var jsonObject = JSON.parse(json);
        var described = new TrajectoryClass();
        described._descriptors = jsonObject.descriptors.map(function (s) { return TrajectoryDescriptor.Deserialize(s, alphabet); });
        described._centroidIdx = jsonObject.centroidIdx;
        described._averageDistance = jsonObject.averageDistance;
        return described;
    };
    /**
     * Add a new TrajectoryDescriptor to the list of descriptors known to describe
     * this same DescribedTrajectory.
     * @param descriptor descriptor to be added
     */
    TrajectoryClass.prototype.add = function (descriptor) {
        this._descriptors.push(descriptor);
        this._refreshDescription();
    };
    /**
     * Compute the cost, which is inversely related to the likelihood that the provided
     * TrajectoryDescriptor describes a Trajectory that is considered to be the same as
     * the class represented by this DescribedTrajectory.
     * @param descriptor the descriptor to be costed
     * @returns cost of the match, which is a nonnegative similarity metric where larger values indicate dissimilarity
     */
    TrajectoryClass.prototype.getMatchCost = function (descriptor) {
        return descriptor.distance(this._descriptors[this._centroidIdx]) / this._averageDistance;
    };
    /**
     * Compute the minimum distance between the queried TrajectoryDescriptor and a
     * descriptor which is a member of this collection. This is an alternative way of
     * conceptualizing match cost from getMatchCost(), and it serves a different function.
     * @param descriptor the descriptor to find the minimum distance to
     * @returns minimum descriptor distance to a member descriptor of this DescribedTrajectory
     */
    TrajectoryClass.prototype.getMatchMinimumDistance = function (descriptor) {
        return Math.min.apply(Math, this._descriptors.map(function (desc) { return desc.distance(descriptor); }));
    };
    /**
     * Refreshes the internal representation of this DescribedTrajectory.
     */
    TrajectoryClass.prototype._refreshDescription = function () {
        var _this = this;
        this._centroidIdx = -1;
        var sum;
        var distances = this._descriptors.map(function (a) {
            sum = 0;
            _this._descriptors.forEach(function (b) {
                sum += a.distance(b);
            });
            return sum;
        });
        for (var idx = 0; idx < distances.length; ++idx) {
            if (this._centroidIdx < 0 || distances[idx] < distances[this._centroidIdx]) {
                this._centroidIdx = idx;
            }
        }
        this._averageDistance = 0;
        this._descriptors.forEach(function (desc) {
            _this._averageDistance += desc.distance(_this._descriptors[_this._centroidIdx]);
        });
        if (this._descriptors.length > 0) {
            this._averageDistance = Math.max(this._averageDistance / this._descriptors.length, TrajectoryClass._MIN_AVERAGE_DISTANCE);
        }
    };
    TrajectoryClass._MIN_AVERAGE_DISTANCE = 1;
    return TrajectoryClass;
}());
/**
 * Class representing a set of known, named trajectories to which Trajectories can be
 * added and using which Trajectories can be recognized.
 */
var TrajectoryClassifier = /** @class */ (function () {
    function TrajectoryClassifier() {
        this._maximumAllowableMatchCost = 4;
        this._nameToDescribedTrajectory = new Map();
    }
    /**
     * Serialize to JSON.
     * @returns JSON serialization
     */
    TrajectoryClassifier.prototype.serialize = function () {
        var jsonObject = {};
        jsonObject.maximumAllowableMatchCost = this._maximumAllowableMatchCost;
        jsonObject.vector3Alphabet = this._vector3Alphabet.serialize();
        jsonObject.levenshteinAlphabet = this._levenshteinAlphabet.serialize();
        jsonObject.nameToDescribedTrajectory = [];
        this._nameToDescribedTrajectory.forEach(function (described, name) {
            jsonObject.nameToDescribedTrajectory.push(name);
            jsonObject.nameToDescribedTrajectory.push(described.serialize());
        });
        return JSON.stringify(jsonObject);
    };
    /**
     * Deserialize from JSON.
     * @param json JSON serialization
     * @returns deserialized TrajectorySet
     */
    TrajectoryClassifier.Deserialize = function (json) {
        var jsonObject = JSON.parse(json);
        var classifier = new TrajectoryClassifier();
        classifier._maximumAllowableMatchCost = jsonObject.maximumAllowableMatchCost;
        classifier._vector3Alphabet = Vector3Alphabet.Deserialize(jsonObject.vector3Alphabet);
        classifier._levenshteinAlphabet = Levenshtein.Alphabet.Deserialize(jsonObject.levenshteinAlphabet);
        for (var idx = 0; idx < jsonObject.nameToDescribedTrajectory.length; idx += 2) {
            classifier._nameToDescribedTrajectory.set(jsonObject.nameToDescribedTrajectory[idx], TrajectoryClass.Deserialize(jsonObject.nameToDescribedTrajectory[idx + 1], classifier._levenshteinAlphabet));
        }
        return classifier;
    };
    /**
     * Initialize a new empty TrajectorySet with auto-generated Alphabets.
     * VERY naive, need to be generating these things from known
     * sets. Better version later, probably eliminating this one.
     * @returns auto-generated TrajectorySet
     */
    TrajectoryClassifier.Generate = function () {
        var vecs = Vector3Alphabet.Generate(64, 256, 0.1, 0.001, [Vector3.Forward()]);
        var charIdxs = new Array(vecs.chars.length);
        for (var idx = 0; idx < charIdxs.length; ++idx) {
            charIdxs[idx] = idx;
        }
        var alphabet = new Levenshtein.Alphabet(charIdxs, function (idx) { return (idx === 0 ? 0 : 1); }, function (idx) { return (idx === 0 ? 0 : 1); }, function (a, b) { return Math.min(1 - Vector3.Dot(vecs.chars[a], vecs.chars[b]), 1); });
        var trajectorySet = new TrajectoryClassifier();
        trajectorySet._vector3Alphabet = vecs;
        trajectorySet._levenshteinAlphabet = alphabet;
        return trajectorySet;
    };
    /**
     * Add a new Trajectory to the set with a given name.
     * @param trajectory new Trajectory to be added
     * @param classification name to which to add the Trajectory
     */
    TrajectoryClassifier.prototype.addTrajectoryToClassification = function (trajectory, classification) {
        if (!this._nameToDescribedTrajectory.has(classification)) {
            this._nameToDescribedTrajectory.set(classification, new TrajectoryClass());
        }
        this._nameToDescribedTrajectory.get(classification).add(TrajectoryDescriptor.CreateFromTrajectory(trajectory, this._vector3Alphabet, this._levenshteinAlphabet));
    };
    /**
     * Remove a known named trajectory and all Trajectories associated with it.
     * @param classification name to remove
     * @returns whether anything was removed
     */
    TrajectoryClassifier.prototype.deleteClassification = function (classification) {
        return this._nameToDescribedTrajectory.delete(classification);
    };
    /**
     * Attempt to recognize a Trajectory from among all the classifications
     * already known to the classifier.
     * @param trajectory Trajectory to be recognized
     * @returns classification of Trajectory if recognized, null otherwise
     */
    TrajectoryClassifier.prototype.classifyTrajectory = function (trajectory) {
        var _this = this;
        var descriptor = TrajectoryDescriptor.CreateFromTrajectory(trajectory, this._vector3Alphabet, this._levenshteinAlphabet);
        var allowableMatches = [];
        this._nameToDescribedTrajectory.forEach(function (trajectoryClass, classification) {
            if (trajectoryClass.getMatchCost(descriptor) < _this._maximumAllowableMatchCost) {
                allowableMatches.push(classification);
            }
        });
        if (allowableMatches.length === 0) {
            return null;
        }
        var bestIdx = 0;
        var bestMatch = this._nameToDescribedTrajectory.get(allowableMatches[bestIdx]).getMatchMinimumDistance(descriptor);
        var match;
        for (var idx = 0; idx < allowableMatches.length; ++idx) {
            match = this._nameToDescribedTrajectory.get(allowableMatches[idx]).getMatchMinimumDistance(descriptor);
            if (match < bestMatch) {
                bestMatch = match;
                bestIdx = idx;
            }
        }
        return allowableMatches[bestIdx];
    };
    return TrajectoryClassifier;
}());
export { TrajectoryClassifier };
//# sourceMappingURL=trajectoryClassifier.js.map