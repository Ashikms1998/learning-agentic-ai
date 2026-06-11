import { ChatOllama } from "@langchain/ollama";
import { HumanMessage,AIMessage,SystemMessage } from "@langchain/core/messages";

const model = new ChatOllama({model:'qwen2.5:7b'})

const fullHistory = [
    new SystemMessage('You are a helpful assistant.'),
    new HumanMessage('My name is Ashik.'),
    new AIMessage('Nice to meet you, Ashik!'),
    new HumanMessage('I live in Goa.'),
    new AIMessage('Goa is beautiful!'),
    new HumanMessage('I love JavaScript.'),
    new AIMessage('JavaScript is great!'),
    new HumanMessage('I am learning agentic AI.'),
    new AIMessage('That is exciting!'),
    new HumanMessage("What's my name?"),   // the real question
  ]

const all = await model.invoke(fullHistory)
console.log(all)

console.log('FULL    →', all.content, '| input tokens:', all.usage_metadata.input_tokens)  

const trimmed = [fullHistory[0],...fullHistory.slice(-3)]
const trim = await model.invoke(trimmed)
console.log('TRIMMED →', trim.content, '| input tokens:', trim.usage_metadata.input_tokens)




// ✅ Run it and watch the tradeoff


// You'll see something like:

// FULL    → Your name is Ashik.        | input tokens: ~70
// TRIMMED → I don't know your name.    | input tokens: ~35

// Stop and look at what just happened — this is the whole lesson:

// - FULL → correct answer ("Ashik"), but more tokens. Now imagine 1000 turns → it overflows  
// the window and costs a fortune.
// - TRIMMED → half the tokens... but it forgot your name! Because "My name is Ashik" got     
// dropped when we kept only the last 3 messages.

// That's the central tension of context engineering:

// ▎ Too much context → expensive, slow, eventually overflows. Too little → the model loses   
// ▎ information it needs. The skill is keeping what matters and dropping what doesn't.       

// Naive trimming (Strategy 2) is dumb — it drops by position, not importance, so it threw    
// away your name. The real techniques are smarter:

// ┌──────────────────┬──────────────────────────────────────────┬───────────────────────┐    
// │    Technique     │               What it does               │    You've seen it?    │    
// ├──────────────────┼──────────────────────────────────────────┼───────────────────────┤    
// │ Trim / sliding   │ Keep last N messages                     │ ← just did (and saw   │    
// │ window           │                                          │ it fail)              │    
// ├──────────────────┼──────────────────────────────────────────┼───────────────────────┤    
// │ Summarize /      │ Squash old turns into a short summary,   │ ✅ your long-term     │    
// │ compact          │ keep it                                  │ memory!               │    
// ├──────────────────┼──────────────────────────────────────────┼───────────────────────┤    
// │ Retrieve (RAG)   │ Only fetch + inject the relevant bits    │ next big topic        │    
// │                  │ per query                                │                       │    
// ├──────────────────┼──────────────────────────────────────────┼───────────────────────┤    
// │ Select / filter  │ Include only what's relevant to this     │ —                     │    
// │                  │ question                                 │                       │    
// ├──────────────────┼──────────────────────────────────────────┼───────────────────────┤    
// │ Order            │ Put key info near the start/end (models  │ —                     │    
// │                  │ lose the "middle")                       │                       │    
// └──────────────────┴──────────────────────────────────────────┴───────────────────────┘    

// The fix for the demo's bug is summarization — instead of dropping "My name is Ashik,"      
// compress the old turns into a kept note like "User: Ashik, lives in Goa, loves JS" —       
// exactly the move you already made for long-term memory. Best of both: low tokens and keeps 
// what matters.