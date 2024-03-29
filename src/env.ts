import dotenv from 'dotenv'
dotenv.config()

const DEFAULT_PROMPT = 'Identify and extract key ideas, concepts, or news. Present these as concise bullet points, each delivering significant insights. Avoid references to the source material or summarizing phrases.'

const env = {
    port: process.env.PORT || 3000,
    openaiApiKey: process.env.OPENAI_API_KEY,
    openaiModel: process.env.OPENAI_MODEL,
    firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    },
    prompt: process.env.DEFAULT_PROMPT || DEFAULT_PROMPT,
    apiKey: process.env.API_KEY
}

export default env
