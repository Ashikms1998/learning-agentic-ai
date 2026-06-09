import ollama from 'ollama'

// ---- The real functions (the "hands") ----
function getWeather(city) {
  return `The weather in ${city} is sunny, 25°C.`
}

function recommendClothing(temperatureC) {
  if (temperatureC <= 10) return 'Wear a warm jacket and a scarf.'
  if (temperatureC <= 22) return 'A light sweater or hoodie is perfect.'
  return 'T-shirt and shorts weather — dress light.'
}

// ---- A dispatcher: maps a tool NAME to the real function ----
function runTool(name, args) {
  if (name === 'getWeather') return getWeather(args.city)
  if (name === 'recommendClothing') return recommendClothing(args.temperatureC)
  return `Unknown tool: ${name}`
}

// ---- The tool menu (now TWO tools) ----
const tools = [
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: 'Get the current weather for a given city',
      parameters: {
        type: 'object',
        properties: { city: { type: 'string', description: 'The city name' } },
        required: ['city'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'recommendClothing',
      description: 'Recommend what to wear based on the temperature in Celsius',
      parameters: {
        type: 'object',
        properties: {
          temperatureC: { type: 'number', description: 'Temperature in Celsius' },
        },
        required: ['temperatureC'],
      },
    },
  },
]

// ---- The conversation ----
const messages = [
  {
    role: 'system',
    content:
      'You are a helpful assistant. Use the tools to answer. Use ONLY the data the tools return — do not invent details.',
  },
  { role: 'user', content: 'I live in Hyderabad. What should I wear today?' },
]

// ---- THE AGENT LOOP ----
while (true) {
  const response = await ollama.chat({ model: 'qwen2.5:7b', messages, tools })
  messages.push(response.message)

  // No tool calls? The model is done thinking — print the answer and STOP.
  if (!response.message.tool_calls?.length) {
    console.log('\n💬 Final answer:')
    console.log(response.message.content)
    break
  }

  // Otherwise: run every tool the model asked for, feed results back, loop again.
  for (const call of response.message.tool_calls) {
    const result = runTool(call.function.name, call.function.arguments)
    console.log(`🔧 ${call.function.name}(${JSON.stringify(call.function.arguments)}) → ${result}`)
    messages.push({
      role: 'tool',
      tool_name: call.function.name,
      content: result,
    })
  }
  // loop repeats: model now SEES the tool results and decides what to do next
}