import fs from 'fs';
import path from 'path';

export class PenalCodeProcessor {
  constructor(csvFilePath = 'data.csv') {
    this.csvFilePath = csvFilePath;
    this.penalCodes = new Map();
    this.loadPenalCodes();
  }

  loadPenalCodes() {
    try {
      const csvContent = fs.readFileSync(this.csvFilePath, 'utf-8');
      const lines = csvContent.split('\n');
      
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
          // Parse CSV with proper handling of commas in descriptions
          const columns = this.parseCSVLine(line);
          if (columns.length >= 5) {
            // Handle the case where there might be empty columns due to tabs
            const penalCode = columns[0];
            const crime = columns[1];
            const months = columns[2] || columns[3]; // Try column 2 first, then 3
            const fine = columns[3] || columns[4]; // Try column 3 first, then 4
            const description = columns[4] || columns[5]; // Try column 4 first, then 5
            
            if (crime && crime !== 'None' && crime.trim() !== '') {
              // This is a main crime row
              this.penalCodes.set(crime.toLowerCase(), {
                crime: crime.trim(),
                months: this.parseMonths(months),
                fine: this.parseFine(fine),
                description: description.trim(),
                code: penalCode.trim()
              });
            } else if (penalCode && penalCode.endsWith('1') && fine.trim() !== '') {
              // This is a fine-only row (like P.C. 2231)
              const baseCode = penalCode.replace(/1$/, ''); // Remove trailing 1
              for (const [key, value] of this.penalCodes) {
                if (value.code === baseCode) {
                  value.fine = this.parseFine(fine);
                  break;
                }
              }
            }
          }
        }
      }
      
      console.log(`Loaded ${this.penalCodes.size} penal codes`);
    } catch (error) {
      console.error('Error loading penal codes:', error);
    }
  }

  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === '\t') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  parseMonths(months) {
    if (!months || months.toLowerCase().includes('judge') || months.toLowerCase().includes('discretion')) {
      return 'Judge Discretion';
    }
    const numericMonths = parseInt(months);
    return isNaN(numericMonths) ? months : numericMonths;
  }

  parseFine(fine) {
    if (!fine || fine.toLowerCase().includes('judge') || fine.toLowerCase().includes('rulement') || fine.toLowerCase().includes('disctetion')) {
      return 'Judge Discretion';
    }
    const numericFine = parseInt(fine);
    return isNaN(numericFine) ? fine : numericFine;
  }

  getPenalCodeNumber(crime) {
    // The penal code number is now stored directly in the data
    // This method is kept for backward compatibility but the actual code
    // is now loaded from the CSV file
    return 'PC-XXX';
  }

  // Method to handle multiple crimes separated by commas
  findMultiplePenalCodes(input) {
    const crimes = input.split(',').map(crime => crime.trim());
    const results = [];
    
    for (const crime of crimes) {
      if (crime) {
        const result = this.findRobberyPenalCode(crime);
        if (result) {
          results.push(result);
        }
      }
    }
    
    return results.length > 0 ? results : null;
  }

  // Main method to find penal code with smart recognition
  findRobberyPenalCode(input) {
    const normalizedInput = input.toLowerCase().trim();
    
    // First check if input is a penal code number (PC-XXX format)
    if (normalizedInput.match(/^pc-\d+$/i)) {
      const codeResult = this.searchByPenalCodeNumber(normalizedInput);
      if (codeResult) {
        return codeResult;
      }
    }
    
    // Smart recognition patterns
    const smartMappings = {
      // Robberies
      'bank rob': 'major armed robbery',
      'rob bank': 'major armed robbery',
      'church rob': 'major armed robbery', 
      'rob church': 'major armed robbery',
      'forge rob': 'major armed robbery',
      'rob forge': 'major armed robbery',
      'bank robbery': 'major armed robbery',
      'church robbery': 'major armed robbery',
      'forge robbery': 'major armed robbery',
      'store rob': 'armed robbery',
      'rob store': 'armed robbery',
      'store robbery': 'armed robbery',
      'rob a general': 'armed robbery',
      'rob general': 'armed robbery',
      'general robbery': 'armed robbery',
      
      // Theft vs Robbery distinctions
      'steal from store': 'unarmed robbery',
      'steal from shop': 'unarmed robbery',
      'steal from bank': 'unarmed robbery',
      'theft': 'unarmed robbery',
      'steal': 'unarmed robbery',
      'pickpocket': 'unarmed robbery',
      'snatch': 'unarmed robbery',
      
      
      // Kidnapping variations
      'kidnap law': 'Kidnapping of a Government Official',
      'kidnap gov': 'Kidnapping of a Government Official',
      'kidnap cop': 'Kidnapping of a Government Official',
      'kidnap officer': 'Kidnapping of a Government Official',
      'kidnap official': 'Kidnapping of a Government Official',
      'kidnap government': 'Kidnapping of a Government Official',
      'kidnap': 'kidnapping',
      // Murder attempts
      'attempt murder': 'attempted murder',
      'attempted murder': 'attempted murder',
      'try murder': 'attempted murder',
      'try to murder': 'attempted murder',
      'attempt capital murder': 'attempted capital murder',
      'attempted capital murder': 'attempted capital murder',
      
      // Attempted Capital Murder (shooting law enforcement) - MUST come first
      'shot at law': 'attempted capital murder',
      'shoot at law': 'attempted capital murder',
      'shot at cop': 'attempted capital murder',
      'shoot at cop': 'attempted capital murder',
      'shot at officer': 'attempted capital murder',
      'shoot at officer': 'attempted capital murder',
      'shot at gov': 'attempted capital murder',
      'shoot at gov': 'attempted capital murder',
      'shot at government': 'attempted capital murder',
      'shoot at government': 'attempted capital murder',
      'shot law': 'attempted capital murder',
      'shoot law': 'attempted capital murder',
      'shot cop': 'attempted capital murder',
      'shoot cop': 'attempted capital murder',
      'shot officer': 'attempted capital murder',
      'shoot officer': 'attempted capital murder',
      'shot government': 'attempted capital murder',
      'shoot government': 'attempted capital murder',
      
      // Civilian shooting (lower priority)
      'shot at civ': 'attempted murder',
      'shoot at civ': 'attempted murder',
      
      // Assault variations
      'punch': 'aggravated assault',
      'punching': 'aggravated assault',
      'kick': 'aggravated assault',
      'kicking': 'aggravated assault',
      'beat': 'aggravated assault',
      'beating': 'aggravated assault',
      
      // Capital Murder (killing law enforcement)
      'killed a law': 'capital murder',
      'killed a gov': 'capital murder',
      'killed gov': 'capital murder',
      'killed law': 'capital murder',
      'kill law': 'capital murder',
      'killed cop': 'capital murder',
      'kill cop': 'capital murder',
      'killed officer': 'capital murder',
      'kill officer': 'capital murder',
      'killed government': 'capital murder',
      'kill government': 'capital murder',
      'murder law': 'capital murder',
      'murder cop': 'capital murder',
      'murder officer': 'capital murder',
      
      // Drug related
      'drug dealing': 'Intent/Distribution of Illegal Contraband',
      'drug deal': 'Intent/Distribution of Illegal Contraband',
      'selling drugs': 'Intent/Distribution of Illegal Contraband',
      'sell drugs': 'Intent/Distribution of Illegal Contraband',
      'selling drug': 'Intent/Distribution of Illegal Contraband',
      'sell drug': 'Intent/Distribution of Illegal Contraband',
      'distribute drugs': 'Intent/Distribution of Illegal Contraband',
      'selling cocaine': 'Intent/Distribution of Illegal Contraband',
      'selling meth': 'Intent/Distribution of Illegal Contraband',
      'selling heroin': 'Intent/Distribution of Illegal Contraband',
      'selling weed': 'Intent/Distribution of Illegal Contraband',
      'selling opioids': 'Intent/Distribution of Illegal Contraband',
      'selling ketamine': 'Intent/Distribution of Illegal Contraband',
      'selling moonshine': 'Intent/Distribution of Illegal Contraband',
      'selling k': 'Intent/Distribution of Illegal Contraband',
      'carrying drugs': 'Possession of Illegal Contrabands',
      'carry drugs': 'Possession of Illegal Contrabands',
      'carrying cocaine': 'Possession of Illegal Contrabands',
      'carrying meth': 'Possession of Illegal Contrabands',
      'carrying heroin': 'Possession of Illegal Contrabands',
      'carrying weed': 'Possession of Illegal Contrabands',
      'carrying opioids': 'Possession of Illegal Contrabands',
      'carrying ketamine': 'Possession of Illegal Contrabands',
      'carrying moonshine': 'Possession of Illegal Contrabands',
      'carrying k': 'Possession of Illegal Contrabands',
      'drug possession': 'Possession of Illegal Contrabands',
      'possess drugs': 'Possession of Illegal Contrabands',
      'drug manufacture': 'Manufacture of Contrabands',
      'making drugs': 'Manufacture of Contrabands',
      
      // Arrest resistance
      'resist arrest': 'evading or resisting arrest',
      'resisting arrest': 'evading or resisting arrest',
      'evade arrest': 'evading or resisting arrest',
      'evading arrest': 'evading or resisting arrest',
      'run from cops': 'evading or resisting arrest',
      
      // Escape
      'escape custody': 'escaping from custody',
      'escaping custody': 'escaping from custody',
      'prison break': 'escaping from custody',
      'jailbreak': 'escaping from custody',
      
      // Other common phrases
      'shoot gun': 'negligent discharge of a firearm',
      'fire weapon': 'negligent discharge of a firearm',
      'discharge firearm': 'negligent discharge of a firearm',
      'shoot in town': 'negligent discharge of a firearm',
      'fake identity': 'false impersonation',
      'pretend to be someone': 'false impersonation',
      'impersonate': 'false impersonation',
      'lie to cop': 'providing false information',
      'false info': 'providing false information',
      'bribe cop': 'bribery to a government official',
      'bribe law': 'bribery to a government official',
      'bribe': 'bribery to a government official',
      'bribe official': 'bribery to a government official',
      'threaten': 'harassment',
      'kill animal': 'cruelty to domesticated animals',
      'animal abuse': 'cruelty to domesticated animals',
      'hurt animal': 'cruelty to domesticated animals',

      'treaspassing': 'trespassing',
      'trepassing': 'trespassing',

      'reckless riding in town': 'reckless endangerment',
      'reckless riding': 'reckless endangerment',
      'ride recklessly': 'reckless endangerment',
      'ride recklessly in town': 'reckless endangerment',
      'reckless driving in town': 'reckless endangerment',
      'reckless driving': 'reckless endangerment',
      'drive recklessly': 'reckless endangerment',
      'drive recklessly in town': 'reckless endangerment',
      'riding fast in town': 'reckless endangerment',
      'driving fast in town': 'reckless endangerment',


      'help criminal': 'aiding and abetting',
      'help criminals': 'aiding and abetting',
      'cover criminal': 'aiding and abetting',
      'cover criminals': 'aiding and abetting',
      
      'road blocking': 'loitering/obstruction of traffic',
      'blocking traffic': 'loitering/obstruction of traffic',

    };

    // Check smart mappings first
    for (const [pattern, penalType] of Object.entries(smartMappings)) {
      if (normalizedInput.includes(pattern)) {
        return this.getPenalCode(penalType);
      }
    }

    // If no smart mapping found, try regular search
    return this.searchPenalCode(normalizedInput);
  }

  // Get specific penal code by exact crime name
  getPenalCode(crimeName) {
    const normalizedCrime = crimeName.toLowerCase();
    return this.penalCodes.get(normalizedCrime) || null;
  }

  // Search for penal codes using smart mappings only
  searchPenalCode(searchTerm) {
    const normalizedSearch = searchTerm.toLowerCase();
    
    // First try exact match
    if (this.penalCodes.has(normalizedSearch)) {
      return this.penalCodes.get(normalizedSearch);
    }

    // Try partial matches
    for (const [crime, data] of this.penalCodes) {
      if (crime.includes(normalizedSearch) || normalizedSearch.includes(crime)) {
        return data;
      }
    }

    return null;
  }

  // Search by penal code number (PC-XXX format)
  searchByPenalCodeNumber(codeNumber) {
    const normalizedCode = codeNumber.toUpperCase().trim();
    
    // Search through all penal codes for matching code number
    for (const [crime, data] of this.penalCodes) {
      if (data.code && data.code.toUpperCase() === normalizedCode) {
        return data;
      }
    }

    return null;
  }


  // Get all penal codes
  getAllPenalCodes() {
    return Array.from(this.penalCodes.values()).sort((a, b) => a.crime.localeCompare(b.crime));
  }

  // Get penal codes by severity (months)
  getPenalCodesBySeverity() {
    return Array.from(this.penalCodes.values())
      .sort((a, b) => (b.months || 0) - (a.months || 0));
  }

  // Format penal code for display
  formatPenalCode(penalData, showDetails = true) {
    if (!penalData) return null;

    const fine = typeof penalData.fine === 'number' 
      ? `$${penalData.fine.toLocaleString()}` 
      : penalData.fine;

    if (showDetails) {
      return {
        title: penalData.crime,
        months: penalData.months || 0,
        fine: fine,
        code: penalData.code || 'PC-XXX',
        description: penalData.description || 'No description available',
        fullDescription: `**Penal Code:** ${penalData.code || 'PC-XXX'}\n**Sentence:** ${penalData.months || 0} months\n**Fine:** ${fine}\n**Description:** ${penalData.description || 'No description available'}`
      };
    }

    return {
      title: penalData.crime,
      summary: `${penalData.code || 'PC-XXX'} | ${penalData.months || 0} months | ${fine}`
    };
  }

  // Get robbery-specific help text
  getRobberyCommands() {
    return {
      majorRobberies: [
        'bank rob / rob bank',
        'church rob / rob church', 
        'forge rob / rob forge',
        'bank robbery',
        'church robbery',
        'forge robbery'
      ],
      armedRobberies: [
        'store rob / rob store',
        'store robbery'
      ]
    };
  }
}
