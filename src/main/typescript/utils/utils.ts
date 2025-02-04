export function uintArrayToHex(array: Uint8Array): string {
    return Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
}


