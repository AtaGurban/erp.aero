import * as redis from 'redis';
const REDIS_PORT = process.env.REDIS_PORT ? +process.env.REDIS_PORT : 5000;
const REDIS_HOST = process.env.REDIS_HOST ? process.env.REDIS_HOST : "";
const redisClient = redis.createClient({socket:{host: REDIS_HOST, port: REDIS_PORT}});
export const redisTime = 60 * 60;
redisClient.on("error", async function(err) {
    console.log("Error " + err);
})

export default redisClient