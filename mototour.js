var server 			= require("./backend/server"),
	router 			= require("./backend/router"),
	requestHandlers = require("./backend/requestHandlers");

server.start(router.route, requestHandlers.submitRequest);