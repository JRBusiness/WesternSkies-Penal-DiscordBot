// Script to register slash commands with Discord for Cloudflare Workers
// Run this after deploying your worker to register the commands

import { config } from 'dotenv';
config();

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const APPLICATION_ID = process.env.APPLICATION_ID;

const commands = [
  {
    name: 'penal',
    description: 'Look up penal codes for crimes (supports robbery shortcuts and PC-XXX codes)',
    options: [
      {
        type: 3, // STRING
        name: 'crime',
        description: 'Crime type or penal code (e.g., "bank rob", "PC-001", "murder", etc.)',
        required: true
      }
    ]
  },
  {
    name: 'penal-code',
    description: 'Look up penal code by number (automatically adds PC- prefix)',
    options: [
      {
        type: 3, // STRING
        name: 'code',
        description: 'Penal code number (e.g., "001", "010", "011")',
        required: true
      }
    ]
  },
  {
    name: 'penal-search',
    description: 'Search for penal codes by keyword',
    options: [
      {
        type: 3, // STRING
        name: 'keyword',
        description: 'Search term for crime types',
        required: true
      }
    ]
  },
  {
    name: 'penal-all',
    description: 'List all penal codes (paginated)',
    options: [
      {
        type: 4, // INTEGER
        name: 'page',
        description: 'Page number (default: 1)',
        required: false,
        min_value: 1
      }
    ]
  },
  {
    name: 'penal-severity',
    description: 'List penal codes by severity (highest sentence first)'
  },
  {
    name: 'penal-help',
    description: 'Show penal code bot help and robbery shortcuts'
  }
];

async function registerCommands() {
  if (!DISCORD_TOKEN || !APPLICATION_ID) {
    console.error('Error: Missing environment variables!');
    console.log('Please set DISCORD_TOKEN and APPLICATION_ID in your .env file');
    process.exit(1);
  }

  const url = `https://discord.com/api/v10/applications/${APPLICATION_ID}/commands`;
  
  try {
    console.log('Registering slash commands...');
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`Successfully registered ${data.length} commands:`);
      data.forEach(cmd => console.log(`   • /${cmd.name}`));
    } else {
      const error = await response.text();
      console.error('Failed to register commands:', error);
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

console.log('Discord Command Registration for Cloudflare Workers');
console.log('==================================================');
console.log('');
console.log('BEFORE RUNNING THIS SCRIPT:');
console.log('1. Make sure your .env file has DISCORD_TOKEN and APPLICATION_ID');
console.log('2. Make sure your Cloudflare Worker is deployed');
console.log('3. Set the Interactions Endpoint URL in Discord Developer Portal');
console.log('4. The URL should be: https://your-worker-name.your-subdomain.workers.dev');
console.log('');

registerCommands();
