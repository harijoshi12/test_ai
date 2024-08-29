import express from "express";
import { parseReminder } from "./parseReminder.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Endpoint to handle POST requests to parse reminders
app.post("/", async (req, res) => {
  const { userInput } = req.body;
  console.log("User input:", userInput);

  if (!userInput) {
    return res.status(400).json({ error: "User input is required" });
  }
  try {
    const reminderDetails = await parseReminder(userInput);
    console.log("Reminder details:", reminderDetails);
    res.json(reminderDetails);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while parsing the reminder" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
