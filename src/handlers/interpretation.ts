import OpenAIClient from '../clients/openai'
import YoutubeClient from '../clients/youtube'
import FirebaseClient from '../clients/firebase'
import { createMessagesFromText } from '../helpers/llm'
import { info as logInfo } from '../helpers/logger'
import { Interpretation, LLMChatMessage } from '../types/index'

export const getInterpretationHandler = async (
    ytId: string,
    useMockData: boolean = false,
    prompt: string = '',
    save: boolean = false // if true, will save to and read from firebase
): Promise<Interpretation> => {
    const info = (message: string) => {
        logInfo(ytId, message)
    }

    if (!useMockData && save) {
        const interpretation = await FirebaseClient.getInterpretation(ytId)
        if (interpretation) {
            info(`found existing interpretation in db`)
            return interpretation
        }
    }

    info(`creating new interpretation`)

    info(`fetching transcript`)
    const transcript = await YoutubeClient.fetchTranscript(ytId, useMockData)
    if (!transcript) {
        throw new Error('Could not fetch transcript')
    }

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

    if (!save) 
        return { 
            id: ytId, 
            content 
        }

    info(`saving interpretation to firebase`)
    await FirebaseClient.addInterpretation(ytId, content)

    return {
        id: ytId,
        content
    }
}