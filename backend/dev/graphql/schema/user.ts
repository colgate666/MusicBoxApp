import { IsEmail, Length } from "class-validator";
import { ObjectType, ID, Field, InputType, Resolver, Query, Arg, Ctx, Mutation } from "type-graphql";
import { Message } from "../../types/message";
import { GraphQLContext } from "../context";
import { DBUser } from "../../types/database/user";
import jwt from "jsonwebtoken";

@ObjectType()
class User {
    @Field(type => ID)
    id!: string;

    @Field(type => String)
    username!: string;

    @Field(type => String)
    email!: string;

    @Field(type => String)
    password!: string;

    @Field(type => String, { nullable: true })
    avatar?: string;
}

@InputType()
class RegisterInput implements Partial<User> {
    @Field(type => String)
    @Length(3, 30, { message: "Username length must be between 3 and 30 characters." })
    username!: string;

    @Field(type => String)
    @IsEmail()
    email!: string;

    @Field(type => String)
    @Length(3, 30, { message: "Password length must be between 3 and 30 characters." })
    password!: string;

    @Field(type => String, { nullable: true })
    avatar?: string;
}

@InputType()
class LoginInput implements Partial<User> {
    @Field(type => ID)
    user!: string;

    @Field(type => String)
    @Length(3, 30, { message: "Password length must be between 3 and 30 characters." })
    password!: string;
}

@Resolver(User)
export class UserResolver {
    @Query(returns => User)
    async getUser(
        @Arg("user_id", type => String) id: string, 
        @Ctx() context: GraphQLContext
    ): Promise<User> {
        const response = await context.dataSources.dbSource.getUser(id);
        const isMessage = await Message.spa(response);

        if (isMessage.success) {
            throw new Error(isMessage.data.body);
        }

        const data = response as DBUser;
        return {
            email: data.email,
            id: data.id,
            password: "",
            username: data.username,
        };
    }

    @Query(returns => User)
    async getUserByUsernameOrEmail(
        @Arg("user", type => String) user: string,
        @Ctx() context: GraphQLContext,
    ): Promise<User> {
        const result = await context.dataSources.dbSource.getByUsernameOrEmail(user, user);

        if (!result) {
            throw new Error("User not found");
        }

        return {
            id: result.id,
            email: result.email,
            password: "",
            username: result.username,
        };
    }

    @Mutation(returns => User)
    async addUser(
        @Arg("input", type => RegisterInput) registerInput: RegisterInput,
        @Ctx() context: GraphQLContext,
    ): Promise<User> {
        const result = await context.dataSources.dbSource.insertUser(
            registerInput.username,
            registerInput.email,
            registerInput.password,
            registerInput.avatar
        );

        if (!result) {
            throw new Error("Error registering account. Try again later.");
        }

        return {
            email: result.email,
            id: result.id,
            password: "",
            username: result.username,
        };
    }

    @Mutation(returns => String)
    async login(
        @Arg("input", type => LoginInput) loginInput: LoginInput,
        @Ctx() context: GraphQLContext,
    ) {
        const result = await context.dataSources.dbSource.checkPassword(
            loginInput.user, loginInput.password
        );

        if (result.code !== 200) {
            throw new Error(result.body);
        }

        return jwt.sign(loginInput.user, process.env.JWT_SECRET!);
    }
}
