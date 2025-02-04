export type ActionData = {
    method: ActionMethod;
    path: string;
    key: PropertyKey;
}

export type ActionMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export function Action(method: ActionMethod, path: string): MethodDecorator {
    return <T>(object: object, key: PropertyKey, context?: TypedPropertyDescriptor<T>) => {
        const data: ActionData = {
            method,
            path,
            key
        };
        
        const existing = Reflect.getMetadata("action", object) || [];
        existing.push(data);
        Reflect.defineMetadata("action", existing, object);
    }
}