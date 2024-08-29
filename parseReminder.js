import { getOpenAIResponse } from "./openaiService.js";

// Default times for different parts of the day
const defaultTimes = {
  morning: "08:00",
  afternoon: "13:00",
  evening: "18:00",
  night: "21:00",
};

// Utility function to parse user input for reminders using OpenAI
export const parseReminder = async (input) => {
  try {
    // Prompt OpenAI to extract reminder details
    const prompt = `
      Extract the following details from the reminder request:
      - Task
      - Time (in 24-hour format, e.g., 14:00 for 2 PM)
      - Recurrence (e.g., daily, weekly, every third day)
      - Start Date (in YYYY-MM-DD format)
      - End Date (in YYYY-MM-DD format)
      - Interval (if applicable)
      - Any missing information

      User input: "${input}"

      Provide the details in JSON format with keys: task, time, recurrence, startDate, endDate, interval, missingInfo.
    `;

    const response = await getOpenAIResponse(prompt);

    // Extract JSON from the response using a regular expression
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("Failed to extract JSON from OpenAI response");
    }

    // Parse the extracted JSON
    const reminderDetails = JSON.parse(jsonMatch[1]);
    console.log("Parsed OpenAI response:", reminderDetails);

    // Initialize missingInfo if not already present
    reminderDetails.missingInfo = reminderDetails.missingInfo || [];

    // Handle default times if the time is not specified
    if (!reminderDetails.time) {
      const timeKeyword = input.match(/morning|afternoon|evening|night/i);
      if (timeKeyword) {
        reminderDetails.time = defaultTimes[timeKeyword[0].toLowerCase()];
      } else if (!reminderDetails.missingInfo.includes("time")) {
        // Add missing time to missingInfo
        reminderDetails.missingInfo.push("time");
      }
    }

    // Check for other missing information based on context
    if (
      !reminderDetails.task &&
      !reminderDetails.missingInfo.includes("task")
    ) {
      reminderDetails.missingInfo.push("task");
    }
    if (
      !reminderDetails.recurrence &&
      input.includes("every") &&
      !reminderDetails.missingInfo.includes("recurrence")
    ) {
      reminderDetails.missingInfo.push("recurrence");
    }
    if (
      !reminderDetails.startDate &&
      input.includes("starting") &&
      !reminderDetails.missingInfo.includes("start date")
    ) {
      reminderDetails.missingInfo.push("start date");
    }
    if (
      !reminderDetails.endDate &&
      input.includes("for") &&
      !reminderDetails.missingInfo.includes("end date")
    ) {
      reminderDetails.missingInfo.push("end date");
    }
    if (
      !reminderDetails.interval &&
      input.includes("every") &&
      !reminderDetails.missingInfo.includes("interval")
    ) {
      reminderDetails.missingInfo.push("interval");
    }

    // Return the parsed reminder details
    return reminderDetails;
  } catch (error) {
    console.error("Error parsing reminder:", error);
    return null;
  }
};
