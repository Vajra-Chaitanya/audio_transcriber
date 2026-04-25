import { authClient } from "./src/lib/auth-client";
import { createAuthClient } from "better-auth/react";

async function main() {
  console.log("Trying to sign in with admin2@example.com...");
  try {
    const response = await fetch("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Origin": "http://localhost:3000",
        "Referer": "http://localhost:3000/"
      },
      body: JSON.stringify({ email: "admin2@example.com", password: "password123" })
    });
    const data = await response.json();
    console.log("Response status:", response.status);
    console.log("Response body:", data);
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

main();
