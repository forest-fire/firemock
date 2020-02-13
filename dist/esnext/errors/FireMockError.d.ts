export declare class FireMockError extends Error {
    firemodel: boolean;
    code: string;
    constructor(message: string, classification?: string);
}
