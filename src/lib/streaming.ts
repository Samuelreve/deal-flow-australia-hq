// SSE Streaming utilities for AI responses

export interface StreamCallbacks {
  onDelta: (text: string) => void;
  onDone: () => void;
  onError?: (error: Error) => void;
}

/**
 * Parse SSE stream from edge function and emit tokens as they arrive
 */
export async function parseSSEStream(
  response: Response,
  callbacks: StreamCallbacks
): Promise<void> {
  const { onDelta, onDone, onError } = callbacks;

  if (!response.ok || !response.body) {
    const error = new Error(`Stream failed: ${response.status}`);
    onError?.(error);
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let streamDone = false;

  try {
    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process line-by-line as data arrives
      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        // Handle CRLF
        if (line.endsWith('\r')) line = line.slice(0, -1);
        
        // Skip comments and empty lines
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        
        if (jsonStr === '[DONE]') {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            onDelta(content);
          }
        } catch {
          // Incomplete JSON - put it back and wait for more data
          buffer = line + '\n' + buffer;
          break;
        }
      }
    }

    // Final flush of remaining buffer
    if (buffer.trim()) {
      for (let raw of buffer.split('\n')) {
        if (!raw) continue;
        if (raw.endsWith('\r')) raw = raw.slice(0, -1);
        if (raw.startsWith(':') || raw.trim() === '') continue;
        if (!raw.startsWith('data: ')) continue;
        
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === '[DONE]') continue;
        
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          // Ignore partial leftovers
        }
      }
    }

    onDone();
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

/**
 * Create streaming fetch request to copilot edge function
 */
export async function streamCopilotResponse(
  supabaseUrl: string,
  accessToken: string,
  payload: {
    operation: string;
    dealId?: string;
    userId: string;
    content?: string;
    chatHistory?: Array<{ role: string; content: string }>;
    stream?: boolean;
  },
  callbacks: StreamCallbacks
): Promise<void> {
  const response = await fetch(`${supabaseUrl}/functions/v1/copilot`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ ...payload, stream: true }),
  });

  return parseSSEStream(response, callbacks);
}

export default { parseSSEStream, streamCopilotResponse };
