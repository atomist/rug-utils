import {GraphNode,PathExpression} from "@atomist/rug/tree/PathExpression"

/**
 * Mark this object as a match that will be
 * returned as a leaf (match node)
 * @param a object to mark as a match
 */
export function match(a) {
    a._match = true
    return a
}

/**
 * Create a query for this node graph, matching either the root or leaf nodes
 * marked with the _match property. Works through navigating public functions
 * or properties that return other GraphNodes, or simple values (for simple predicates).
 * Doesn't insist on a GraphNode parameter as it could be a JSON structure with the required
 * properties instead
 * @type R type of root
 * @type L type of leaf (may be the same)
 */
export function byExample<R extends GraphNode, L extends GraphNode>(g: any): PathExpression<R,L> {
    let pathExpression = `/${queryByExampleString(g).path}`
    //console.log(`Created path expression [${pathExpression}]`)
    return new PathExpression<R,L>(pathExpression)
}

/**
 * Query for the given root node. All other paths
 * will be expressed as predicates.
 * Should be passed to scala-style queries.
 * @param g root node
 */
export function forRoot<R extends GraphNode>(g: any): PathExpression<R,R> {
    return byExample<R,R>(g)
}

/**
 * The path into a subgraph, along with whether it's to be treated as a match
 * or as a predicate.
 */
class Branch {
    constructor(public path: string, public match: boolean) {}
}

/**
 * If we're going down a branch that we need a match in, 
 * return the branch NOT as a predicate.
 */
function queryByExampleString(g: any): Branch {
    let pe = typeToAddress(g)
    let isMatch: boolean = g._match && g._match == true

    for (let id in g) {
        let propOrFun = g[id]
        let value: any = null
        if (isRelevantFunction(id, propOrFun)) {
            value = g[id]()
        }
        else if (isRelevantProperty(id, propOrFun)) {
            value = g[id]
        }
        if (!value) {
            // Ignore
        }
        else if (value.nodeTags && value.nodeName) { // Simple test for graph node type
            //console.log(`GraphNode Target=${target}`)
            let branch = queryByExampleString(value)
            if (branch.match) 
                isMatch = true
            let step = `/${id}::${branch.path}`
            pe += branch.match ? step : `[${step}]`
        }
        else if (["string", "number", "boolean"].indexOf(typeof value) != -1) {
            // It's probably a simple property
            //console.log(`Non graph node result of invoking ${id} was [${value}]`)
            pe += `[@${id}='${value}']`
        }
        else {
            //console.log(`Don't know what to do with unfamiliar result of invoking ${id} was [${value}]`)
        }
    }
    return new Branch(pe, isMatch)
}

function typeToAddress(g: any): string {
    // TODO fragile. Or is this a convention we can rely on?
    return isFunction(g.nodeTags) ? `${g.nodeTags()[0]}()` : `${g.nodeTags[0]}()`
}

/**
 * Is this a function we care about? That is, it's not one of our well-known functions
 * and isn't a builder function whose name starts with "with"
 */
function isRelevantFunction(id: string, f): boolean {
    return isFunction(f) && ["nodeTags", "nodeName", "address", "constructor", "navigatedFrom"].indexOf(id) == -1 &&
        id.indexOf("with") != 0
}

/**
 * Is this a property we care about? That is, it's not one of our well-known properties
 * and isn't prefixed with _, our convention for holding our internal state
 */
function isRelevantProperty(id: string, p): boolean {
    return !isFunction(p) && ["nodeTags", "nodeName"].indexOf(id) == -1 &&
        id.indexOf("_") != 0
}

function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};