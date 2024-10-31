#HotswapAI
##Use Leading AI models on a pay-as-you-go basis.

HowswapAI is a simple and intuitive web app built for the purpose of allowing you to easily use a variety of AI models
without having to pay a subscription fee. All you have to do is bring your own API keys for each AI provider (Anthropic, Google Cloud, OpenAI) and you will instantly be able to use leading models from each provider.

###NOTE: The app is in an early-alpha stage: to be honest it's currently just something I quickly built for myself, I am in the process of making it more viable for mass-consumption

##Requirements:
- Node (Version 18.18+)

##Instructions:
- Download the repo onto your local device and use a terminal to enter the root folder of the project.
- Run `npm -i`
- Create a new .env file at the root of the project, and paste your API keys in the following format:
- - `OPENAI_API_KEY:your_secret_key`
- - `ANTHROPIC_API_KEY:your_secret_key`
- - `GOOGLE_GENERATIVE_AI_API_KEY:your_secret_key`
- Run `npm run dev`
- In a browser of your choice, enter 'http://localhost:3000' into the address bar
- Enjoy!