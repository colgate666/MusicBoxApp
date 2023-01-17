import "reflect-metadata";
import { ApolloServer } from "@apollo/server";
import fastifyApollo, { fastifyApolloDrainPlugin } from "@as-integrations/fastify";
import dotenv from "dotenv";
import fastify from "fastify";
import path from "path";
import { 
    ApolloServerPluginLandingPageLocalDefault, 
    ApolloServerPluginLandingPageProductionDefault 
} from '@apollo/server/plugin/landingPage/default';
import { DatabaseSource } from "./graphql/sources/database";
import { MusicSource } from "./graphql/sources/musicbrainz";
import { context, GraphQLContext } from "./graphql/context";
import { schema } from "./graphql/schema";
import fastifyStatic from "@fastify/static";
import { avatarRouter } from "./routers/avatar";

dotenv.config();

export const APP_ROOT = path.resolve(__dirname, "../");

const PORT = process.env.PORT === undefined ? 8080 : Number.parseInt(process.env.PORT);
const server = fastify({ logger: true });

export const LOG = server.log;
export const Database = new DatabaseSource();
export const MusicApi = new MusicSource();

const apollo = new ApolloServer<GraphQLContext>({
    schema,
    plugins: [
        fastifyApolloDrainPlugin(server),
        process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageProductionDefault({
          graphRef: 'my-graph-id@my-graph-variant',
          footer: false,
        })
      : ApolloServerPluginLandingPageLocalDefault({ footer: false }),
    ],
    nodeEnv: process.env.NODE_ENV,
});

(async () => {
    await apollo.start();

    await server.register(fastifyApollo(apollo), { context });
    await server.register(avatarRouter, { prefix: "/user" });
    await server.register(fastifyStatic, {
        root: path.join(APP_ROOT, "public"),
        wildcard: false,
    });

    server.listen({ port: PORT, host: "0.0.0.0" }, async (err, add) => {
        if (err) {
            server.log.error(err);
            process.exit(1);
        }

        //server started
    });
})();
