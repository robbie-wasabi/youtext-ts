import { YoutubeTranscript } from 'youtube-transcript'
import fs from 'fs'

export default class YoutubeClient {
    static _formatTranscriptData = (data:any) => {
        let transcript = data.map((t:any) => t.text).join()
        transcript = transcript.replaceAll(',', ', ')
        return transcript
    }

    static _fetchTranscript = async (id:string) => {
        const data = await YoutubeTranscript.fetchTranscript(id)
        return this._formatTranscriptData(data)
    }

    static _readMockData = (id:string) => {
        return fs.readFileSync(`./mockdata/${id}.txt`, 'utf8')
    }

    static fetchTranscript = async (id:string, useMockData = false) => {
        // if useMockData is true, read from mockdata folder
        const data = useMockData
            ? this._readMockData(id)
            : await this._fetchTranscript(id)

        return data
    }
}
