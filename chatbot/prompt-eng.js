import { ChatOllama } from '@langchain/ollama'
  import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'

  const model = new ChatOllama({ model: 'qwen2.5:7b' })

  const messages = [
    new SystemMessage('You convert user messages into a short ticket tag.'),

    // --- the "few shots": example INPUT → example OUTPUT pairs ---
    new HumanMessage('I cannot log in to my account'),
    new AIMessage('[BUG] [priority: high] login failure'),

    new HumanMessage('Could you add a dark mode please?'),
    new AIMessage('[FEATURE] [priority: low] dark mode request'),

    new HumanMessage('The app is super slow when I upload photos'),
    new AIMessage('[BUG] [priority: medium] slow photo upload'),

    // --- now the REAL query (no example answer) ---
    new HumanMessage('Payments are failing at checkout'),
  ]

  const response = await model.invoke(messages)
  console.log(response.content)


//   🔍 What's happening

//   Notice we never told the model the format in words. No "use square brackets, classify as   
//   BUG or FEATURE, add a priority." Instead we showed it three example pairs — a HumanMessage 
//   (example input) followed by an AIMessage (the ideal output) — and then gave it a real query
//   with no answer.

//   The model pattern-matches from your examples and produces something like:

//   [BUG] [priority: high] checkout payment failure

//   It inferred the entire format — the brackets, the BUG/FEATURE label, the priority — just   
//   from examples. That's few-shot learning ("few shots" = a few examples).

//   💡 Why this is a big deal

//   - Examples often beat instructions. Describing a format in words is error-prone (you've    
//   watched the model drift). Showing it 2–3 examples is frequently more reliable — the model  
//   is an extraordinary pattern-matcher.
//   - It reuses what you already know. Remember the role/content message array? Few-shot is    
//   just fake prior turns — example Human→AI pairs placed before the real question, so the     
//   model thinks "ah, this is how I respond here."
//   - Terminology: "zero-shot" = no examples (just instructions). "Few-shot" = a handful of    
//   examples. More examples → more consistent, but more tokens.



// the real mental model of prompt engineering

//   It's a toolkit, and you pick the tool for the job:

//   - Open-ended assistant? → a great system prompt (zero-shot rules) + capable model
//   - Narrow task needing consistency? → few-shot examples
//   - Hard reasoning? → chain-of-thought
//   - Guaranteed shape for code? → structured output (Zod, which you learned)

//   Few-shot is one tool. Your gut said "this can't be the whole answer" — correct. It isn't.  

//   ---
//   And here's the beautiful part: the question you're really asking — "how do real assistants 
//   handle literally any query reliably?" — the answer isn't more examples. It's (a) a
//   well-designed system prompt and (b) carefully managing what information sits in the context
//   window at any moment.

//   That second part — what goes into the model's context, when, and how much — is Context     
//   Engineering