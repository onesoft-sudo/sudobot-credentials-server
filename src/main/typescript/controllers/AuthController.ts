import type { FastifyRequest } from "fastify";
import { Action } from "../core/Action";
import Controller from "../core/Controller";
import { uintArrayToHex } from "../utils/utils";

class AuthController extends Controller {
    private _privateKey?: string;

    @Action("POST", "/auth/recv")
    public async index(request: FastifyRequest) {
        if (!request.body || typeof request.body !== "object" || !('code' in request.body) || typeof request.body.code !== "string") {
            return this.response(400, { error: "Invalid request body" });
        }

        const totpCode = request.body.code;
        
        if (!this.server.twoFactorAuthService.verify(undefined, totpCode)) {
            return this.response(401, { error: "Authentication failure" });
        }

        if (!this._privateKey) {
            this._privateKey = uintArrayToHex(this.server.encryptionService.getPrivateKey());
        }

        return {
            privateKey: this._privateKey,
        };
    }
}

export default AuthController;