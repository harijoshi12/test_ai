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

    // Extract JSON from the content using a regular expression
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      const reminderDetails = JSON.parse(jsonMatch[1]);
      console.log("Parsed OpenAI response:", reminderDetails);

      // Handle default times if the time is not specified
      if (!reminderDetails.time) {
        const timeKeyword = input.match(/morning|afternoon|evening|night/i);
        if (timeKeyword) {
          reminderDetails.time = defaultTimes[timeKeyword[0].toLowerCase()];
        } else {
          // Add missing time to missingInfo
          reminderDetails.missingInfo = reminderDetails.missingInfo || [];
          reminderDetails.missingInfo.push("time");
        }
      }

      // Check for other missing information
      if (!reminderDetails.task) {
        reminderDetails.missingInfo = reminderDetails.missingInfo || [];
        reminderDetails.missingInfo.push("task");
      }
      if (!reminderDetails.recurrence && input.includes("every")) {
        reminderDetails.missingInfo = reminderDetails.missingInfo || [];
        reminderDetails.missingInfo.push("recurrence");
      }
      if (!reminderDetails.startDate && input.includes("starting")) {
        reminderDetails.missingInfo = reminderDetails.missingInfo || [];
        reminderDetails.missingInfo.push("start date");
      }
      if (!reminderDetails.endDate && input.includes("for")) {
        reminderDetails.missingInfo = reminderDetails.missingInfo || [];
        reminderDetails.missingInfo.push("end date");
      }

      // Return the parsed reminder details
      return reminderDetails;
    } else {
      throw new Error("Failed to extract JSON from OpenAI response");
    }
  } catch (error) {
    console.error("Error parsing reminder:", error);
    return null;
  }
};
