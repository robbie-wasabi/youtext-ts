import YoutubeClient from '../clients/youtube'

export const getTranscriptHandler = async (id:string, useMockData = false) => {
    return await YoutubeClient.fetchTranscript(id, useMockData)
}
