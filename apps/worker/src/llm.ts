import axios from "axios";

interface LLMRequest {
  provider: string;
  apiKey: string;
  model: string;
  prompt: string;
}

export async function executeLLM({
  provider,
  apiKey,
  model,
  prompt,
}: LLMRequest): Promise<string> {
  const timeout = 30000; // 30 seconds timeout

  try {
    if (provider === "gemini") {
      // Use Gemini API
      // Gemini models typically are: gemini-1.5-flash, gemini-1.5-pro, etc.
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.0, // Force near-deterministic structured answers
          },
        },
        { timeout }
      );

      const candidate = response.data?.candidates?.[0];
      if (candidate?.finishReason && candidate.finishReason !== "STOP") {
        if (candidate.finishReason === "SAFETY") {
          throw new Error("FAILED_CONTENT_POLICY: Output was blocked by safety filters.");
        }
        throw new Error(`LLM_GEN_FAILURE: Blocked with finish reason: ${candidate.finishReason}`);
      }

      const text = candidate?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error("LLM_EMPTY_RESPONSE: Model returned an empty response.");
      }

      return text;
    } else if (provider === "openai") {
      // Use OpenAI API
      const url = "https://api.openai.com/v1/chat/completions";
      const response = await axios.post(
        url,
        {
          model: model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.0,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout,
        }
      );

      const choice = response.data?.choices?.[0];
      if (choice?.finish_reason && choice.finish_reason !== "stop") {
        if (choice.finish_reason === "content_filter") {
          throw new Error("FAILED_CONTENT_POLICY: Output was blocked by content filters.");
        }
        throw new Error(`LLM_GEN_FAILURE: Blocked with finish reason: ${choice.finish_reason}`);
      }

      const text = choice?.message?.content;
      if (!text) {
        throw new Error("LLM_EMPTY_RESPONSE: Model returned an empty response.");
      }

      return text;
    } else if (provider === "anthropic") {
      // Use Anthropic API
      const url = "https://api.anthropic.com/v1/messages";
      const response = await axios.post(
        url,
        {
          model: model,
          max_tokens: 4096,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.0,
        },
        {
          headers: {
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
          },
          timeout,
        }
      );

      const choice = response.data?.content?.[0];
      if (response.data?.stop_reason && response.data?.stop_reason !== "end_turn") {
        throw new Error(`LLM_GEN_FAILURE: Blocked with stop reason: ${response.data.stop_reason}`);
      }

      const text = choice?.text;
      if (!text) {
        throw new Error("LLM_EMPTY_RESPONSE: Model returned an empty response.");
      }

      return text;
    } else {
      throw new Error(`LLM_UNSUPPORTED_PROVIDER: Provider "${provider}" is not supported.`);
    }
  } catch (error: any) {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      console.error(`LLM API failed with status ${status}:`, data);

      if (status === 401 || status === 403) {
        throw new Error(`FAILED_CREDENTIALS: ${data?.error?.message || "Invalid API key."}`);
      }
      if (status === 429) {
        throw new Error(`FAILED_RATE_LIMIT: Quota exceeded or too many requests. Details: ${data?.error?.message || ""}`);
      }
      throw new Error(`LLM_API_ERROR: HTTP ${status} - ${data?.error?.message || error.message}`);
    }

    throw error;
  }
}
