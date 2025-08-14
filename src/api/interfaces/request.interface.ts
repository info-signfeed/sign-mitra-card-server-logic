import { Request } from "express";

export interface RequestWithUser extends Request {
    user?: { UserID: number; username: string };
}

export interface RequestWithProtocol extends Request {
    protocol: string;
}
