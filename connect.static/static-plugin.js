
// TODO: This version may be needed for c9local but ideally we can find other solution so
//       we don't have to keep it up to date.
//var connect_static = require("connect-architect/connect/middleware/static");

module.exports = function startup(options, imports, register) {

    var rjs = {
        "paths": {},
        "packages": []
    };
    var prefix = options.prefix || "/static";
    var workerPrefix = options.workerPrefix || "/static";

    var connect = imports.connect.getModule();    
    var staticServer = connect.createServer();
    imports.connect.useMain(options.bindPrefix || prefix, staticServer);

    register(null, {
        "static": {
            addStatics: function(statics) {

                statics.forEach(function(s) {

//                    console.log("MOUNT", prefix, s.mount, s.path);
                    
                    if (s.router) {

                        var server = connect.static(s.path);
                        staticServer.use(s.mount, function(req, res, next) {
                            s.router(req, res);
                            server(req, res, next);
                        });

                    } else {

                        staticServer.use(s.mount, connect.static(s.path));

                    }

                    var libs = s.rjs || {};
                    for (var name in libs) {
                        if (typeof libs[name] === "string") {
                            rjs.paths[name] = join(prefix, libs[name]);
                        } else {
                            // TODO: Ensure package is not already registered!
                            rjs.packages.push(libs[name]);
                        }
                    }
                });
            },

            getRequireJsPaths: function() {
                return rjs.paths;
            },

            getRequireJsPackages: function() {
                return rjs.packages;
            },

            getStaticPrefix: function() {
                return prefix;
            },
            
            getWorkerPrefix: function() {
                return workerPrefix;
            }
        }
    });

    function join(prefix, path) {
        return prefix.replace(/\/*$/, "") + "/" + path.replace(/^\/*/, "");
    }
};
