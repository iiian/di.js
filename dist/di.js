const _ = require('lodash');

const $injector = (function() {
    const _services = new Map();

    return {
        config: config,
        register: register,
        get: get,
        all: all
    };

    function config(cfg) {
        register(cfg.id, cfg.dependencies, cfg.service);
    }

    function register(serviceId, dependencies, service) {
        service.dependencies = dependencies;
        if (service.dependencies.length > 0) {
            service.validate = _getCyclicErrors.bind(service, serviceId, dependencies);
        }
        _services.set(serviceId, service);

        /**
         * If a set of inputs are directed (acyclic) with respect to 
         * services. Must be deferred as a property of the service, since
         * possible that unknown dependencies might be specified.
         * Will be invoked at getService() time. Presence of validate will 
         * drive checks.
         *  @param {string} id
         *  @param {string[]} dependencies 
         *  @param {Set<string>} visited
         *  @returns {boolean}
         */
        function _getCyclicErrors(id, dependencies, visited) {
            if (visited === undefined) {
                visited = _visitedDefault();
                visited.add(id);
            }

            let queue = _.clone(dependencies);

            while(queue.length > 0) {
                const nextId = queue.shift();
                const next = _services.get(nextId);
                if (visited.has(nextId)) {
                    return nextId;
                } else {
                    visited.add(nextId);
                }
                _.forEach(_.clone(next.dependencies || []), e => queue.push(e));
            }
            
            /**
             *  @returns {Set<string>}
             */
            function _visitedDefault() {
                return _.reduce(_services, (map, next) => {
                    map.add(next.key);
                }, new Set());
            }

            return null;
        } 
    }
    
    function get(serviceId) {
        const subject = _services.get(serviceId);
        
        if (subject.validate) {
            const cyclicErrors = subject.validate();
            if (cyclicErrors) {
                throw new Error('Cyclic dependencies detected: ' + ('@' + cyclicErrors));
            }
        }
        
        // return an argumentless function representing the proper invokation
        // of the service.
        return _.reduce((subject.dependencies || []), (partial, injecteeId) => {
            return partial.bind(partial, get(injecteeId)());
        }, subject);
    }
    
    function all() {
        return _services;
    }
})();

const $context = (function($injector) {
    const ctx = this;
    ctx.entryPoint;

    return {
        registerRoot: registerRoot,
        resolve: resolve,
        run: run
    }

    function registerRoot(app) {
        ctx.entryPoint = app;
    }

    function resolve(element) {
        const injectionRequests = element.dependencies;

        return _.reduce(injectionRequests, (partial, injectee) => {
            const nextService = $injector.get(injectee)();
            return partial.bind(partial, nextService)
        }, element.app);
    }

    function run() {
        const app = resolve(ctx.entryPoint)
        app();
    }
})($injector);

module.exports = {
    $context,
    $injector
};