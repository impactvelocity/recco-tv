import { MemoryStore } from "./memory";
import { storeContract } from "./contract";

storeContract("memory", async () => new MemoryStore());
