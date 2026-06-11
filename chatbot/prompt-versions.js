import { ChatOllama } from '@langchain/ollama'
import { ChatPromptTemplate } from '@langchain/core/prompts'

const model = new ChatOllama({ model: 'qwen2.5:7b' })

// A "registry" of prompt VERSIONS — prompts treated like versioned code
const prompts = {
  v1: ChatPromptTemplate.fromMessages([
    ['system', 'You are a helpful assistant.'],
    ['human', 'Explain {topic}.'],
  ]),

  v2: ChatPromptTemplate.fromMessages([
    ['system',
     'You are a friendly teacher. Answer in exactly 2 short sentences a total beginner can understand. No jargon.'],
    ['human', 'Explain {topic}.'],
  ]),
}

const topic = 'recursion in programming'

// Run the SAME input through every version and compare
for (const [version, prompt] of Object.entries(prompts)) {
  const chain = prompt.pipe(model)        // prompt → model
  const result = await chain.invoke({ topic })
  console.log(`\n=== ${version} ===`)
  console.log(result.content)
}

// Prompt Versioning. 📌

//   📌 Why version prompts at all?

//   You've already learned the hard way that prompts ARE logic — you watched tiny wording
//   changes flip the model's behavior:
//   - adding a system prompt stopped it dodging
//   - Name: Ashik (labeled) worked where Ashik lives in Goa (prose) failed
//   - "answer using ONLY this context" turned hallucination into grounded answers

//   So here's the problem: if a prompt is critical logic, but you edit it as a magic string in 
//   place, you have no history. Change it, quality drops, and you can't compare to the old one 
//   or roll back. That's terrifying for production.

//   ▎ Prompt versioning = treating prompts like code — named/numbered versions you can store,  
//   ▎ compare, and revert. Plus the real payoff: running the same input through different      
//   ▎ versions to see which is better.

//   🧱 First, the right way to write a prompt in LangChain

//   Until now you've hardcoded strings. LangChain has a proper primitive — ChatPromptTemplate —
//   that turns a prompt into a reusable, parameterized object (with {variables}). That's the   
//   foundation for managing prompts as artifacts.


// 🔍 Two new LangChain ideas here

// ChatPromptTemplate.fromMessages([...]) — defines a prompt as a structured object with a    
// {topic} placeholder. Now your prompt is a named thing you can store and version, not an    
// inline string buried in code. You fill the blank at call time with .invoke({ topic }).     

// prompt.pipe(model) — this is chaining (LangChain calls it LCEL — LangChain Expression      
// Language). .pipe() connects pieces into a pipeline: the filled prompt flows into the model.
// Read it left-to-right: "take the prompt, pipe it to the model." You'll use .pipe()
// constantly in LangChain — it's how you compose steps.

// The prompts object = your version registry. v1 and v2 are two versions of the same prompt. 
// Looping over them runs your input through each so you can compare side by side — the heart 
// of prompt versioning.


// Look at that contrast — that's the entire lesson in one screen:

//   ┌──────────────────────────┬───────────────────────────────────────────────────────────┐
//   │         Version          │                          Output                           │     ├──────────────────────────┼───────────────────────────────────────────────────────────┤
//   │ v1 ("helpful assistant") │ ~1000 words, sections, code, LaTeX, Fibonacci tangent     │   
//   ├──────────────────────────┼───────────────────────────────────────────────────────────┤
//   │ v2 ("teacher, 2          │ "Recursion is when a function calls itself... like        │
//   │ sentences, no jargon")   │ solving a big puzzle by breaking it into smaller          │   
//   │                          │ puzzles."                                                 │   
//   └──────────────────────────┴───────────────────────────────────────────────────────────┘   

//   Same input. Same model. Only the prompt version changed — and the behavior went from a     
//   textbook chapter to a perfect beginner explanation. This proves prompts are logic: a string
//   swap completely changed the product.

//   And now picture the production nightmare versioning prevents: v1 is live, you "improve" it 
//   to v2, but users wanted the detail — without versions, the old prompt is gone, and you     
//   can't roll back. With a registry, you just point back to v1. That safety is the whole      
//   point. ✅

//   Let me log it and show you how this scales.

//   Wrote 1 memory (ctrl+o to expand)

// ● 🏭 How prompt versioning scales

//   You already built the core — a registry of named versions. Three levels of doing this for
//   real:

//   ┌───────────────┬───────────────────────────────────┬──────────────────────────────────┐   
//   │     Level     │               What                │               When               │
//   ├───────────────┼───────────────────────────────────┼──────────────────────────────────┤
//   │               │ Prompts in files/objects,         │ Always — free, simple, do this   │   
//   │ Git           │ version-controlled (you're        │ minimum                          │   
//   │               │ basically here)                   │                                  │   
//   ├───────────────┼───────────────────────────────────┼──────────────────────────────────┤   
//   │               │ A hosted prompt registry —        │ When you want to change prompts  │   
//   │ LangSmith Hub │ push/pull prompts by name + tag,  │ without redeploying code (a PM   │   
//   │               │ like npm for prompts              │ tweaks the prompt, no engineer   │   
//   │               │                                   │ needed)                          │   
//   ├───────────────┼───────────────────────────────────┼──────────────────────────────────┤   
//   │ Versioning +  │ Auto-score each version against a │ The real superpower ↓            │   
//   │ Evaluation    │  test set                         │                                  │   
//   └───────────────┴───────────────────────────────────┴──────────────────────────────────┘   

//   🎯 The payoff you're missing: comparison shouldn't be by eyeball

//   Right now you compared v1 vs v2 by reading them. That doesn't scale — you can't manually   
//   eyeball 50 prompt versions across 100 test questions. So production teams pair versioning  
//   with evaluation:

//   ▎ Run every prompt version against a fixed set of test inputs, and auto-score the outputs —
//   ▎ either with metrics (length, did it contain X) or an "LLM-as-judge" (a second model      
//   ▎ rates which version answered better).

//   Now "which version is best?" becomes a number, not a vibe. That's how teams ship prompt    
//   changes with confidence. Versioning gives you the candidates; evaluation picks the winner  
//   objectively.