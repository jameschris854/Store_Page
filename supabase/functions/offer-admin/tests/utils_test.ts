import { isValidMessage } from "../agent/utils.ts";
import { conversationTurnsToMessages } from "../database/sync.ts";

Deno.test("requires a non-empty message no longer than 2000 characters", () => {
  if (!isValidMessage("List all offers")) {
    throw new Error("Expected a normal message to be valid");
  }
  for (const message of ["", "  ", "x".repeat(2_001)]) {
    if (isValidMessage(message)) {
      throw new Error("Expected empty and oversized messages to be invalid");
    }
  }
});

Deno.test("restores conversation turns in chronological user-assistant order", () => {
  const messages = conversationTurnsToMessages([
    { user_message: "Second question", assistant_message: "Second answer" },
    { user_message: "First question", assistant_message: "First answer" },
  ]);
  if (
    messages.map(({ role, content }) => `${role}:${content}`).join("|") !==
      "user:First question|assistant:First answer|user:Second question|assistant:Second answer"
  ) {
    throw new Error("Expected recent turns to be restored chronologically");
  }
});
