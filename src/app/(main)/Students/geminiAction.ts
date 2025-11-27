"use server"

export async function generateGeminiResponse(prompt: string, systemInstruction: string): Promise<{ reply: string }> {
  const apiKey = process.env.GEMINI_API_KEY?.replace(/['";]/g, '');
  const model = process.env.GEMINI_MODEL?.replace(/['";]/g, '') || 'gemini-2.5-flash-preview-09-2025';
  
  if (!apiKey) {
    console.error("GEMINI_API_KEY not found");
    return { reply: "Error: GEMINI_API_KEY not configured" };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [{
      parts: [{ text: systemInstruction + "\n\n" + prompt }]
    }]
  };

  // Implement simple retry logic for transient errors (503/429/5xx)
  const maxAttempts = 4
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        // Try to parse JSON error message if present
        let errorText = await response.text();
        try { const parsed = JSON.parse(errorText); errorText = parsed.error?.message || JSON.stringify(parsed) } catch (e) { /* keep raw text */ }
        console.error(`Gemini API Error (attempt ${attempt}/${maxAttempts}): ${response.status} ${response.statusText}`, errorText);

        // Retry for transient status codes
        if ([429, 503, 500].includes(response.status) && attempt < maxAttempts) {
          const backoff = Math.round(Math.pow(2, attempt) * 500 + Math.random() * 500);
          console.log(`Retrying Gemini API after ${backoff}ms due to status ${response.status}`);
          await new Promise(r => setTimeout(r, backoff));
          continue
        }

        return { reply: `Error desde Gemini: ${response.status} ${errorText}` };
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      return { reply: text };

    } catch (error) {
      console.error(`Error calling Gemini API (attempt ${attempt}/${maxAttempts}):`, error);
      if (attempt < maxAttempts) {
        const backoff = Math.round(Math.pow(2, attempt) * 500 + Math.random() * 500);
        console.log(`Retrying Gemini API after ${backoff}ms due to network error`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      }
      return { reply: "Error calling Gemini API" };
    }
  }
}
