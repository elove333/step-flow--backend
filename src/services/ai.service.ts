import { IAIFeedback } from '../types';

// Note: This service requires Node.js 18+ for native fetch API
export const getAIFeedback = async (
  sessionId: string,
  sessionData: any
): Promise<IAIFeedback> => {
  try {
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    const apiKey = process.env.AI_SERVICE_API_KEY;

    if (!aiServiceUrl) {
      console.log('AI Service URL not configured, generating basic feedback');
      return generateBasicFeedback(sessionId, sessionData);
    }

    // Check if fetch is available (Node.js 18+)
    if (typeof fetch === 'undefined') {
      console.warn('Fetch API not available. Please use Node.js 18 or higher, or install node-fetch.');
      return generateBasicFeedback(sessionId, sessionData);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Only add Authorization header if API key is provided
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // In production, this would make an HTTP request to the AI service
    const response = await fetch(`${aiServiceUrl}/analyze`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId,
        data: sessionData,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const feedback = await response.json();
    return feedback as IAIFeedback;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('AI service request timed out');
    } else {
      console.error('Error getting AI feedback:', error);
    }
    return generateBasicFeedback(sessionId, sessionData);
  }
};

const generateBasicFeedback = (
  sessionId: string,
  sessionData: any
): IAIFeedback => {
  const { steps, distance, avgPace, duration } = sessionData;

  const suggestions: string[] = [];
  const strengths: string[] = [];
  const improvements: string[] = [];

  // Analyze steps
  if (steps >= 10000) {
    strengths.push('Excellent step count - you met the recommended daily goal!');
  } else if (steps >= 5000) {
    strengths.push('Good step count - keep up the momentum!');
    suggestions.push('Try to reach 10,000 steps for optimal health benefits');
  } else {
    improvements.push('Step count is below target - try to increase gradually');
  }

  // Analyze pace
  if (avgPace >= 5 && avgPace <= 7) {
    strengths.push('Great pace! You maintained a healthy walking/running speed');
  } else if (avgPace > 7) {
    suggestions.push('Consider increasing your pace slightly for better cardiovascular benefits');
  }

  // Analyze duration
  const durationMinutes = duration / 60;
  if (durationMinutes >= 30) {
    strengths.push('Great session duration - you met the recommended exercise time');
  } else {
    suggestions.push('Try to extend your sessions to at least 30 minutes');
  }

  // Calculate score (0-100)
  let score = 0;
  if (steps >= 10000) score += 30;
  else if (steps >= 5000) score += 15;
  
  if (avgPace >= 5 && avgPace <= 7) score += 30;
  else if (avgPace > 0) score += 15;
  
  if (durationMinutes >= 30) score += 40;
  else if (durationMinutes >= 15) score += 20;

  let feedback = `Great session! You completed ${steps.toLocaleString()} steps covering ${(distance / 1000).toFixed(2)} km in ${Math.round(durationMinutes)} minutes.`;

  if (strengths.length > 0) {
    feedback += ` ${strengths.join(' ')}`;
  }

  return {
    sessionId,
    feedback,
    suggestions,
    score,
    strengths,
    improvements,
  };
};
