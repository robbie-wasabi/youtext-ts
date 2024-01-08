import OpenAIClient from '../clients/openai.js'
import YoutubeClient from '../clients/youtube.js'
import FirebaseClient from '../clients/firebase.js'
import { createMessagesFromText } from '../helpers/llm.js'
import { info as logInfo } from '../helpers/logger.js'
import { Interpretation, LLMChatMessage } from '../types/index.js'

const prompt = `From the provided content, extract key points as standalone facts or ideas. Present these key points in a coherent, fluent narrative without making references to any speaker or dialogue. The resulting narrative should maintain a smooth flow in the format of a short paper with each sentence delivering significant insights from the content. Make sure to be succinct and comprehensive but also thorough`

export const getInterpretationHandler = async (
    ytId: string,
    override: boolean = false,
    postComment: boolean = false,
    useMockData: boolean = false
): Promise<Interpretation> => {
    const info = (message: string) => {
        logInfo(ytId, message)
    }

    if (!useMockData) {
        const interpretation = await FirebaseClient.getInterpretation(ytId)
        if (interpretation) {
            info(`found interpretation`)
            return interpretation
        }
    }

    info(`creating interpretation`)

    info(`fetching transcript`)
    const transcript = await YoutubeClient.fetchTranscript(ytId, useMockData)

    info(`parsing transcript`)
    const messages = createMessagesFromText(transcript, prompt)

    async function createCompletions(messages: LLMChatMessage[]) {
        const completionsPromises = messages.map((m) =>
            OpenAIClient.createChatCompletion([m])
        )
        return Promise.all(completionsPromises)
    }

    info(`creating completions`)
    const completions = await createCompletions(messages)
    if (completions.length == 0) {
        throw new Error('ChatGPT returned no completions')
    }

    const content = completions.map((c:any) =>
        c.data.choices.map((c:any) => c.message.content).join(' ')
    )

    info(`saving interpretation to firebase`)
    await FirebaseClient.addInterpretation(ytId, content)

    info(`finished creating interpretation for ${ytId}`)

    return {
        id: ytId,
        content
    }
}