import { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { PenalCodeProcessor } from './penal-processor.js';

config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const penalProcessor = new PenalCodeProcessor();

// Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('penal')
    .setDescription('Look up penal codes for crimes (supports robbery shortcuts and PC-XXX codes)')
    .addStringOption(option =>
      option.setName('crime')
        .setDescription('Crime type or penal code (e.g., "bank rob", "PC-001", "murder", etc.)')
        .setRequired(true)
    ),
    
  new SlashCommandBuilder()
    .setName('penal-search')
    .setDescription('Search for penal codes by keyword')
    .addStringOption(option =>
      option.setName('keyword')
        .setDescription('Search term for crime types')
        .setRequired(true)
    ),
    
  new SlashCommandBuilder()
    .setName('penal-all')
    .setDescription('List all penal codes (paginated)')
    .addIntegerOption(option =>
      option.setName('page')
        .setDescription('Page number (default: 1)')
        .setMinValue(1)
    ),
    
  new SlashCommandBuilder()
    .setName('penal-severity')
    .setDescription('List penal codes by severity (highest sentence first)'),
    
  new SlashCommandBuilder()
    .setName('penal-help')
    .setDescription('Show penal code bot help and robbery shortcuts'),
    
  new SlashCommandBuilder()
    .setName('penal-code')
    .setDescription('Look up penal code by number (automatically adds PC- prefix)')
    .addStringOption(option =>
      option.setName('code')
        .setDescription('Penal code number (e.g., "001", "010", "011")')
        .setRequired(true)
    )
];

client.once('ready', async () => {
  console.log(`${client.user.tag} is online!`);
  console.log('Penal Code Bot Ready');
  
  // Register slash commands
  try {
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    console.log('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands.map(command => command.toJSON()) },
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case 'penal':
        await handlePenalCommand(interaction);
        break;
        
      case 'penal-search':
        await handleSearchCommand(interaction);
        break;
        
      case 'penal-all':
        await handleAllCommand(interaction);
        break;
        
      case 'penal-severity':
        await handleSeverityCommand(interaction);
        break;
        
      case 'penal-help':
        await handleHelpCommand(interaction);
        break;
        
      case 'penal-code':
        await handlePenalCodeCommand(interaction);
        break;
    }
  } catch (error) {
    console.error('Error handling command:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Error')
      .setDescription(`Sorry, there was an error processing your request: ${error.message}`)
      .setTimestamp();
      
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

async function handlePenalCommand(interaction) {
  const crimeInput = interaction.options.getString('crime');
  
  // Check if input contains multiple crimes (comma-separated)
  if (crimeInput.includes(',')) {
    const multipleResults = penalProcessor.findMultiplePenalCodes(crimeInput);
    
    if (!multipleResults || multipleResults.length === 0) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('No Matches Found')
        .setDescription(`No penal codes found for "${crimeInput}"`)
        .addFields({
          name: 'Try These Commands',
          value: [
            '• `bank rob` or `rob bank` - Major Armed Robbery',
            '• `store rob` or `rob store` - Armed Robbery',
            '• `church rob` - Major Armed Robbery',
            '• `forge rob` - Major Armed Robbery',
            '• Use `/penal-search` to search by keyword',
            '• Use `/penal-help` for more help'
          ].join('\n')
        })
        .setTimestamp();
        
      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    // Handle multiple crimes
    const embed = new EmbedBuilder()
      .setColor('#dc143c')
      .setTitle(`Multiple Penal Codes (${multipleResults.length} found)`)
      .setDescription(`Found ${multipleResults.length} penal codes for your crimes:`)
      .setTimestamp();

    multipleResults.forEach((penalData, index) => {
      const formatted = penalProcessor.formatPenalCode(penalData);
      embed.addFields({
        name: `${index + 1}. ${formatted.title}`,
        value: `**${formatted.months} months** imprisonment and **${formatted.fine}** fine`,
        inline: false
      });
    });

    embed.setFooter({ text: `Search terms: "${crimeInput}"` });
    await interaction.reply({ embeds: [embed] });
    return;
  }

  // Handle single crime (existing logic)
  const penalData = penalProcessor.findRobberyPenalCode(crimeInput);
  
  if (!penalData) {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('No Match Found')
      .setDescription(`No penal code found for "${crimeInput}"`)
      .addFields({
        name: 'Try These Commands',
        value: [
          '• `bank rob` or `rob bank` - Major Armed Robbery',
          '• `store rob` or `rob store` - Armed Robbery',
          '• `church rob` - Major Armed Robbery',
          '• `forge rob` - Major Armed Robbery',
          '• Use `/penal-search` to search by keyword',
          '• Use `/penal-help` for more help'
        ].join('\n')
      })
      .setTimestamp();
      
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const formatted = penalProcessor.formatPenalCode(penalData);
  
  const embed = new EmbedBuilder()
    .setColor('#dc143c')
    .setTitle(`${formatted.title}`)
    .setDescription(formatted.description)
    .addFields({
      name: 'Penalty Summary',
      value: `**${formatted.months} months** imprisonment and **${formatted.fine}** fine`,
      inline: false
    })
    .setFooter({ text: `Search term: "${crimeInput}"` })
    .setTimestamp();
    
  await interaction.reply({ embeds: [embed] });
}

async function handleSearchCommand(interaction) {
  const keyword = interaction.options.getString('keyword');
  const penalData = penalProcessor.searchPenalCode(keyword);
  
  if (!penalData) {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('No Results')
      .setDescription(`No penal codes found matching "${keyword}"`)
      .setFooter({ text: 'Try different keywords or use /penal-all to browse all codes' })
      .setTimestamp();
      
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const formatted = penalProcessor.formatPenalCode(penalData);
  
  const embed = new EmbedBuilder()
    .setColor('#4169e1')
    .setTitle(`Search Result: ${formatted.title}`)
    .setDescription(formatted.description)
    .setFooter({ text: `Search term: "${keyword}"` })
    .setTimestamp();
    
  await interaction.reply({ embeds: [embed] });
}

async function handleAllCommand(interaction) {
  await interaction.deferReply();
  
  const page = interaction.options.getInteger('page') || 1;
  const allCodes = penalProcessor.getAllPenalCodes();
  const codesPerPage = 10;
  const totalPages = Math.ceil(allCodes.length / codesPerPage);
  
  if (page < 1 || page > totalPages) {
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Invalid Page')
      .setDescription(`Page must be between 1 and ${totalPages}`)
      .setTimestamp();
      
    await interaction.editReply({ embeds: [embed] });
    return;
  }
  
  const start = (page - 1) * codesPerPage;
  const end = start + codesPerPage;
  const pageCodes = allCodes.slice(start, end);
  
  const embed = new EmbedBuilder()
    .setColor('#32cd32')
    .setTitle('All Penal Codes')
    .setDescription(`Page ${page} of ${totalPages} | ${allCodes.length} total codes`)
    .setTimestamp();
    
  pageCodes.forEach((code, index) => {
    const fine = typeof code.fine === 'number' 
      ? `$${code.fine.toLocaleString()}` 
      : code.fine;
      
    embed.addFields({
      name: `${start + index + 1}. ${code.crime}`,
      value: `${code.months} months | ${fine}`,
      inline: true
    });
  });
  
  if (totalPages > 1) {
    embed.setFooter({ 
      text: `Use /penal-all page:${page < totalPages ? page + 1 : 1} for ${page < totalPages ? 'next' : 'first'} page` 
    });
  }
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleSeverityCommand(interaction) {
  await interaction.deferReply();
  
  const codesBySeverity = penalProcessor.getPenalCodesBySeverity();
  const topCodes = codesBySeverity.slice(0, 15); // Show top 15 most severe
  
  const embed = new EmbedBuilder()
    .setColor('#8b0000')
    .setTitle('Penal Codes by Severity')
    .setDescription('Most severe crimes (by sentence length)')
    .setTimestamp();
    
  topCodes.forEach((code, index) => {
    const fine = typeof code.fine === 'number' 
      ? `$${code.fine.toLocaleString()}` 
      : code.fine;
      
    embed.addFields({
      name: `${index + 1}. ${code.crime}`,
      value: `**${code.months} months** | ${fine}`,
      inline: true
    });
  });
  
  embed.setFooter({ text: `Showing top ${topCodes.length} of ${codesBySeverity.length} crimes` });
  
  await interaction.editReply({ embeds: [embed] });
}

async function handleHelpCommand(interaction) {
  const robberyCommands = penalProcessor.getRobberyCommands();
  
  const embed = new EmbedBuilder()
    .setColor('#800080')
    .setTitle('Penal Code Bot Help')
    .setDescription('This bot helps you look up penal codes and sentences for various crimes.')
    .addFields(
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
    )
    .setFooter({ text: 'All sentences are in months of imprisonment' })
    .setTimestamp();
    
  await interaction.reply({ embeds: [embed] });
}

async function handlePenalCodeCommand(interaction) {
  const codeInput = interaction.options.getString('code');
  
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
    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('Penal Code Not Found')
      .setDescription(`No penal code found for "${fullCode}"`)
      .addFields({
        name: 'Valid Code Examples',
        value: [
          '• `001` - Capital Murder',
          '• `010` - Major Armed Robbery',
          '• `011` - Armed Robbery',
          '• `003` - Attempted Capital Murder',
          '• Use `/penal-search` to search by keyword',
          '• Use `/penal-help` for more help'
        ].join('\n')
      })
      .setTimestamp();
      
    await interaction.reply({ embeds: [embed], ephemeral: true });
    return;
  }

  const formatted = penalProcessor.formatPenalCode(penalData);
  
  const embed = new EmbedBuilder()
    .setColor('#32cd32')
    .setTitle(`${formatted.title}`)
    .setDescription(formatted.description)
    .addFields({
      name: 'Penalty Summary',
      value: `**${formatted.months} months** imprisonment and **${formatted.fine}** fine`,
      inline: false
    })
    .setFooter({ text: `Penal Code: ${fullCode}` })
    .setTimestamp();
    
  await interaction.reply({ embeds: [embed] });
}

// Login
if (process.env.DISCORD_TOKEN) {
  client.login(process.env.DISCORD_TOKEN);
} else {
  console.error('Please set DISCORD_TOKEN in your environment variables or .env file');
  process.exit(1);
}
