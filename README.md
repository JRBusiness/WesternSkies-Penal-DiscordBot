# Western Skies RP Penal Code Discord Bot

A Discord bot for Western Skies RP RedM server that provides penal codes and sentences for various crimes. The bot supports smart recognition for natural language inputs and can be deployed to Cloudflare Workers.

## Features

- **Smart Crime Recognition**: Understands natural language inputs like "bank rob", "shoot at law", "kidnap gov"
- **Penal Code Number Search**: Direct lookup using PC-XXX format codes (e.g., "PC-001", "PC-010")
- **Penal Code Lookup**: Provides specific penal codes (PC-XXX) with sentences and fines
- **Multiple Commands**: Search, browse, and get help with various slash commands
- **Cloudflare Workers**: Serverless deployment for high availability
- **Private Responses**: All bot responses are ephemeral (only visible to the user who input the commands)

## Commands

- `/penal <crime>` - Look up specific penal code
- `/penal-code <number>` - Look up by penal code number (auto-adds PC- prefix)
- `/penal-search <keyword>` - Search by keyword
- `/penal-all [page]` - List all penal codes (paginated)
- `/penal-severity` - View crimes by severity
- `/penal-help` - Show help and examples

## Smart Recognition Examples

### Robbery Types
- `bank rob` / `rob bank` → Major Armed Robbery (PC-010, 30 months, $3,550)
- `store rob` / `rob store` → Armed Robbery (PC-011, 25 months, $950)
- `church rob` / `rob church` → Major Armed Robbery (PC-010, 30 months, $3,550)
- `forge rob` / `rob forge` → Major Armed Robbery (PC-010, 30 months, $3,550)

### Law Enforcement Crimes
- `shot at law` / `shoot at law` → Attempted Capital Murder (PC-003, 45 months, $3,000)
- `killed law` / `kill law` → Capital Murder (PC-001, 60 months, $20,000)
- `kidnap law` / `kidnap gov` → Kidnapping of a Government Official (PC-008, 35 months, $2,000)

### Other Crimes
- `attempt murder` → Attempted Murder (PC-004, 35 months, $2,000)
- `drug dealing` → Intent/Distribution of Illegal Contraband (PC-021, 25 months, $800)
- `selling drug` → Intent/Distribution of Illegal Contraband (PC-021, 25 months, $800)
- `selling cocaine` → Intent/Distribution of Illegal Contraband (PC-021, 25 months, $800)
- `resist arrest` → Evading or Resisting Arrest (PC-025, 15 months, $750)

### Penal Code Number Search
- `/penal-code 001` → Capital Murder (60 months, $20,000)
- `/penal-code 010` → Major Armed Robbery (30 months, $3,550)
- `/penal-code 011` → Armed Robbery (25 months, $950)
- `/penal-code 003` → Attempted Capital Murder (45 months, $3,000)

## Installation

### Prerequisites
- Node.js 18+
- Discord Application (Bot Token, Public Key, Application ID)
- Cloudflare Account (for Workers deployment)

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Discord credentials:
   ```
   DISCORD_TOKEN=your_bot_token
   DISCORD_PUBLIC_KEY=your_public_key
   APPLICATION_ID=your_application_id
   ```

4. Run the bot locally:
   ```bash
   node bot.js
   ```

### Cloudflare Workers Deployment

1. Install Wrangler CLI:
   ```bash
   npm install -g wrangler
   ```

2. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```

3. Set your Discord credentials as secrets:
   ```bash
   npx wrangler secret put DISCORD_PUBLIC_KEY
   ```

4. Deploy the worker:
   ```bash
   npx wrangler deploy
   ```

5. Register Discord commands:
   ```bash
   node deploy-commands.js
   ```

## Configuration

### Discord Application Setup

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the Bot Token
5. Go to "General Information" and copy the Application ID
6. Go to "General Information" and copy the Public Key
7. Set the Cloudflare Worker URL to your Interactions Endpoint URL (If you deploying to Cloudflare)

### Environment Variables

- `DISCORD_TOKEN`: Your Discord bot token
- `DISCORD_PUBLIC_KEY`: Your Discord application public key
- `APPLICATION_ID`: Your Discord application ID

## File Structure

```
WesternSkies-Penal-DiscordBot/
├── bot.js                    # Local Discord.js bot
├── worker.js                 # Cloudflare Worker entry point
├── penal-processor.js        # Local penal code processor
├── penal-processor-worker.js # Worker penal code processor
├── deploy-commands.js        # Command registration script
├── package.json             # Dependencies
├── wrangler.toml            # Cloudflare Workers config
├── penal.csv               # Penal code data
└── README.md               # This file
```

## Data Source

The bot uses `penal.csv` which contains:
- Crime names
- Sentence lengths (months)
- Fines (dollars or "Judge Discretion")
- Crime classes

## Smart Recognition System

The bot uses a comprehensive mapping system to understand natural language inputs:

- **Robbery Recognition**: Distinguishes between Major Armed Robbery, Armed Robbery, and Unarmed Robbery
- **Law Enforcement Crimes**: Special handling for crimes against law enforcement
- **Drug Crimes**: Recognition of various drug-related activities
- **Assault Types**: Differentiates between aggravated assault and other forms
- **Escape/Resistance**: Handles arrest resistance and custody escape

## License

This project is open source and available under the MIT License.
