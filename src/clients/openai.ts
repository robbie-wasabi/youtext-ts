import { Configuration, OpenAIApi } from 'openai'
import env from '../env'

export default class OpenAIClient {
    static _configuration = new Configuration({
        apiKey: env.openaiApiKey
    })
    static _openai = new OpenAIApi(this._configuration)
    static _model = env.openaiModel

    // [{role: "user", content: "Hello world"}]
    // https://platform.openai.com/docs/api-reference/chat
    static createChatCompletion = async (messages:any[]) => {
        if (!this._model) throw new Error('OpenAI model not set')
        return await this._openai.createChatCompletion({
            model: this._model,
            messages,
            temperature: 0.0
        })
    }
}
