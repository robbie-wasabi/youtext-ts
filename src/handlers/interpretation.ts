import OpenAIClient from '../clients/openai'
import YoutubeClient from '../clients/youtube'
import FirebaseClient from '../clients/firebase'
import { createMessagesFromText } from '../helpers/llm'
import { info as logInfo } from '../helpers/logger'
import { Interpretation, LLMChatMessage } from '../types/index'
import env from '../env'

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
    const messages = createMessagesFromText(transcript, env.prompt)

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