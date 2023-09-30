/**
 * Time between ticks on the game server. Measured in milliseconds.
 */
let delta = 50;
/**
 * Ticks per second.
 */
let tickrate = 20;

// Using setImmediate so the tickrate can be read from the dotenv file.
setImmediate(() => {
    if (process.env.TICKRATE) {
        console.log(`Configured tickrate is ${process.env.TICKRATE}`);
        tickrate = Number(process.env.TICKRATE);
        delta = 1000 / tickrate;
    } else {
        console.log(`Tickrate is not configured. Falling back to 20 as a default`);
    }
})

export { delta, tickrate };
