import { ChatOllama } from '@langchain/ollama'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import readline from 'node:readline/promises'

// 1. The model
const model = new ChatOllama({ model: 'qwen2.5:7b' })

// 2. Short-term memory — the conversation, starting with a system instruction
const history = [
  new SystemMessage('You are a friendly, concise assistant.'),
]

// 3. A way to read what you type in the terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

console.log('🤖 Chat started! Type a message (or "exit" to quit).\n')

// 4. THE CHAT LOOP
while (true) {
  const userInput = await rl.question('You: ')

  if (userInput.toLowerCase() === 'exit') {
    console.log('👋 Bye!')
    break
  }

  history.push(new HumanMessage(userInput))   // remember what you said
  const response = await model.invoke(history) // send the WHOLE history
  history.push(response)                        // remember the bot's reply

  console.log('Bot:', response.content, '\n')
}

rl.close()



// readline/promises — a built-in Node module for reading terminal input. rl.question('You: ') prints   
// the prompt and waits for you to type + hit Enter, then returns what you typed. (Standard Node — no   
// install needed.)

// history — your short-term memory. It's declared outside the loop, so it survives across every turn of
// the conversation. This is the state — and notice it lives in your code, not in the model.

// The while loop = one turn each pass:
// 1. read your message → 2. push it as a HumanMessage → 3. invoke the model with the entire history    
// → 4. push the reply → 5. print → repeat.

// That step 3 is the key — every turn resends the full conversation. The model is stateless and forgets
// instantly; your history array is what makes the chat feel continuous. You are the memory.

// 🧠 Concept made concrete: this is STATEFUL

// Your model is stateless, but your app is now stateful — it holds history across turns. That's the    
// exact distinction (topic #10), and you built it: state = data your code keeps between requests. 