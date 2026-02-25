# AI Workload Suggestions Setup

Saddle Up can generate AI-powered workload suggestions for each horse based on their recent training sessions.

## Requirements

- OpenAI API key (uses `gpt-4o-mini` for cost efficiency)

## Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Go to **API keys** and create a new key
3. Add to your `.env`:

```
OPENAI_API_KEY=sk-...
```

4. Restart your dev server

## Usage

- Open any horse detail page (Horses → [horse name])
- Scroll to **AI workload suggestions**
- Click **Generate suggestions**
- The AI analyzes the last 14 days of training (sessions, intensity, rest days) and returns personalized recommendations for workload management and horse welfare

## Cost

- Uses `gpt-4o-mini` (~$0.15 per 1M input tokens)
- Each suggestion request is typically 500–1000 tokens
- Only runs when the user clicks "Generate suggestions" (no automatic background calls)
