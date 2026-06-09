import ollama from 'ollama';

const response = await ollama.chat({
    model:"llama3.2",
    messages:[
        {
            role:"user",
            content:"Hello, how are you?"
        }
    ],
})
console.log(response.message.content);
