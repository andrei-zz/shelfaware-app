import { Strategy } from "remix-auth/strategy";

export class TokenStrategy<User> extends Strategy<
  User,
  TokenStrategy.VerifyOptions
> {
  name = "token";

  constructor(
    verify: Strategy.VerifyFunction<User, TokenStrategy.VerifyOptions>,
    protected options?: TokenStrategy.Options
  ) {
    super(verify);
    // Do something with the options here
  }

  async authenticate(request: Request): Promise<User> {
    const url = new URL(request.url);
    let token: string | null = null;

    if (request.headers.has("Authorization")) {
      const parts = request.headers.get("Authorization")?.split(" ") ?? [];

      if (parts.length < 2) {
        throw new Error("Invalid Authorization header");
      }
      const [scheme, credentials] = parts;

      if (/^Bearer$/i.test(scheme)) token = credentials;
    }

    if (request.body !== null) {
      const { access_token: accessToken } = await request.json();
      token = accessToken;
    }

    if (url.searchParams.has("access_token")) {
      token = url.searchParams.get("access_token") as string;
    }

    if (!token) {
      throw new Error("Missing authorization token");
    }

    return this.verify({ token, request });
  }
}

export namespace TokenStrategy {
  /**
   * This interface declares what configuration the strategy needs from the
   * developer to correctly work.
   */
  export interface Options {}

  /**
   * This interface declares what the developer will receive from the strategy
   * to verify the user identity in their system.
   */
  export interface VerifyOptions {
    /**
     * The extracted token.
     */
    token: string;
    /**
     * The request that triggered the authentication.
     */
    request: Request;
  }
}
