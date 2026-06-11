
import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { z } from 'zod'

const model = new ChatOllama({ model: 'qwen2.5:7b' })

const prompts = {
  v1: ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant.'],
    ['human', 'Explain {topic}.'],
  ]),
  v2: ChatPromptTemplate.fromMessages([
    ['system', 'You are a friendly teacher. Answer in exactly 2 short sentences a total beginner can understand. No jargon.'],
    ['human', 'Explain {topic}.'],
  ]),
}

const topic = 'recursion in programming'

// 1. Generate an answer from each version
const answers = {}
for (const [version, prompt] of Object.entries(prompts)) {
  const res = await prompt.pipe(model).invoke({ topic })
  answers[version] = res.content
}

// 2. The JUDGE — picks the better version, with a structured (machine-readable) verdict   
const verdictSchema = z.object({
  winner: z.enum(['v1', 'v2']).describe('which answer is better'),
  reason: z.string().describe('one short sentence explaining why'),
})
const judge = model.withStructuredOutput(verdictSchema)

const verdict = await judge.invoke(
  `Goal: explain a concept to a total beginner — clear and concise.

[v1]: ${answers.v1}

[v2]: ${answers.v2}

Which better meets the goal?`
)

console.log('🏆 Winner:', verdict.winner)
console.log('💬 Reason:', verdict.reason)


// Why this matters

//   - The judge is just another model call — but its job is to evaluate, not answer. That's    
//   "LLM-as-judge," a standard production eval technique.
//   - Notice the callback: the verdict uses withStructuredOutput → you get { winner: 'v2',     
//   reason: '...' } as machine-readable data. That's the key — your code can now automatically 
//   pick the winning version, or run this across 100 test questions and tally scores. No       
//   eyeballing. Versioning gives candidates; this gives an objective winner.

//   ⚠️ One honest caveat (your critical-thinking radar should fire here)

//   An LLM judge is not infallible — especially a small local one. Judges have known biases    
//   (they can favor longer answers, or whichever option is listed first). So in production     
//   you'd: run many test cases, sometimes use multiple judges, and validate the judge itself   
//   against human ratings. It's a strong, scalable signal — not gospel. (Same theme as always: 
//   verify, don't blindly trust.)