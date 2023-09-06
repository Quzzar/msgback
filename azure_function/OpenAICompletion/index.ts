import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import OpenAI from "openai";

const openAI = new OpenAI({
  apiKey: "YOUR_API_KEY_HERE",
});

let lastRequestTime = Date.now();
let requestCount = 0;
const DECREASE_AMT = 50;
const PER_MS = 1000*60*60; // Decrease at a rate of: 50 requests per 1 hour
const MAX_REQUESTS = 100;

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {

  // Rate limiting //
  const timeDifferenceMs = Date.now() - lastRequestTime;
  const instancesPassed = Math.floor(timeDifferenceMs / PER_MS);
  requestCount -= DECREASE_AMT * instancesPassed;
  if (requestCount < 0) { requestCount = 0; }
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

  const content = req.query.content || (req.body && req.body.content);
  const model = req.query.model || (req.body && req.body.model) || "gpt-4";

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
    // status: 200, /* Defaults to 200 */
    body: reply,
  };
};

export default httpTrigger;
