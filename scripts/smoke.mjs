import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";

const port = 3178;
const base = `http://127.0.0.1:${port}`;
const server = spawn("npm", ["run", "start", "-w", "@runside/web", "--", "--hostname", "127.0.0.1", "--port", String(port)], {
  cwd: new URL("../", import.meta.url), env: process.env, stdio: "pipe"
});
let logs = "";
server.stdout.on("data", chunk => { logs += chunk.toString(); });
server.stderr.on("data", chunk => { logs += chunk.toString(); });

async function call(path, token, method = "GET", body) {
  const response = await fetch(`${base}/api${path}`, { method, headers: {
    "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {})
  }, body: body ? JSON.stringify(body) : undefined });
  return { status: response.status, data: await response.json() };
}

try {
  let ready = false;
  for (let i = 0; i < 60; i++) {
    if (server.exitCode !== null) throw new Error(logs);
    try { const response = await fetch(`${base}/`); if (response.ok) { ready = true; break; } }
    catch { /* Server is still starting. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert(ready, `Server did not start: ${logs}`);
  const suffix = randomUUID().slice(0, 8);
  const register = async name => call("/auth/register", null, "POST", { name,
    email: `${name.toLowerCase()}-${suffix}@example.test`, password: "test-password-123" });
  const host = await register("Host"); const guest = await register("Guest");
  assert.equal(host.status, 201, JSON.stringify(host.data));
  assert.equal(guest.status, 201, JSON.stringify(guest.data));
  const hostToken = host.data.token; const guestToken = guest.data.token;
  const posted = await call("/runs", hostToken, "POST", {
    title: "Karura morning 5K", description: "Easy pace", startAt: new Date(Date.now() + 86400000).toISOString(),
    distanceKm: 5, paceMin: 6, latitude: -1.24567, longitude: 36.82048, placeName: "Karura Forest"
  });
  assert.equal(posted.status, 201, JSON.stringify(posted.data));
  const id = posted.data.run.id;
  const discovery = await call("/runs?lat=-1.25&lng=36.82", guestToken);
  assert.equal(discovery.status, 200);
  assert(discovery.data.runs.some(run => run.id === id));
  const detailBefore = await call(`/runs/${id}`, guestToken);
  assert.equal(detailBefore.data.run.latitude, -1.25, "Public coordinates should be rounded");
  assert.equal((await call(`/runs/${id}/messages`, guestToken)).status, 403);
  assert.equal((await call(`/runs/${id}/requests`, guestToken, "POST")).status, 200);
  const hostDetail = await call(`/runs/${id}`, hostToken);
  assert.equal(hostDetail.data.requests.length, 1);
  assert.equal((await call(`/runs/${id}/requests/${hostDetail.data.requests[0].id}`, hostToken, "PATCH", { status: "accepted" })).status, 200);
  const message = await call(`/runs/${id}/messages`, guestToken, "POST", { text: "See you at the gate!" });
  assert.equal(message.status, 201, JSON.stringify(message.data));
  const inbox = await call(`/runs/${id}/messages`, hostToken);
  assert.equal(inbox.data.messages[0].text, "See you at the gate!");
  const detailAfter = await call(`/runs/${id}`, guestToken);
  assert.equal(detailAfter.data.run.latitude, -1.24567, "Matched runners should see precise coordinates");
  console.log("Smoke test passed: sign up → post → discover → request → accept → chat");
} finally {
  server.kill("SIGTERM");
}
