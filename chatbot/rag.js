import { OllamaEmbeddings, ChatOllama } from '@langchain/ollama'
  import { HumanMessage, SystemMessage } from '@langchain/core/messages'

  // Our private knowledge (made up — the model can't already know this)
  const documents = [
    'The Zorblax 3000 is a premium coffee machine that costs $450.',
    'The Zorblax 3000 comes with a 2-year warranty.',
    'Acme Corp was founded in 2019 by Jane Doe.',
    'Our support team is available Monday to Friday, 9am to 6pm IST.',
    'The Zorblax 3000 can make espresso, latte, and cappuccino.',
  ]

  const embeddings = new OllamaEmbeddings({ model: 'nomic-embed-text' })

  // 1. INDEX: turn every document into a vector
  const docVectors = await embeddings.embedDocuments(documents)

  // helper: how "aligned" are two vectors? (1 = same meaning, 0 = unrelated)
  function cosineSimilarity(a, b) {
    let dot = 0, magA = 0, magB = 0
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]
      magA += a[i] * a[i]
      magB += b[i] * b[i]
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB))
  }

  // 2. RETRIEVE: embed the question, score every doc, take the top 2
  const question = 'How much does the Zorblax 3000 cost?'
  const qVector = await embeddings.embedQuery(question)

  const scored = documents
    .map((text, i) => ({ text, score: cosineSimilarity(qVector, docVectors[i]) }))
    .sort((a, b) => b.score - a.score)

  const top = scored.slice(0, 2)
  console.log('📚 Retrieved chunks (with similarity score):')
  top.forEach(d => console.log(`  - [${d.score.toFixed(3)}] ${d.text}`))

  // 3. AUGMENT + GENERATE: inject the top chunks, answer from them
  const context = top.map(d => d.text).join('\n')
  const model = new ChatOllama({ model: 'qwen2.5:7b' })
  const answer = await model.invoke([
    new SystemMessage(`Answer using ONLY this context:\n${context}`),
    new HumanMessage(question),
  ])
  console.log('\n💬 Answer:', answer.content)


 
  
//   embeddings.embedDocuments(documents) — turns each doc into a vector (a long array of       
//     numbers capturing its meaning). This is the "index."
  
//     embeddings.embedQuery(question) — turns the question into a vector the same way.
  
//     cosineSimilarity(a, b) — this is what a "vector store" does internally. It measures how    
//     aligned two vectors point:
//     - 1.0 = same direction = same meaning
//     - 0.0 = perpendicular = unrelated
  
//     So "how much does it cost?" will score high against "costs $450" and low against "founded  
//     in 2019." We just compute that score for every doc and grab the top 2. That's literally all
//     "similarity search" is — no magic, just measuring angles between meaning-vectors.
  
//     The rest — inject top chunks → "answer using ONLY this context" — is the same
//     augment-and-generate you already know.
  
//     ▎ 💡 A real vector DB (Pinecone, pgvector) does exactly this cosineSimilarity loop, just   
//     ▎ optimized to run over millions of vectors in milliseconds. You're seeing the real        
//     ▎ algorithm, unscaled.