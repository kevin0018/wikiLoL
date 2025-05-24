import { GetAccountByRiotIdHandler } from "../../../../src/app/query/account/GetAccountByRiotIdHandler.js";
import { GetAccountByRiotIdQuery } from "../../../../src/app/query/account/GetAccountByRiotIdQuery.js";
import {describe, expect, it, jest} from '@jest/globals';

describe("GetAccountByRiotIdHandler", () => {
    it("should return account data when repository returns an account", async () => {
        const mockRepo = {
            getByRiotId: jest.fn().mockResolvedValue({ puuid: "123", gameName: "Fake", tagLine: "EUW" }),
        };
        const handler = new GetAccountByRiotIdHandler(mockRepo);
        const query = new GetAccountByRiotIdQuery("Fake", "EUW");
        const result = await handler.execute(query);
        expect(result).toEqual({ puuid: "123", gameName: "Fake", tagLine: "EUW" });
    });

    it("should throw error if repository throws", async () => {
        const mockRepo = {
            getByRiotId: jest.fn().mockRejectedValue(new Error("Not found")),
        };
        const handler = new GetAccountByRiotIdHandler(mockRepo);
        const query = new GetAccountByRiotIdQuery("Fake", "NA");
        await expect(handler.execute(query)).rejects.toThrow("Not found");
    });
});