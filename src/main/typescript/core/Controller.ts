import Server from "../server/Server";
import Response from "./Response";

abstract class Controller {
    public constructor(protected readonly server: Server) {}

    protected response(status: number, body?: unknown, headers: Record<string, string> = {}): Response {
        return new Response(status, body, headers);
    }
}

export default Controller;