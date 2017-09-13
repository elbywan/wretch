export const mix = function(one: Object, two: Object, mergeArrays: boolean = false) {
    if(!one || !two || typeof one !== "object" || typeof two !== "object")
        return one

    const clone = { ...one, ...two }
    for(const prop in two) {
        if(two.hasOwnProperty(prop)) {
            if(two[prop] instanceof Array && one[prop] instanceof Array) {
                clone[prop] = mergeArrays ? [ ...one[prop], ...two[prop] ] : clone[prop] = two[prop]
            } else if(typeof two[prop] === "object" && typeof one[prop] === "object") {
                clone[prop] = mix(one[prop], two[prop], mergeArrays)
            }
        }
    }

    return clone
}
