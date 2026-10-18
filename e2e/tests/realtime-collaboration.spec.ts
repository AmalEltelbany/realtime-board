import { expect, test, type Locator, type Page } from "@playwright/test";

async function dragTo(page: Page, source: Locator, target: Locator) {
  // dnd-kit listens to pointer events and needs a few intermediate moves to start a drag.
  const from = (await source.boundingBox())!;
  const to = (await target.boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(from.x + from.width / 2 + 10, from.y + from.height / 2 + 10, { steps: 5 });
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 15 });
  await page.mouse.up();
}

const list = (page: Page, name: string) => page.getByRole("region", { name });

test("two people on the same board see each other's changes live", async ({ browser }) => {
  // Person A starts the demo and gets a sample board.
  const alice = await (await browser.newContext()).newPage();
  await alice.goto("/");
  await alice.getByRole("button", { name: "Try the live demo" }).click();
  await alice.getByRole("link", { name: /Product launch/ }).click();
  await expect(alice.getByRole("status", { name: "Connection: Live" })).toBeVisible();

  // Person B signs up separately.
  const bob = await (await browser.newContext()).newPage();
  const bobEmail = `bob-${Date.now()}@example.com`;
  await bob.goto("/register");
  await bob.getByLabel("Name").fill("Bob Builder");
  await bob.getByLabel("Email").fill(bobEmail);
  await bob.getByLabel("Password").fill("correct horse battery");
  await bob.getByRole("button", { name: "Create account" }).click();
  await expect(bob.getByRole("heading", { name: "Your boards" })).toBeVisible();

  // A shares the board with B as an editor.
  await alice.getByRole("button", { name: "Share" }).click();
  const share = alice.getByRole("dialog", { name: "Share board" });
  await share.getByLabel("Email of a registered user").fill(bobEmail);
  await share.getByRole("button", { name: "Invite" }).click();
  await expect(share.getByText(bobEmail)).toBeVisible();
  await share.getByRole("button", { name: "Close" }).click();

  // B opens it and both see each other in the presence avatars.
  await bob.reload();
  await bob.getByRole("link", { name: /Product launch/ }).click();
  await expect(bob.getByTitle("Bob Builder is viewing")).toBeVisible();
  await expect(alice.getByTitle("Bob Builder is viewing")).toBeVisible();

  // A drags a card to Done; it moves on B's screen without a reload.
  const card = list(alice, "To do").getByText("Write launch announcement");
  await dragTo(alice, card, list(alice, "Done"));
  await expect(list(alice, "Done").getByText("Write launch announcement")).toBeVisible();
  await expect(list(bob, "Done").getByText("Write launch announcement")).toBeVisible();
  await expect(list(bob, "To do").getByText("Write launch announcement")).toHaveCount(0);

  // B adds a card; A sees it, along with the activity entry.
  await list(bob, "In progress").getByPlaceholder("+ Add a card").fill("Record walkthrough");
  await list(bob, "In progress").getByPlaceholder("+ Add a card").press("Enter");
  await expect(list(alice, "In progress").getByText("Record walkthrough")).toBeVisible();
  await expect(alice.getByRole("complementary", { name: "Activity" }).getByText(/added "Record walkthrough"/)).toBeVisible();

  // The order survives a reload, because it was saved on the server.
  await bob.reload();
  await expect(list(bob, "Done").getByText("Write launch announcement")).toBeVisible();
});

test("viewers can read a board but cannot change it", async ({ browser }) => {
  const owner = await (await browser.newContext()).newPage();
  await owner.goto("/");
  await owner.getByRole("button", { name: "Try the live demo" }).click();
  await owner.getByRole("link", { name: /Product launch/ }).click();
  await expect(owner.getByRole("status", { name: "Connection: Live" })).toBeVisible();

  const viewer = await (await browser.newContext()).newPage();
  const viewerEmail = `viewer-${Date.now()}@example.com`;
  await viewer.goto("/register");
  await viewer.getByLabel("Name").fill("Vera Viewer");
  await viewer.getByLabel("Email").fill(viewerEmail);
  await viewer.getByLabel("Password").fill("correct horse battery");
  await viewer.getByRole("button", { name: "Create account" }).click();
  await expect(viewer.getByRole("heading", { name: "Your boards" })).toBeVisible();

  await owner.getByRole("button", { name: "Share" }).click();
  const share = owner.getByRole("dialog", { name: "Share board" });
  await share.getByLabel("Email of a registered user").fill(viewerEmail);
  await share.getByLabel("Role").selectOption("VIEWER");
  await share.getByRole("button", { name: "Invite" }).click();
  await expect(share.getByText(viewerEmail)).toBeVisible();

  await viewer.reload();
  await viewer.getByRole("link", { name: /Product launch/ }).click();
  await expect(viewer.getByText("You can view this board but not change it.")).toBeVisible();
  await expect(viewer.getByPlaceholder("+ Add a card")).toHaveCount(0);
});

test("signed-out visitors are sent to the login page", async ({ page }) => {
  await page.goto("/boards");
  await expect(page).toHaveURL(/\/login\?next=%2Fboards/);
});
