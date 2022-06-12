import { Query, Resolver } from "type-graphql";

@Resolver()
export class GreetingResolver {
  @Query((_return) => String)
  hello(): string {
    return "Hello world";
  }
}
