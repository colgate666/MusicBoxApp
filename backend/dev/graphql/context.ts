import { ApolloFastifyContextFunction } from "@as-integrations/fastify";
import { DatabaseSource } from "./sources/database";
import { MusicSource } from "./sources/musicbrainz";
import jwt from "jsonwebtoken";
import { Database, MusicApi } from "..";
import { Message } from "../types/message";

interface User {
    id: string;
    email: string;
    username: string;
}

export interface GraphQLContext {
    dataSources: {
        dbSource: DatabaseSource;
        movieSource: MusicSource;
    };
    user?: User;
}

export const context: ApolloFastifyContextFunction<GraphQLContext> = async request => {
    let user: User | undefined;
    const authHeader = request.headers.authorization;

    if (authHeader) {
        const payload = jwt.decode(authHeader) as string;
        const result = await Database.getUser(payload);
        const isMessage = await Message.spa(result);

        if (!isMessage.success) {
            user = result as User;
        }
    }

    return {
        dataSources: {
            dbSource: Database,
            movieSource: MusicApi,
        },
        user,
    }
};
