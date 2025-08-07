import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error('VITE_GEMINI_API_KEY is not configured in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateStudyPlan(subject: string, goals: string[], timeAvailable: number) {
  const prompt = `Create a detailed study plan for ${subject} with the following goals: ${goals.join(', ')}. 
  The student has ${timeAvailable} hours available per week. 
  Please provide a structured weekly plan with specific topics, time allocation, and study methods.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating study plan:', error);
    throw new Error('Failed to generate study plan');
  }
}

export async function generateNotesSummary(notes: string) {
  const prompt = `Please create a concise summary of the following notes, highlighting key points and important concepts: ${notes}`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

export async function generateQuizQuestions(topic: string, difficulty: 'easy' | 'medium' | 'hard') {
  const prompt = `Generate 5 ${difficulty} level quiz questions about ${topic}. 
  For each question, provide 4 multiple choice options and indicate the correct answer.
  Format as JSON with questions, options, and correct answers.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw new Error('Failed to generate quiz questions');
  }
}

export async function analyzeWithAI(input: string) {  const prompt = `You are a time parsing expert. Parse the following user input and determine what action they want to take. 
  The user can create tasks, reminders, budget entries, or navigate to different pages. 
  
  User input: "${input}"
  
  CRITICAL: Respond with ONLY a raw JSON object. Do NOT wrap it in markdown code blocks, backticks, or any other formatting. Start directly with { and end with }.
  
  Required JSON format:
  {
    "type": "task" | "reminder" | "budget" | "navigation" | "unknown",
    "action": "create" | "navigate",
    "data": {
      // For tasks:
      "title": "string",
      "description": "string (optional)",
      "priority": "low" | "medium" | "high",
      "dueDate": "YYYY-MM-DD (optional)",
      "category": "string (optional)"
      
      // For reminders:
      "title": "string",
      "time": "HH:MM (24-hour format - CRITICAL CONVERSION REQUIRED)",
      "date": "YYYY-MM-DD (optional, defaults to today)"
        // For budget:
      "type": "income" | "expense",
      "amount": number,
      "description": "string",
      "category": "string"
      
      // For navigation:
      "page": 1 | 2 | 3 | 4 | 5 | 6 | 7,
      "pageName": "study tracker" | "ai powered" | "task manager" | "reminders" | "notes" | "budget" | "study hours"
    }
  }
    CRITICAL TIME CONVERSION RULES FOR REMINDERS - FOLLOW EXACTLY:
  1. AM/PM to 24-hour conversion:
     - "7pm" or "7:00pm" → "19:00"
     - "7am" or "7:00am" → "07:00"  
     - "12pm" or "12:00pm" → "12:00" (noon)
     - "12am" or "12:00am" → "00:00" (midnight)
     - "1pm" → "13:00", "2pm" → "14:00", "3pm" → "15:00", "4pm" → "16:00"
     - "5pm" → "17:00", "6pm" → "18:00", "8pm" → "20:00", "9pm" → "21:00"
     - "10pm" → "22:00", "11pm" → "23:00"
     - "1am" → "01:00", "2am" → "02:00", etc.
  
  2. Minutes handling:
     - "7:30pm" → "19:30"
     - "2:15am" → "02:15"
     - "11:45pm" → "23:45"
  
  3. Default times:
     - If ONLY date mentioned without time → "09:00"
     - If NO time and NO date mentioned → current time or empty
  
  4. Date and Time correlation:
     - If the user provides a specific time (e.g., "7pm") along with a relative date (e.g., "today", "tomorrow"), you MUST use the specified time and not a default time. For example, "remind me at 7pm today" should result in time: "19:00".
  
  CRITICAL BUDGET AMOUNT PARSING:
  - Extract numeric amounts from rupee symbols: "₹100", "Rs 100", "rupees 100", "100 rupees"
  - Handle decimal amounts: "₹15.50", "Rs 25.75"
  - Detect spending/expense keywords: "spent", "paid", "bought", "cost"
  - Detect income keywords: "earned", "received", "salary", "income", "got"
  
  EXAMPLE CONVERSIONS (MEMORIZE THESE):
  - "remind me to call mom at 7pm" → time: "19:00"
  - "set reminder at 3am" → time: "03:00"
  - "reminder for meeting at 2:30pm" → time: "14:30"
  - "remind me at 8am tomorrow" → time: "08:00"
  - "set reminder today at 11:45pm" → time: "23:45"
  - "remind me at 7pm today" -> time: "19:00"
  - "remind me tomorrow" → time: "09:00" (date only, no time)
    Other Examples:
  - "Add task to study math homework due tomorrow" → task
  - "I spent ₹15 on lunch" → budget expense
  - "Add income of ₹500 from job" → budget income
  - "Go to tasks" → navigation to page 3
  - "Show me reminders" → navigation to page 4
  - "Open notes" → navigation to page 5
  - "Take me to budget" → navigation to page 6
  - "Study tracker" → navigation to page 1
  - "Study hours" → navigation to page 7
  
  Navigation page mappings:
  - Page 1: Study Tracker, home, main page
  - Page 2: AI Powered, ai, search
  - Page 3: Task Manager, tasks, todo
  - Page 4: Reminders, alerts, notifications
  - Page 5: Notes, note taking, writing
  - Page 6: Budget, finances, money, expenses
  - Page 7: Study Hours Tracker, timer, hours
  
  If the input is unclear or doesn't match any category, return type "unknown".`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();    // Try to parse JSON response
    try {
      // Clean up the response text by removing markdown code blocks
      let cleanText = text.trim();
      
      // Remove markdown code blocks if present
      if (cleanText.startsWith('```json') && cleanText.endsWith('```')) {
        cleanText = cleanText.slice(7, -3).trim();
      } else if (cleanText.startsWith('```') && cleanText.endsWith('```')) {
        cleanText = cleanText.slice(3, -3).trim();
      }
      
      // Additional cleaning for any remaining formatting
      cleanText = cleanText.replace(/^```json\s*/gm, '').replace(/```\s*$/gm, '');
      
      const parsedResult = JSON.parse(cleanText);
      console.log('Successfully parsed AI response:', parsedResult);
      return parsedResult;
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', text);
      console.error('Parse error:', parseError);
      
      // Try to extract JSON from the response if it's embedded in text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from response:', extractedJson);
          return extractedJson;
        } catch (secondParseError) {
          console.error('Failed to parse extracted JSON:', secondParseError);
        }
      }
      
      return { type: 'unknown', action: 'create', data: {} };
    }} catch (error) {
    console.error('Error parsing natural language command:', error);
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('API key not configured. Please check your environment variables.');
    }
    throw new Error('Failed to parse command');
  }
}

export const aiAPI = {
    analyzeWithAI
};
