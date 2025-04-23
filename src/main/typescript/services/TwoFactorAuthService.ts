import * as crypto from "crypto";
import Service from "../core/Service";

class TwoFactorAuthService extends Service {
    private readonly STEP = 30;
    private readonly LENGTH = 6;
    private readonly ALGORITHM = "sha1";

    public base32DecodeToBuffer(secret: string = process.env.SBC_2FA_SECRET!) {
        const base32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        const base32Buffer = Buffer.from(secret.toUpperCase());
        const secretBuffer = Buffer.alloc((base32Buffer.length * 5) / 8);
        let bits = 0;
        let value = 0;
        let index = 0;

        for (let i = 0; i < base32Buffer.length; i++) {
            const byte = base32Buffer[i];
            const val = base32.indexOf(String.fromCharCode(byte));

            if (val === -1) {
                throw new Error("Invalid character found in base32 string");
            }

            value = (value << 5) | val;
            bits += 5;

            if (bits >= 8) {
                secretBuffer[index] = value >> (bits - 8);
                index++;
                bits -= 8;
            }
        }

        return secretBuffer;
    }

    public generate(secret: string = process.env.SBC_2FA_SECRET!, time = Date.now() / 1000) {
        const secretBuffer = this.base32DecodeToBuffer(secret);
        const timeBuffer = Buffer.alloc(8);
        timeBuffer.writeBigInt64BE(
            BigInt(Math.floor(time / this.STEP)),
            0,
        );
        const hmac = crypto.createHmac(
            this.ALGORITHM,
            secretBuffer,
        );
        hmac.update(timeBuffer);
        const hash = hmac.digest();
        const offset = hash[hash.length - 1] & 0xf;
        const binary =
            (hash.readUInt32BE(offset) & 0x7fffffff) %
            Math.pow(10, this.LENGTH);
        return binary.toString().padStart(this.LENGTH, "0");
    }

    public verify(
        secret: string = process.env.SBC_2FA_SECRET!,
        token: string,
        time = Date.now() / 1000,
    ) {
        const generated = this.generate(secret, time);
        return crypto.timingSafeEqual(
            Buffer.from(generated),
            Buffer.from(token),
        );
    }

    public generateSecret(length = 16) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        let secret = "";

        for (let i = 0; i < length; i++) {
            secret += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return secret;
    }
}

export default TwoFactorAuthService;
