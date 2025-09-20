import express from 'express';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize ElevenLabs client
const client = new ElevenLabsClient({ 
  apiKey: process.env.ELEVEN_API_KEY 
});

/**
 * Trigger an outbound call using ElevenLabs
 * POST /api/calls/trigger
 * Body: { countryCode: string, phoneNumber: string }
 */
router.post('/trigger', async (req, res) => {
  try {
    const { countryCode, phoneNumber, conversation_initiation_client_data } = req.body;

    // Validate required fields
    if (!countryCode || !phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'Country code and phone number are required'
      });
    }

    // Validate environment variables
    const agentId = process.env.ELEVEN_AGENT_ID;
    const agentPhoneNumberId = process.env.ELEVEN_AGENT_PHONE_NUMBER_ID;

    if (!agentId || !agentPhoneNumberId) {
      return res.status(500).json({
        success: false,
        error: 'ElevenLabs configuration missing. Please check environment variables.'
      });
    }

    // Format the phone number
    const toNumber = `${countryCode}${phoneNumber}`;

    console.log('📞 Triggering call:', {
      agentId,
      agentPhoneNumberId,
      toNumber,
      conversationData: conversation_initiation_client_data
    });

    // Log the dynamic variables if they exist
    if (conversation_initiation_client_data?.dynamic_variables) {
      console.log('📅 Dynamic variables:', conversation_initiation_client_data.dynamic_variables);
    }

    // Prepare call options
    const callOptions = {
      agentId: agentId,
      agentPhoneNumberId: agentPhoneNumberId,
      toNumber: toNumber
    };

    // Add conversation initiation data if provided
    if (conversation_initiation_client_data) {
      callOptions.conversation_initiation_client_data = conversation_initiation_client_data;
    }

    // Make the outbound call
    const result = await client.conversationalAi.sipTrunk.outboundCall(callOptions);

    console.log('✅ Call triggered successfully:', result);

    res.json({
      success: true,
      message: 'Call triggered successfully',
      callId: result.callId || 'unknown',
      toNumber: toNumber,
      conversationData: conversation_initiation_client_data ? {
        date: conversation_initiation_client_data.dynamic_variables?.date,
        eventCount: conversation_initiation_client_data.dynamic_variables?.events?.length || 0,
        message: conversation_initiation_client_data.dynamic_variables?.message
      } : null
    });

  } catch (error) {
    console.error('❌ Error triggering call:', error);
    
    res.status(500).json({
      success: false,
      error: 'Failed to trigger call',
      details: error.message
    });
  }
});

/**
 * Get call status (placeholder for future implementation)
 * GET /api/calls/status/:callId
 */
router.get('/status/:callId', async (req, res) => {
  try {
    const { callId } = req.params;
    
    // This would typically check the call status with ElevenLabs
    // For now, return a placeholder response
    res.json({
      success: true,
      callId: callId,
      status: 'unknown',
      message: 'Call status endpoint - implementation pending'
    });
  } catch (error) {
    console.error('❌ Error getting call status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get call status',
      details: error.message
    });
  }
});

export default router;
