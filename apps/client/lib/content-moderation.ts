export async function moderateContent(content: string): Promise<{ isValid: boolean; reason?: string }> {
  console.log('🔍 Starting Gemini content moderation for:', content.substring(0, 100) + '...')
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Is the following text primarily about Web3, blockchain, crypto, or NFTs? Answer only with "yes" or "no".\n\nText: "${content}"`
          }]
        }]
      })
    })
    
    if (!response.ok) {
      console.error('❌ API request failed:', response.status, await response.text())
      return { isValid: false, reason: 'Content moderation service unavailable' }
    }

    const data = await response.json()

    // Check the built-in safety ratings
    const safetyRatings = data.candidates?.[0]?.safetyRatings
    const isHarmful = safetyRatings?.some((rating: any) => rating.probability !== 'NEGLIGIBLE')

    if (isHarmful) {
      console.log('🚨 Content failed built-in safety moderation:', safetyRatings)
      return { isValid: false, reason: 'Content contains inappropriate or harmful material' }
    }
    console.log('✅ Content passed built-in safety moderation.')

    // Check the topic classification result
    const classificationResult = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase()
    const isWeb3Related = classificationResult === 'yes'
    
    if (isWeb3Related) {
      console.log(`✅ Gemini topic result: APPROVED for content:`, content.substring(0, 50) + '...')
      return { isValid: true }
    } else {
      console.log(`❌ Gemini topic result: REJECTED for content:`, content.substring(0, 50) + '...')
      return { isValid: false, reason: 'Content is not Web3/blockchain related' }
    }

  } catch (error) {
    console.error('❌ Gemini moderation process failed:', error)
    return { isValid: false, reason: 'Content moderation service error' }
  }
}