import "dotenv/config";
import "reflect-metadata";

import Server from "./server/Server";
import MainController from "./controllers/MainController";
import AuthController from "./controllers/AuthController";

(Symbol.metadata as symbol) ??= Symbol("metadata");

const controllers = [MainController, AuthController];

const server = new Server();
server.loadControllers(controllers);
server.start().then().catch(console.error);
