class Response {
    public constructor(
        public readonly status: number,
        public readonly body?: unknown,
        public readonly headers: Record<string, string> = {},
    ) {}

    public static ok(body?: unknown, headers: Record<string, string> = {}): Response {
        return new Response(200, body, headers);
    }
}

export default Response;