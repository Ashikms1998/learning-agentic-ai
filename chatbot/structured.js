import { ChatOllama } from '@langchain/ollama'
import { z } from 'zod'

const model = new ChatOllama({ model: 'qwen2.5:7b' })

// 1. Define the EXACT shape you want back — this is the "contract" for your UI
const flightSchema = z.object({
  from: z.string().describe('departure city'),
  to: z.string().describe('destination city'),
  travelClass: z.enum(['economy', 'business', 'first']).describe('cabin class'),
  passengers: z.number().describe('number of passengers'),
  when: z.string().describe('when they want to travel'),
})

// 2. Bind the schema to the model — now it MUST answer in this shape
const extractor = model.withStructuredOutput(flightSchema)

// 3. Feed it messy human language
const result = await extractor.invoke(
  'Hey, book me a business class flight from Goa to Hyderabad for tomorrow night, just me.'
)

// 4. result is a CLEAN, guaranteed-shape JS object
console.log(result)

// 🔍 The one magic line

// model.withStructuredOutput(flightSchema) — this is the whole trick. It takes your normal model and returns a new   
// version that is forced to reply as an object matching your Zod schema. No free-form text. No "Here are some        
// options...". Just data.

// Instead of the wall of text you got before, you'll get:

// {
//   from: 'Goa',
//   to: 'Hyderabad',
//   travelClass: 'business',
//   passengers: 1,
//   when: 'tomorrow night'
// }

// And THIS is what makes a UI deterministic. With a guaranteed object, your React frontend just does:

// <FlightCard
//   from={result.from}        // always a string
// 🔍 The one magic line

// model.withStructuredOutput(flightSchema) — this is the whole trick. It takes your normal model and returns
// a new version that is forced to reply as an object matching your Zod schema. No free-form text. No "Here  
// are some options...". Just data.

// Instead of the wall of text you got before, you'll get:

// {
//   from: 'Goa',
//   to: 'Hyderabad',
//   travelClass: 'business',
//   passengers: 1,
//   when: 'tomorrow night'
// }

// And THIS is what makes a UI deterministic. With a guaranteed object, your React frontend just does:       

// <FlightCard
//   from={result.from}        // always a string
//   to={result.to}            // always a string
//   class={result.travelClass}// always 'economy' | 'business' | 'first'
//   passengers={result.passengers} // always a number
// />

// Every field is guaranteed to exist and be the right type (Zod validates it). No parsing prose, no "what if
// it returns a paragraph this time." The model handles the messy human language; the schema guarantees the  
// clean shape; your UI renders it predictably. That's the entire concept. 🎯