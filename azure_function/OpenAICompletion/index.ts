/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import parseMultipartFormData from "@anzp/azure-function-multipart";
import OpenAI from "openai";

const OPEN_AI_KEY = "YOUR_KEY_HERE";

const openAI = new OpenAI({
  apiKey: OPEN_AI_KEY,
});

let lastRequestTime = Date.now();
let requestCount = 0;
const DECREASE_AMT = 50;
const PER_MS = 1000 * 60 * 60; // Decrease at a rate of: 50 requests per 1 hour
const MAX_REQUESTS = 100;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  // Rate limiting //
  const timeDifferenceMs = Date.now() - lastRequestTime;
  const instancesPassed = Math.floor(timeDifferenceMs / PER_MS);
  requestCount -= DECREASE_AMT * instancesPassed;
  if (requestCount < 0) {
    requestCount = 0;
  }
  if (requestCount >= MAX_REQUESTS) {
    context.res = {
      status: 429,
      body: "Too many requests",
    };
    return;
  }
  lastRequestTime = Date.now();
  requestCount++;
  // ~~~~~~~~~~~~~ //

  const model = req.query.model || (req.body && req.body.model) || "gpt-4";

  if (model === "whisper-1") {
    // Transcribe audio
    const { fields, files } = await parseMultipartFormData(req);

    try {
      const audioBlob = new Blob([files[0].bufferFile], {type: files[0].mimeType});

      // Send audio to Whisper API
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
      formData.append("model", "whisper-1");
      const res = await fetch(
        "https://api.openai.com/v1/audio/transcriptions",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${OPEN_AI_KEY}`,
          },
          body: formData,
        }
      );
      if (!res.ok) {
        context.res = {
          status: 500,
          body: 'Error transcribing audio',
        };
        return;
      }
      const result = await res.json();
      const text = result.text as string;

      context.res = {
        body: text,
      };
      return;
    } catch (e) {
      context.res = {
        status: 500,
        body: "Internal Error: " + e,
      };
      return;
    }
  } else {
    // Text completion
    const content = req.query.content || (req.body && req.body.content);

    const completion = await openAI.chat.completions.create({
      messages: [
        {
          role: "user",
          content: content,
        },
      ],
      model: model,
    });

    const reply = completion.choices[0].message.content || "Error";

    context.res = {
      body: reply,
    };
    return;
  }
};

export default httpTrigger;
