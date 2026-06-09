import {ChatOllama} from "@langchain/ollama";
import { HumanMessage,SystemMessage } from "@langchain/core/messages";



const model = new ChatOllama({
    model:"qwen2.5:7b",
})

console.log('--- Experiment 1: NO memory (two separate calls) ---')

await model.invoke('Hello! I am Ashik')
const noMem = await model.invoke("What's my name?")

console.log('Without history →', noMem.content)

console.log('\n--- Experiment 2: WITH memory (we resend the history) ---')

const history = [
    new SystemMessage("You are a English Teacher"),
    new HumanMessage("check my spelling is correct for word lihgt")
]

const reply1 = await model.invoke(history)
console.log("🤷‍♂️",reply1)
history.push(reply1)
history.push(new HumanMessage("is it correct spelling"))
const withMem = await model.invoke(history)
console.log("With history",withMem.content)