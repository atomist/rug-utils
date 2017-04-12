/*
 * Copyright © 2017 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
    General-purpose utility methods.
*/

export function isFunction(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
}

export function isArray(obj) {
    return obj.constructor === Array;
}

export function isPrimitive(obj) {
    return ["string", "number", "boolean"].indexOf(typeof obj);
}

/**
 * Clone an object, without ES6.
 * @param a 
 */
export function clone(a): any {
    var cloneObj = new a.constructor();
    for (var attribut in this) {
        if (typeof this[attribut] === "object") {
            cloneObj[attribut] = this.clone();
        } 
        else {
            cloneObj[attribut] = this[attribut];
        }
    }
    return cloneObj;
}