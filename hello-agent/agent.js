import { ChatOllama } from '@langchain/ollama'
import { HumanMessage } from '@langchain/core/messages'
import { tool } from '@langchain/core/tools'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { z } from 'zod'

// 1. Define a tool — the function + its description, together
const getWeather = tool(
  async ({ city }) => {
    return `The weather in ${city} is sunny, 25°C.`
  },
  {
    name: 'getWeather',
    description: 'Get the current weather for a given city',
    schema: z.object({
      city: z.string().describe('The city name'),
    }),
  }
)

// 2. The model
const model = new ChatOllama({ model: 'qwen2.5:7b' })

// 3. Build an agent — model + tools, and LangChain wires up the LOOP
const agent = createReactAgent({
  llm: model,
  tools: [getWeather],
})

// 4. Run it
const result = await agent.invoke({
  messages: [new HumanMessage("What's the weather in Hyderabad?")],
})

// 5. The final answer is the last message
console.log(result.messages.at(-1).content)










// 🔍 What changed — and what it means

// tool(fn, {...}) — this bundles your function and its description into one object. Compare to raw     
// tool(fn, {...}) — this bundles your function and its description into one object. Compare to raw     
// Ollama, where you wrote the function and the JSON schema separately. Here z.object({ city: z.string()
// }) is the schema — zod generates the JSON Schema for you. Cleaner, but same concept.

// createReactAgent({ llm, tools }) — 🤯 this one line replaces your entire while loop. "ReAct" = Reason
// + Act, the exact THINK→ACT→OBSERVE pattern you built by hand. LangChain runs all of it internally:   
// calls the model, sees tool_calls, runs your getWeather, feeds the result back, loops until done. You 
// wrote ~40 lines for this; now it's one function — and you know exactly what it's doing inside.

// agent.invoke({ messages: [...] }) — same universal .invoke(), but an agent returns the whole 
// conversation in result.messages. The final answer is the last one, hence
// result.messages.at(-1).content.