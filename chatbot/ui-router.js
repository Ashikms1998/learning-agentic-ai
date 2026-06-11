import { ChatOllama } from '@langchain/ollama'
  import { z } from 'zod'

  const model = new ChatOllama({ model: 'qwen2.5:7b' })

  // A MENU of UI components — the model picks the ONE that fits the query
  const uiSchema = z.object({
    type: z
      .enum(['flight', 'weather', 'text'])
      .describe('which UI component best fits the user request'),

    flight: z
      .object({ from: z.string(), to: z.string(), travelClass: z.string() })
      .optional()
      .describe('fill ONLY when type is flight'),

    weather: z
      .object({ city: z.string() })
      .optional()
      .describe('fill ONLY when type is weather'),

    text: z
      .string()
      .optional()
      .describe('a plain conversational reply, fill ONLY when type is text'),
  })

  const router = model.withStructuredOutput(uiSchema)

  // Three totally different queries through the SAME schema:
  console.log('1:', await router.invoke('book me a business flight from Goa to Delhi'))
  console.log('2:', await router.invoke("what's the weather in Tokyo?"))
  console.log('3:', await router.invoke('tell me a fun fact about cats'))

//   🔍 The pattern

//   The model classifies each query and routes it:

//   "book me a flight..."  → { type: 'flight',  flight: { from:'Goa', to:'Delhi', ... } }
//   "weather in Tokyo?"    → { type: 'weather', weather: { city: 'Tokyo' } }
//   "fun fact about cats"  → { type: 'text',    text: 'Cats sleep 16 hours a day!' }

//   That type field is the model making a routing decision — "which of my known components handles this?" Then
//   your UI is a simple, deterministic switch:

//   switch (result.type) {
//     case 'flight':  return <FlightCard {...result.flight} />
//     case 'weather': return <WeatherCard {...result.weather} />
//   That type field is the model making a routing decision — "which of my known components handles this?" Then
//   your UI is a simple, deterministic switch:

//   switch (result.type) {
//     case 'flight':  return <FlightCard {...result.flight} />
//     case 'weather': return <WeatherCard {...result.weather} />
//     case 'text':    return <ChatBubble>{result.text}</ChatBubble>  // fallback for anything
//   }

//   This is the whole secret of deterministic UI:
//   - It's deterministic because you only ever render components you've built — a finite, known set.
//   - It's flexible because the model routes any query to the right one (with text as the catch-all fo  })

//   const router = model.withStructuredOutput(uiSchema)

//   // Three totally different queries through the SAME schema:
//   console.log('1:', await router.invoke('book me a business flight from Goa to Delhi'))
//   console.log('2:', await router.invoke("what's the weather in Tokyo?"))
//   console.log('3:', await router.invoke('tell me a fun fact about cats'))

//   🔍 The pattern

//   The model classifies each query and routes it:

//   "book me a flight..."  → { type: 'flight',  flight: { from:'Goa', to:'Delhi', ... } }
//   "weather in Tokyo?"    → { type: 'weather', weather: { city: 'Tokyo' } }
//   "fun fact about cats"  → { type: 'text',    text: 'Cats sleep 16 hours a day!' }

//   That type field is the model making a routing decision — "which of my known components handles    
//   this?" Then your UI is a simple, deterministic switch:

//   switch (result.type) {
//     case 'flight':  return <FlightCard {...result.flight} />
//     case 'weather': return <WeatherCard {...result.weather} />
//     case 'text':    return <ChatBubble>{result.text}</ChatBubble>  // fallback for anything
//   }

//   This is the whole secret of deterministic UI:
//   - It's deterministic because you only ever render components you've built — a finite, known set.  
//   - It's flexible because the model routes any query to the right one (with text as the catch-all   
//   for general chat).

//   So you never need a schema for every possible query — you need a schema for every component you   
//   support, plus a text fallback. The model handles the infinite variety of human input; your UI     
//   handles a finite, safe set of shapes. That's how a "ChatGPT clone with deterministic UI" actually 
//   works under the hood.