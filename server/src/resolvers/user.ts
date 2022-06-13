import { User } from "./../entities/User";
import { Mutation, Query, Resolver } from "type-graphql";
import { RegisterInput } from "src/types/RegisterInput";

@Resolver()
export class UserResolver {
  @Query((_return) => [User])
  async users(): Promise<User[]> {
    return await User.find();
  }
}
