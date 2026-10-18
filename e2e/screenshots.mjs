// Captures README screenshots. Run with both apps up: node e2e/screenshots.mjs
import { chromium } from "@playwright/test";

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const make = async (scheme) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 860 }, colorScheme: scheme, deviceScaleFactor: 2 });
  return context.newPage();
};

const alice = await make("light");
await alice.goto("http://localhost:3000/");
await alice.screenshot({ path: "docs/landing.png" });
await alice.getByRole("button", { name: "Try the live demo" }).click();
await alice.getByRole("link", { name: /Product launch/ }).click();
await alice.getByRole("status", { name: "Connection: Live" }).waitFor();

const bob = await make("dark");
const email = `teammate-${Date.now()}@example.com`;
await bob.goto("http://localhost:3000/register");
await bob.getByLabel("Name").fill("Sara Hassan");
await bob.getByLabel("Email").fill(email);
await bob.getByLabel("Password").fill("correct horse battery");
await bob.getByRole("button", { name: "Create account" }).click();
await bob.getByRole("heading", { name: "Your boards" }).waitFor();

await alice.getByRole("button", { name: "Share" }).click();
const share = alice.getByRole("dialog", { name: "Share board" });
await share.getByLabel("Email of a registered user").fill(email);
await share.getByRole("button", { name: "Invite" }).click();
await share.getByText(email).waitFor();
await share.getByRole("button", { name: "Close" }).click();

await bob.reload();
await bob.getByRole("link", { name: /Product launch/ }).click();
await bob.getByRole("status", { name: "Connection: Live" }).waitFor();
for (const title of ["Record walkthrough", "Update pricing page"]) {
  await bob.getByRole("region", { name: "In progress" }).getByPlaceholder("+ Add a card").fill(title);
  await bob.getByRole("region", { name: "In progress" }).getByPlaceholder("+ Add a card").press("Enter");
}
await alice.getByRole("region", { name: "In progress" }).getByText("Update pricing page").waitFor();
await alice.waitForTimeout(500);
await alice.screenshot({ path: "docs/board-light.png" });
await bob.screenshot({ path: "docs/board-dark.png" });
await browser.close();
