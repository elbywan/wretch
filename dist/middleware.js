export var middlewareHelper = function (middlewares) { return function (fetchFunction) {
    return (middlewares.length === 0 ?
        fetchFunction :
        middlewares.length === 1 ?
            middlewares[0](fetchFunction) :
            middlewares.reduceRight(function (acc, curr, idx) {
                return (idx === middlewares.length - 2) ? curr(acc(fetchFunction)) : curr(acc);
            }));
}; };
//# sourceMappingURL=middleware.js.map