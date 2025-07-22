import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { message, subject, conversationHistory } = await request.json()

    // Check if Google Cloud API key is available
    const googleCloudApiKey = process.env.GOOGLE_CLOUD_API_KEY
    if (!googleCloudApiKey) {
      return NextResponse.json(
        { error: 'Google Cloud API key not configured' },
        { status: 500 }
      )
    }

    // Prepare the conversation context
    const systemPrompt = `You are an expert STEM tutor specializing in ${subject || 'general STEM subjects'}. 
    Provide clear, educational, and helpful responses to student questions. 
    Use examples, step-by-step explanations, and encourage critical thinking. 
    Keep responses concise but comprehensive.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ]

    // Call Google Cloud AI (Vertex AI or Gemini API)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${googleCloudApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n')
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('Google Cloud AI API error:', errorData)
      throw new Error(`Google Cloud AI API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Extract the response text
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                      'I apologize, but I was unable to generate a response. Please try again.'

    return NextResponse.json({ response: aiResponse })

  } catch (error) {
    console.error('AI Tutor API error:', error)
    return NextResponse.json(
      { error: 'Failed to get AI response' },
      { status: 500 }
    )
  }
} 