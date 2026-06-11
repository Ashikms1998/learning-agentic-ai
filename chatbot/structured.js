import { ChatOllama } from "@langchain/ollama";
import {z} from 'zod'

const model = new ChatOllama({model:'qwen2.5:7b'})

const flightSchema = z.object({
    from: z.string().describe('departure city'),
    to: z.string().describe('destination city'),
    travelClass: z.enum(['economy', 'business', 'first']).describe('cabin class'), 
    passengers:z.number().describe('number of passgengers'),
    when: z.string().describe('when they want to travel'),
    why:z.string().describe("why the user wants to travel")
})

const extractor = model.withStructuredOutput(flightSchema)


console.log("😐",extractor)


const result = await extractor.invoke(
    'Hey, book me a business class flight from Goa to Hyderabad for tomorrow night since i am going for a vacation,just me.'
  )

console.log("😐",result)



