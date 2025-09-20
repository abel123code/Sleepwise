import { Router } from "express";
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/events/breakdown
router.post("/breakdown", async (req, res) => {
  try {
    console.log('🔍 Event breakdown request received');
    console.log('📥 Request body:', req.body);

    // Validate required fields
    const { title, date, startTime, endTime, duration } = req.body;
    
    if (!title || !date || !startTime || !endTime || !duration) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['title', 'date', 'startTime', 'endTime', 'duration'],
        received: { title, date, startTime, endTime, duration }
      });
    }

    // Optional fields
    const { description, location, eventType } = req.body;

    // Generate event ID
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create prompt for OpenAI
    const prompt = `You are a productivity assistant. Given a calendar event, generate a comprehensive checklist of subtasks.

Event Details:
- Title: ${title}
- Date: ${date}
- Time: ${startTime} - ${endTime}
- Duration: ${duration} minutes
- Description: ${description || 'No description provided'}
- Location: ${location || 'No location specified'}
- Event Type: ${eventType || 'Not specified'}

Requirements:
- Generate 5–8 subtasks ONLY about preparation *before* the event (ideally the evening/night before).
- Do not include tasks that happen during or after the event itself.
- Subtasks should be specific, actionable, and practical (e.g., "Prepare meeting notes", "Lay out clothes", "Set up Zoom link", "Block distractions").
- "estimatedTime" must be a string in minutes (e.g., "10 minutes").
- "priority" must be one of: "high", "medium", "low".

Return ONLY a valid JSON object with this exact shape:
{
  "subtasks": [
    { "id": "prep_1", "text": "...", "estimatedTime": "X minutes", "priority": "high|medium|low" }
  ]
}

Do not include any other text, explanations, or formatting or markdown. Just the JSON array.`;

    console.log('🤖 Calling OpenAI API...');
    
    // Call OpenAI API
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-5",
    //   messages: [
    //     {
    //       role: "user",
    //       content: prompt
    //     }
    //   ],
    //   max_completion_tokens: 1000,
    //   response_format: { type: "json_object" }
    // });


     const completion = await openai.responses.create({
         model: "gpt-4.1",
         input: prompt,
       });

    console.log('✅ OpenAI response received');
    console.log('📊 Full completion object:', JSON.stringify(completion, null, 2));

    // Parse the response - Responses API has different structure
    const responseText = completion.output_text;
    console.log('📝 OpenAI response:', responseText);

    let subtasks;
    try {
      // Parse the JSON response
      const parsedResponse = JSON.parse(responseText);
      console.log('📋 Parsed response:', parsedResponse);
      
      // Extract subtasks from the response
      subtasks = parsedResponse.subtasks || parsedResponse;
      console.log('📝 Extracted subtasks:', subtasks);
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError);
      return res.status(500).json({
        error: 'Failed to parse AI response',
        message: 'OpenAI returned invalid JSON format'
      });
    }

    // Validate subtasks structure
    if (!Array.isArray(subtasks) || subtasks.length === 0) {
      return res.status(500).json({
        error: 'Invalid subtasks format',
        message: 'OpenAI returned empty or invalid subtasks'
      });
    }

    // Add eventId to each subtask
    const subtasksWithIds = subtasks.map((subtask, index) => ({
      id: `subtask_${index + 1}`,
      text: subtask.text || subtask,
      estimatedTime: subtask.estimatedTime || '15 minutes',
      priority: subtask.priority || 'medium'
    }));

    const response = {
      eventId,
      eventTitle: title,
      eventDate: date,
      subtasks: subtasksWithIds,
      generatedAt: new Date().toISOString()
    };

    console.log('📤 Sending response:', {
      eventId: response.eventId,
      subtaskCount: response.subtasks.length
    });

    res.json(response);

  } catch (error) {
    console.error('❌ Error in breakdown route:', error);
    res.status(500).json({
      error: 'Failed to generate subtasks',
      message: error.message
    });
  }
});

export default router;
