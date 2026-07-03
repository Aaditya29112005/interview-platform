/**
 * Client helper to interface with Google's Gemini API over standard REST.
 * Bypasses the need for any NPM SDK packages while maintaining strict typing and speed.
 */

export async function generateGeminiContent(
  prompt: string | Array<{ text?: string; inlineData?: { data: string; mimeType: string } }>,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in your environment variables.');
  }

  // We use the fast and capable gemini-2.5-flash model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const parts = typeof prompt === 'string' ? [{ text: prompt }] : prompt;

  const body: {
    contents: Array<{ parts: Array<{ text?: string; inlineData?: { data: string; mimeType: string } }> }>;
    generationConfig?: { responseMimeType: string };
  } = {
    contents: [
      {
        parts: parts,
      },
    ],
  };

  if (jsonMode) {
    body.generationConfig = {
      responseMimeType: 'application/json',
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error response:', errorText);
    throw new Error(`Gemini API call failed with status: ${response.status} - ${response.statusText}`);
  }

  const result = await response.json();
  
  if (
    !result.candidates ||
    result.candidates.length === 0 ||
    !result.candidates[0].content ||
    !result.candidates[0].content.parts ||
    result.candidates[0].content.parts.length === 0
  ) {
    console.error('Unexpected Gemini API response structure:', JSON.stringify(result));
    throw new Error('Empty or malformed content response from Gemini.');
  }

  return result.candidates[0].content.parts[0].text;
}
