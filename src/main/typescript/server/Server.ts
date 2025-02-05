import fastify, { type FastifyInstance } from "fastify";
import pino from "pino";
import type Controller from "../core/Controller";
import Response from "../core/Response";
import EncryptionService from "../services/EncryptionService";
import TwoFactorAuthService from "../services/TwoFactorAuthService";

class Server {
    private readonly fastify: FastifyInstance;
    private readonly port = process.env.SBC_SERVER_PORT
        ? +process.env.SBC_SERVER_PORT
        : 4500;
    private readonly host = process.env.SBC_SERVER_HOST ?? "0.0.0.0"
    public readonly encryptionService = new EncryptionService(this);
    public readonly twoFactorAuthService = new TwoFactorAuthService(this);

    public constructor() {
        this.fastify = fastify({
            loggerInstance: pino({
                name: "server",
            }),
            trustProxy: process.env.SBC_SERVER_TRUST_PROXY === "1" ? 1 : false,
        }) as unknown as FastifyInstance;
    }

    public async start() {
        await this.encryptionService.boot();

        this.fastify.listen(
            {
                port: this.port,
                host: this.host
            },
            () => {
                this.fastify.log.info(`Server started on port ${this.port}`);
            },
        );
    }

    public loadControllers(
        controllers: Array<new (server: this) => Controller>,
    ): void {
        for (const controller of controllers) {
            const instance = new controller(this);
            const actions = Reflect.getMetadata("action", instance) || [];

            for (const action of actions) {
                const handler = instance[
                    action.key as keyof typeof instance
                ] as Function;

                if (typeof handler !== "function") {
                    throw new Error("Handler is not a function");
                }

                this.fastify.route({
                    method: action.method,
                    url: action.path,
                    handler: async (request, response) => {
                        const ret = await handler.call(instance, request, response);

                        if (ret) {
                            if (ret instanceof Response) {
                                response.status(ret.status);

                                for (const [key, value] of Object.entries(ret.headers)) {
                                    response.header(key, value);
                                }

                                response.send(ret.body);
                                return;
                            }

                            response.send(ret);
                        }
                    },
                });
            }
        }
    }
}

export default Server;
