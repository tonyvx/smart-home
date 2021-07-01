const keytar = require("keytar");

async function setupSecrets(message) {

    const agg = message ? Object.keys(message).reduce((a, k) => message[k] ? { ...a, [k]: message[k] } : a, {}) : {};
  
    if (agg.SPOTIFY_CLIENT_ID && agg.SPOTIFY_CLIENT_SECRET)
        agg.AUTHORIZATION = "Bearer " + Buffer.from(agg.SPOTIFY_CLIENT_ID + ":" + agg.SPOTIFY_CLIENT_SECRET).toString('base64');

    await Promise.all(Object.keys(agg).reduce((a, s) => [...a, keytar.setPassword("smart-home", s, agg[s])], []));

    const test = await keytar.findCredentials("smart-home");

    console.log("setupSecrets", test.map(t => t.account));
}

const secrets = (account) => keytar.getPassword("smart-home", account);

module.exports = { secrets, setupSecrets }