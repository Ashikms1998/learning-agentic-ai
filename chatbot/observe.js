import { ChatOllama } from "@langchain/ollama"
import { HumanMessage } from "@langchain/core/messages"
import {tool} from '@langchain/core/tools'
import { createReactAgent } from '@langchain/langgraph/prebuilt'
import { z } from 'zod'



const getWeather = tool(
    async ({ city }) => `The weather in ${city} is sunny, 25°C.`,
    { name: 'getWeather', description: 'Get the current weather for a city',
      schema: z.object({ city: z.string() }) }
)

const model = new ChatOllama({ model: 'qwen2.5:7b' })
const agent = createReactAgent({ llm: model, tools: [getWeather] })

const observer = {
    handleLLMStart: () => console.log('🧠 [LLM] thinking...'),
    handleLLMEnd:   () => console.log('🧠 [LLM] responded'),
    handleToolStart: (_tool, input) => console.log('🔧 [TOOL] called with:', input),
    handleToolEnd:   (output) => console.log('🔧 [TOOL] returned:', output),
  }
console.log(observer,"😶‍🌫️")


const result= await agent.invoke(
    {messages:[new HumanMessage("Whast the weather in Hyderabad")]},
    {callbacks:[observer]}
)

console.log('\n💬 Final:', result)



// Observability, in one sentence

//   ▎ Observability = watching what your agent does step-by-step, instead of only seeing the final answer.

//   Think of a food delivery tracking page. You don't just see "Delivered." You see: order placed → cooking → picked up → on the way → delivered.  

//   Observability is that tracking page, but for your agent's steps. Normally you only see the agent's final answer. Observability shows you the   
//   steps it took to get there.



//   When you asked "weather in Hyderabad?", normally you'd just see the final sentence. But your observer printed the hidden steps:

//   🧠 LLM thinking   → the AI looked at your question and thought "I need the weather tool"
//   🔧 TOOL called    → your getWeather function ran
//   🔧 TOOL returned  → it gave back "sunny, 25°C"
//   🧠 LLM thinking   → the AI took that and wrote the final answer

//   That's it. Observability = printing those 4 in-between steps so you can see what happened. Your instinct earlier was right — it really is just 
//   "showing what's happening inside."

//   (The OpenTelemetry / LangSmith stuff I mentioned? Ignore it for now. Those are just bigger, fancier versions of this exact same idea — a nicer 
//   tracking page. The core is what you already saw.)

//   The "2 thinking steps" thing — simple version

//   Why did the AI 🧠 "think" twice? Imagine you ask a friend "what's the weather?":

//   1. Friend: "Let me check my phone." ← thinks once (decides to use a tool — but doesn't know the answer yet)
//   2. [friend checks the phone] ← the tool runs
//   3. Friend: "It's sunny, 25°C." ← thinks again (now uses what the phone said)

//   Your friend talked twice, with the phone-check in between. Same with the AI — it "thinks" to decide it needs the tool, the tool runs, then it  
//   "thinks" again to use the result. It can't do both at once because the tool has to run in the middle.



// observability = the delivery tracking page for your agent. Now I'll just name the pieces.

//   📦 "Span" and "Trace" — just two words for what you already saw

//   - A span = ONE step. On a food order, "Cooking" is one step. "On the way" is one step. For your agent, "LLM thinking" is one step, "tool
//   running" is one step. Each has a start and an end.
//   - A trace = the WHOLE journey for one order — all the steps together, start to finish.

//   So in your observe.js: each 🧠/🔧 line was a span (one step). All of them together, for one question, was a trace (the whole journey). That's  
//   literally all those two scary words mean. You already built both. 👍

//   🌐 OpenTelemetry — everyone agreeing to write the steps the same way

//   Imagine if every delivery company wrote their tracking updates in a different language — you'd need a separate app for each one. Annoying.     

//   OpenTelemetry (OTel) is everyone agreeing to write the steps in one standard format, so any tracking app can read them.

//   - It's not an AI thing — it's for all software (websites, servers, apps).
//   - The benefit: you're not locked to one company's tool. Your agent's steps can be read by Datadog, or Jaeger, or whatever your company already 
//   uses.

//   That's it. OTel = "a shared standard for writing down the steps."

//   🛰️ LangSmith — a ready-made tracking website for AI agents

//   Your observe.js printed the steps to your black terminal — ugly, and gone when you close it.

//   LangSmith is a done-for-you website that catches those same steps and shows them nicely: each step, how long it took, how many tokens, the     
//   actual prompt and answer, any errors — and it saves them so you can look back at yesterday's runs.

//   You don't code it — you flip 2 switches (two env vars) and it just works. It's the polished version of the observer you hand-wrote.

//   💾 The "data, not strings" bit

//   Your first observer printed text. A real tool saves each step as a little record (which step, how long, how many tokens). Why does that matter?
//   Because saved records can be counted and measured — "this agent averages 3 LLM calls and costs ₹X per question." You can't do math on
//   console.log text; you can on saved data.

//   ---
//   So, plain version:

//   ┌───────────────┬──────────────────────────────────────────────────────────────────┐
//   │  Scary word   │                      What it actually means                      │
//   ├───────────────┼──────────────────────────────────────────────────────────────────┤
//   │ Span          │ one step                                                         │
//   ├───────────────┼──────────────────────────────────────────────────────────────────┤
//   │ Trace         │ all the steps for one request                                    │
//   ├───────────────┼──────────────────────────────────────────────────────────────────┤
//   │ OpenTelemetry │ a standard way to write down the steps so any tool can read them │
//   ├───────────────┼──────────────────────────────────────────────────────────────────┤
//   │ LangSmith     │ a ready-made website that shows your agent's steps nicely        │
//   └───────────────┴──────────────────────────────────────────────────────────────────┘