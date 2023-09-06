import { FollowUpType, Message } from ".";
import { AI_FUNCTION_URL } from "./data";


export function getFollowUpPrompt(type: FollowUpType, extraInstructions: string, convo: Message[]) {

  let p = `I'm talking to a girl on a dating app. Please help me come up with a follow-up message to send her. The message shouldn't be corny - don't try and play games. This conversation should be interesting and engaging. The end goal should be to build a connection and go on a date with her.`;

  if (type === "SMOOTH") {
    p += `\nThis message should be short, smooth, and consise, max 60 characters.`
  } else if (type === "DEEP") {
    p += `\nI want to ask her a question that will make her think. This question should be short and consise, max 120 characters.
    
    Here are some examples:

    - What is your favorite childhood memory?
    - What's the one subject you could talk about for hours without getting bored?
    - What is your definition of a best friend?
    - Do you think there's extra-terrestrial life out there? There are billions of galaxies in the universe, and each galaxy has billions of stars. It's hard to believe that we're the only planet with life on it.
    - What promises have you currently made for yourself or others?
    - What's your go-to karaoke song?
    - What does your week typically look like?
    - From morning to night, how would you describe your version of the perfect day?
    - What does your voice of intuition sound like?
    - How is your relationship with your father?
    - What's your life-long dream? (if you have one)
    - Who are the people that made you who you are today?
    - What's something you're really proud of yourself for?
    - If you could give advice to your younger self, what would it be?

    Make sure the question is open-ended and not a yes/no question. The question should be related to the conversation we've been having so far.

    `
  } else if (type === "FUNNY") {
    p += `\nMake a joke based on the context of the current conversation. Could be a stupid pun or some banter. No corny jokes. This message should be short and consise, max 60 characters.`
  }

  if (extraInstructions) {
    p += `\nAdditional details: ${extraInstructions}`;
  }

  p += `\nHere is our conversation so far:
        ${convo
          .map((msg) => `${msg.source === "YOU" ? "Me" : "Them"}: ${msg.text}`)
          .join("\n")}
  `;

  return p;

}


export async function getAICompletion(content: string) {

  const res = await fetch(AI_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content: content,
      //model: "gpt-4",
    }),
  });
  return res.ok
    ? await res.text()
    : "Too many requests, please try again later.";

}