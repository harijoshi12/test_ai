import dotenv from "dotenv";
dotenv.config();
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_KEY });

export const getOpenAIResponse = async (userInput) => {
  try {
    const messages = [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: userInput },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
    });

    // Log the entire response for debugging purposes
    // console.log("Full OpenAI response:", JSON.stringify(response, null, 2));

    // Ensure response and choices are defined
    if (response && response.choices && response.choices.length > 0) {
      const messageContent = response.choices[0].message.content;
      // console.log("OpenAI response:", messageContent);
      return messageContent; // Return the raw content
    } else {
      console.error("Unexpected response format:", response);
      throw new Error("Invalid response format from OpenAI API");
    }
  } catch (error) {
    console.error("Error getting response from OpenAI:", error);
    throw error; // Re-throw the error after logging it
  }
};
