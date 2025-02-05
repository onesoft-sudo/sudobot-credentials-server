import Service from "../core/Service";
import { readFile } from "fs/promises";

class EncryptionService extends Service {
    private publicKey?: Uint8Array;
    private privateKey?: Uint8Array;

    public override async boot() {
        const pubKeyType = process.env.SBC_PUBLIC_KEY?.endsWith(".keyhex")
            ? "hex"
            : "binary";
        const privKeyType = process.env.SBC_PRIVATE_KEY?.endsWith(".keyhex")
            ? "hex"
            : "binary";
        const pubKeyString = await readFile(
            process.env.SBC_PUBLIC_KEY!,
            pubKeyType === "hex" ? "utf8" : pubKeyType,
        );
        const privKeyString = await readFile(
            process.env.SBC_PRIVATE_KEY!,
            privKeyType === "hex" ? "utf8" : privKeyType,
        );

        this.publicKey = new Uint8Array(Buffer.from(pubKeyString, pubKeyType));
        this.privateKey = new Uint8Array(
            Buffer.from(privKeyString, privKeyType),
        );
    }

    public getPrivateKey(): Uint8Array {
        if (!this.privateKey) {
            throw new Error("Private key not loaded");
        }

        return this.privateKey;
    }
}

export default EncryptionService;
