import { ChatOllama } from '@langchain/ollama'
  import { AIMessage, HumanMessage, SystemMessage } from '@langchain/core/messages'

  const model = new ChatOllama({ model: 'qwen2.5:7b' })

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
    new HumanMessage("What's my name?"),
  ]

  const system = fullHistory[0]
  const recent = fullHistory.slice(-3)        // keep last 3 verbatim
  const old = fullHistory.slice(1, -3)         // compress the middle

  // 1. Summarize the OLD turns into one short note
  const summaryResp = await model.invoke([
    new HumanMessage(
      'Summarize the key facts about the user from these messages in one short line:\n' +    
      old.map(m => m.content).join('\n')
    ),
  ])
  const summary = summaryResp.content

  // 2. Rebuild context = system + summary + recent (small AND keeps what matters)
  const smart = [
    system,
    new SystemMessage(`Summary of earlier chat: ${summary}`),
    ...recent,
  ]

  const result = await model.invoke(smart)
  console.log('🧠 Summary kept:', summary)
  console.log('SMART →', result.content, '| input tokens:',
  result.usage_metadata.input_tokens)





//   You'll need AIMessage in the import too — add it:
//   import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages'

//   🔍 What this does

//   1. Split the history: recent (keep word-for-word) vs old (compress).
//   2. Summarize the old turns → one line like "User's name is Ashik, lives in Goa, loves      
//   JavaScript."
//   3. Rebuild the context as system + summary + recent. The name survives — it's in the       
//   summary — even though we dropped the verbatim old messages.

//   You get the best of both: correct answer ("Ashik") at low token count. That's the move     
//   trimming couldn't do.

//   💡 This is a real production technique — it has a name: compaction

//   This isn't a toy trick. ChatGPT and Claude do exactly this for long conversations — when   
//   your chat gets long, they automatically summarize the earlier part server-side so it keeps 
//   fitting in the window. (The Claude API even has a built-in compaction feature for this.)   
//   You just built the core idea by hand. 🎯