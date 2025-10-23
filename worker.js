import { verifyKey } from 'discord-interactions';
import { PenalCodeProcessor } from './penal-processor-worker.js';

// Initialize the penal code processor
const penalProcessor = new PenalCodeProcessor();

export default {
  async fetch(request, env, ctx) {
    try {
      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
        });
      }

      if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }

      // Verify the request is from Discord
      const signature = request.headers.get('X-Signature-Ed25519');
      const timestamp = request.headers.get('X-Signature-Timestamp');
      const body = await request.text();

      const isValidRequest = verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY);
      if (!isValidRequest) {
        return new Response('Invalid request signature', { status: 401 });
      }

      const interaction = JSON.parse(body);

      // Handle ping from Discord
      if (interaction.type === 1) {
        return new Response(JSON.stringify({ type: 1 }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Handle application commands
      if (interaction.type === 2) {
        return await handleCommand(interaction, env);
      }

      return new Response('Unknown interaction type', { status: 400 });
    } catch (error) {
      console.error('Error handling request:', error);
      return new Response('Internal server error', { status: 500 });
    }
  },
};

async function handleCommand(interaction, env) {
  const { data: command } = interaction;
  
  try {
    switch (command.name) {
      case 'penal':
        return handlePenalCommand(interaction);
        
      case 'penal-search':
        return handleSearchCommand(interaction);
        
      case 'penal-all':
        return handleAllCommand(interaction);
        
      case 'penal-severity':
        return handleSeverityCommand(interaction);
        
      case 'penal-help':
        return handleHelpCommand(interaction);
        
      case 'penal-code':
        return handlePenalCodeCommand(interaction);
        
      default:
        return createErrorResponse('Unknown command');
    }
  } catch (error) {
    console.error(`Error handling command ${command.name}:`, error);
    return createErrorResponse(`Error: ${error.message}`);
  }
}

function handlePenalCommand(interaction) {
  const crimeInput = getOptionValue(interaction.data.options, 'crime');
  
  if (!crimeInput) {
    return createErrorResponse('Please provide a crime type to look up');
  }
  
  // Check if input contains multiple crimes (comma-separated)
  if (crimeInput.includes(',')) {
    const multipleResults = penalProcessor.findMultiplePenalCodes(crimeInput);
    
    if (!multipleResults || multipleResults.length === 0) {
      const embed = {
        color: 0xff0000,
        title: 'No Matches Found',
        description: `No penal codes found for "${crimeInput}"`,
        fields: [{
          name: 'Try These Commands',
          value: [
            '• `bank rob` or `rob bank` - Major Armed Robbery',
            '• `store rob` or `rob store` - Armed Robbery',
            '• `church rob` - Major Armed Robbery',
            '• `forge rob` - Major Armed Robbery',
            '• Use `/penal-search` to search by keyword',
            '• Use `/penal-help` for more help'
          ].join('\n')
        }],
        timestamp: new Date().toISOString()
      };
      
      return createSuccessResponse({ embeds: [embed], flags: 64 }); // EPHEMERAL
    }

    // Handle multiple crimes
    const embed = {
      color: 0xdc143c,
      title: `Multiple Penal Codes (${multipleResults.length} found)`,
      description: `Found ${multipleResults.length} penal codes for your crimes:`,
      fields: [],
      footer: {
        text: `Search terms: "${crimeInput}"`
      },
      timestamp: new Date().toISOString()
    };

    multipleResults.forEach((penalData, index) => {
      const formatted = penalProcessor.formatPenalCode(penalData);
      embed.fields.push({
        name: `${index + 1}. ${formatted.title} (${penalData.code})`,
        value: `**${formatted.months} months** imprisonment and **${formatted.fine}** fine`,
        inline: false
      });
    });

    return createSuccessResponse({ embeds: [embed] });
  }

  // Handle single crime (existing logic)
  const penalData = penalProcessor.findRobberyPenalCode(crimeInput);
  
  if (!penalData) {
    const embed = {
      color: 0xff0000,
      title: 'No Match Found',
      description: `No penal code found for "${crimeInput}"`,
      fields: [{
        name: 'Try These Commands',
        value: [
          '• `bank rob` or `rob bank` - Major Armed Robbery',
          '• `store rob` or `rob store` - Armed Robbery',
          '• `church rob` - Major Armed Robbery',
          '• `forge rob` - Major Armed Robbery',
          '• Use `/penal-search` to search by keyword',
          '• Use `/penal-help` for more help'
        ].join('\n')
      }],
      timestamp: new Date().toISOString()
    };
    
    return createSuccessResponse({ embeds: [embed], flags: 64 }); // EPHEMERAL
  }

  const formatted = penalProcessor.formatPenalCode(penalData);
  
  const embed = {
    color: 0xdc143c,
    title: `${formatted.title}`,
    description: formatted.description,
    fields: [
      {
        name: 'Penal Code',
        value: `**${formatted.code}**`,
        inline: true
      },
      {
        name: 'Penalty Summary',
        value: `**${formatted.months} months** imprisonment and **${formatted.fine}** fine`,
        inline: false
      }
    ],
    footer: {
      text: `Search term: "${crimeInput}"`
    },
    timestamp: new Date().toISOString()
  };
  
  return createSuccessResponse({ embeds: [embed] });
}

function handleSearchCommand(interaction) {
  const keyword = getOptionValue(interaction.data.options, 'keyword');
  
  if (!keyword) {
    return createErrorResponse('Please provide a keyword to search for');
  }
  
  const penalData = penalProcessor.searchPenalCode(keyword);
  
  if (!penalData) {
    const embed = {
      color: 0xff0000,
      title: 'No Results',
      description: `No penal codes found matching "${keyword}"`,
      footer: {
        text: 'Try different keywords or use /penal-all to browse all codes'
      },
      timestamp: new Date().toISOString()
    };
    
    return createSuccessResponse({ embeds: [embed], flags: 64 }); // EPHEMERAL
  }

  const formatted = penalProcessor.formatPenalCode(penalData);
  
  const embed = {
    color: 0x4169e1,
    title: `Search Result: ${formatted.title}`,
    description: formatted.description,
    fields: [
      {
        name: 'Penal Code',
        value: `**${formatted.code}**`,
        inline: true
      },
      {
        name: 'Penalty Summary',
        value: `**${formatted.months} months** imprisonment and **${formatted.fine}** fine`,
        inline: false
      }
    ],
    footer: {
      text: `Search term: "${keyword}"`
    },
    timestamp: new Date().toISOString()
  };
  
  return createSuccessResponse({ embeds: [embed] });
}

function handleAllCommand(interaction) {
  const page = getOptionValue(interaction.data.options, 'page') || 1;
  const allCodes = penalProcessor.getAllPenalCodes();
  const codesPerPage = 10;
  const totalPages = Math.ceil(allCodes.length / codesPerPage);
  
  if (page < 1 || page > totalPages) {
    return createErrorResponse(`Page must be between 1 and ${totalPages}`);
  }
  
  const start = (page - 1) * codesPerPage;
  const end = start + codesPerPage;
  const pageCodes = allCodes.slice(start, end);
  
  const embed = {
    color: 0x32cd32,
    title: 'All Penal Codes',
    description: `Page ${page} of ${totalPages} | ${allCodes.length} total codes`,
    fields: [],
    timestamp: new Date().toISOString()
  };
  
  pageCodes.forEach((code, index) => {
    const fine = typeof code.fine === 'number' 
      ? `$${code.fine.toLocaleString()}` 
      : code.fine;
    const months = typeof code.months === 'number' 
      ? code.months.toString() 
      : code.months;
    
    embed.fields.push({
      name: `${start + index + 1}. ${code.crime}`,
      value: `${months} months | ${fine}`,
      inline: true
    });
  });
  
  if (totalPages > 1) {
    embed.footer = {
      text: `Use /penal-all page:${page < totalPages ? page + 1 : 1} for ${page < totalPages ? 'next' : 'first'} page`
    };
  }
  
  return createSuccessResponse({ embeds: [embed] });
}

function handleSeverityCommand(interaction) {
  const codesBySeverity = penalProcessor.getPenalCodesBySeverity();
  const topCodes = codesBySeverity.slice(0, 15); // Show top 15 most severe
  
  const embed = {
    color: 0x8b0000,
    title: 'Penal Codes by Severity',
    description: 'Most severe crimes (by sentence length)',
    fields: [],
    footer: {
      text: `Showing top ${topCodes.length} of ${codesBySeverity.length} crimes`
    },
    timestamp: new Date().toISOString()
  };
  
  topCodes.forEach((code, index) => {
    const fine = typeof code.fine === 'number' 
      ? `$${code.fine.toLocaleString()}` 
      : code.fine;
    
    embed.fields.push({
      name: `${index + 1}. ${code.crime}`,
      value: `**${code.months} months** | ${fine}`,
      inline: true
    });
  });
  
  return createSuccessResponse({ embeds: [embed] });
}

function handleHelpCommand(interaction) {
  const robberyCommands = penalProcessor.getRobberyCommands();
  
  const embed = {
    color: 0x800080,
    title: 'Penal Code Bot Help',
    description: 'This bot helps you look up penal codes and sentences for various crimes.',
    fields: [
      {
        name: 'Commands',
        value: [
          '`/penal <crime>` - Look up specific penal code',
          '`/penal-code <number>` - Look up by penal code number',
          '`/penal-search <keyword>` - Search by keyword',
          '`/penal-all [page]` - List all penal codes',
          '`/penal-severity` - View crimes by severity',
          '`/penal-help` - Show this help message'
        ].join('\n'),
        inline: false
      },
      {
        name: 'Major Armed Robbery Shortcuts',
        value: robberyCommands.majorRobberies.map(cmd => `• \`${cmd}\``).join('\n'),
        inline: true
      },
      {
        name: 'Armed Robbery Shortcuts', 
        value: robberyCommands.armedRobberies.map(cmd => `• \`${cmd}\``).join('\n'),
        inline: true
      },
      {
        name: 'Examples',
        value: [
          '`/penal bank rob` - Get Major Armed Robbery',
          '`/penal store rob` - Get Armed Robbery',
          '`/penal murder` - Get Murder charges',
          '`/penal rob bank, kidnap gov, carrying heroin` - Multiple crimes',
          '`/penal-code 001` - Look up PC-001 (Capital Murder)',
          '`/penal-code 010` - Look up PC-010 (Major Armed Robbery)',
          '`/penal-search assault` - Search for assault crimes'
        ].join('\n'),
        inline: false
      },
      {
        name: 'Key Differences',
        value: [
          '**Major Armed Robbery** (30 months, $3,550):',
          '  Banks, Churches, Forges',
          '',
          '**Armed Robbery** (25 months, $950):',
          '  Stores and general robberies'
        ].join('\n'),
        inline: false
      }
    ],
    footer: {
      text: 'All sentences are in months of imprisonment'
    },
    timestamp: new Date().toISOString()
  };
  
  return createSuccessResponse({ embeds: [embed] });
}

function handlePenalCodeCommand(interaction) {
  const codeInput = getOptionValue(interaction.data.options, 'code');
  
  if (!codeInput) {
    return createErrorResponse('Please provide a penal code number to look up');
  }
  
  // Clean and format the input
  let formattedCode = codeInput.trim();
  
  // Remove any existing PC- prefix if user included it
  if (formattedCode.toLowerCase().startsWith('pc-')) {
    formattedCode = formattedCode.substring(3);
  }
  
  // Add PC- prefix
  const fullCode = `PC-${formattedCode}`;
  
  const penalData = penalProcessor.searchByPenalCodeNumber(fullCode);
  
  if (!penalData) {
    const embed = {
      color: 0xff0000,
      title: 'Penal Code Not Found',
      description: `No penal code found for "${fullCode}"`,
      fields: [{
        name: 'Valid Code Examples',
        value: [
          '• `001` - Capital Murder',
          '• `010` - Major Armed Robbery',
          '• `011` - Armed Robbery',
          '• `003` - Attempted Capital Murder',
          '• Use `/penal-search` to search by keyword',
          '• Use `/penal-help` for more help'
        ].join('\n')
      }],
      timestamp: new Date().toISOString()
    };
    
    return createSuccessResponse({ embeds: [embed], flags: 64 }); // EPHEMERAL
  }

  const formatted = penalProcessor.formatPenalCode(penalData);
  
  const embed = {
    color: 0x32cd32,
    title: `${formatted.title}`,
    description: formatted.description,
    fields: [
      {
        name: 'Penal Code',
        value: `**${formatted.code}**`,
        inline: true
      },
      {
        name: 'Penalty Summary',
        value: `**${formatted.months} months** imprisonment and **${formatted.fine}** fine`,
        inline: false
      }
    ],
    footer: {
      text: `Penal Code: ${fullCode}`
    },
    timestamp: new Date().toISOString()
  };
  
  return createSuccessResponse({ embeds: [embed] });
}

// Helper functions
function getOptionValue(options, name) {
  if (!options) return null;
  const option = options.find(opt => opt.name === name);
  return option ? option.value : null;
}

function createSuccessResponse(data) {
  return new Response(JSON.stringify({
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

function createErrorResponse(message) {
  return new Response(JSON.stringify({
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: {
      content: `${message}`,
      flags: 64 // EPHEMERAL
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
