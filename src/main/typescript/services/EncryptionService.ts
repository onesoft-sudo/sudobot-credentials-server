import Service from "../core/Service";
import { readFile } from "fs/promises";import { MlKem768 } from 'mlkem';

class EncryptionService extends Service {
    private publicKey?: Uint8Array;
    private privateKey?: Uint8Array;
    private encryptionManager = new MlKem768();

    public override async boot() {
        const pubKeyString = await readFile(
            process.env.SBC_PUBLIC_KEY!,
            "binary",
        );
        const privKeyString = await readFile(
            process.env.SBC_PRIVATE_KEY!,
            "binary",
        );

        this.publicKey = new Uint8Array(Buffer.from(pubKeyString, "binary"));
        this.privateKey = new Uint8Array(Buffer.from(privKeyString, "binary"));
    }

    public async getPublicKeyCipher(): Promise<Uint8Array<ArrayBufferLike>> {
        if (!this.publicKey) {
            throw new Error("Public key not loaded");
        }

        return (await this.encryptionManager.encap(this.publicKey))[0];
    }

    public getPrivateKey(): Uint8Array {
        if (!this.privateKey) {
            throw new Error("Private key not loaded");
        }

        return this.privateKey;
    }
}

export default EncryptionService;
