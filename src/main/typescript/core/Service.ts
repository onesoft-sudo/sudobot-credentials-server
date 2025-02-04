import Server from "../server/Server";

abstract class Service {
    public constructor(protected readonly server: Server) {}
    public async boot() {}
}

export default Service;