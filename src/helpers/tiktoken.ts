import { get_encoding, encoding_for_model, TiktokenModel } from '@dqbd/tiktoken'

export class Tiktoken {
    model: TiktokenModel;
    tokensPerMessage: number;
    tokensPerName: number;
    encoding: any;

    constructor(model: TiktokenModel) {
        this.model = model;

        let tokensPerMessage: number, tokensPerName: number;
        if (this.model == 'gpt-3.5-turbo' || this.model == 'gpt-3.5-turbo-0301') {
            tokensPerMessage = 4;
            tokensPerName = -1;
            this.model = 'gpt-3.5-turbo-0301';
        } else if (this.model == 'gpt-4-0314') {
            tokensPerMessage = 3;
            tokensPerName = 1;
        } else {
            throw new Error(
                `num_tokens_from_messages() is not implemented for model ${model}.\n` +
                    ' See https://github.com/openai/openai-python/blob/main/chatml.md for' +
                    ' information on how messages are converted to tokens.'
            );
        }

        this.tokensPerName = tokensPerName;
        this.tokensPerMessage = tokensPerMessage;
        this.encoding = encoding_for_model(this.model);

        try {
            this.encoding = encoding_for_model(this.model);
        } catch (err) {
            console.warn(
                'Warning: model not found. Using cl100k_base encoding.'
            );
            this.encoding = get_encoding('cl100k_base');
        }
    }

    countMessageTokens(messages: any[]): number {
        let numTokens = 0;
        messages.forEach((message: any) => {
            numTokens += this.tokensPerMessage;
            Object.entries(message).forEach(([key, value]: [string, any]) => {
                numTokens += this.encoding.encode(value).length;
                if (key == 'name') {
                    numTokens += this.tokensPerName;
                }
            });
        });
        numTokens += 3; // every reply is primed with assistant
        return numTokens;
    }
}