// Embedded penal code data (no file system access in Cloudflare Workers)
// Data matches data.csv structure: Penal Code #, Crime, Months, Fine, Description
const PENAL_DATA = [
  { code: 'P.C. 201', crime: 'Capital Murder', months: 60, fine: 20000, description: 'Murder of a government official such as a doctor or a law enforcement officer' },
  { code: 'P.C. 202', crime: 'Murder', months: 60, fine: 10000, description: 'Murder of a civilian or a local' },
  { code: 'P.C. 203', crime: 'Attempted Capital Murder', months: 45, fine: 3000, description: 'The Attempted Murder of a government official' },
  { code: 'P.C. 204', crime: 'Attempted Murder', months: 35, fine: 2000, description: 'The Attempted Murder of a civillan' },
  { code: 'P.C. 205', crime: 'Aggravated Assault', months: 30, fine: 2000, description: 'When a person causes serious bodily harm to another' },
  { code: 'P.C. 206', crime: 'Torture', months: 40, fine: 2000, description: 'The action or practice of inflicting severe pain or suffering on someone as a punishment or in order to force them to do or say something' },
  { code: 'P.C. 207', crime: 'Serial Crime', months: 'Judge Discretion', fine: 20000, description: 'The conviction or proven commission of 4 or more separate Class A crimes within a 24-hour period or 8 in a 72-hour period. These must be separate incidents, in which the 4th occurrence enacts this penalty and MUST be confirmed/given by the AG, DA, ADA, or Judge' },
  { code: 'P.C. 208', crime: 'Animal Abuse', months: 30, fine: 5000, description: 'Animal abuse is the act of causing physical, emotional, or sexual harm to an animal, or depriving it of basic needs. It can be intentional or unintentional.' },
  { code: 'P.C. 209', crime: 'Kidnapping of a Government Official', months: 35, fine: 2000, description: 'When a person unlawfully restrains a government official against one\'s will' },
  { code: 'P.C. 210', crime: 'Kidnapping', months: 25, fine: 900, description: 'When someone takes a civilian and holds them at will by force' },
  { code: 'P.C. 211', crime: 'Major Armed Robbery', months: 30, fine: 20000, description: 'This is when someone uses force and robs a bank or fort' },
  { code: 'P.C. 212', crime: 'Armed Robbery', months: 25, fine: 950, description: 'When someone robs a civilian or a General store' },
  { code: 'P.C. 213', crime: 'Unarmed Robbery', months: 20, fine: 900, description: 'When someone robs a place or person without the use of a weapon' },
  { code: 'P.C. 214', crime: 'Arson', months: 25, fine: 850, description: 'Arson is the crime of willfully and deliberately setting fire to or charring property' },
  { code: 'P.C. 215', crime: 'Terrorism', months: 50, fine: 2500, description: 'the unlawful use of violence and intimidation, especially against civilians, in the pursuit of political aims.' },
  { code: 'P.C. 216', crime: 'Riot', months: 30, fine: 2000, description: 'a public disturbance where three or more people behave in a violent and uncontrolled manner' },
  { code: 'P.C. 217', crime: 'Government Corruption', months: 240, fine: 30000, description: 'the abuse of public power, office, or resources by elected government officials for personal gain, by extortion, soliciting or offering bribes.' },
  { code: 'P.C. 218', crime: 'Extortion', months: 30, fine: 15000, description: 'Extortion takes place when someone threatens, pressures, or scares another person in order to receive money, goods, or services' },
  { code: 'P.C. 219', crime: 'Bribery to a Government Official', months: 20, fine: 5000, description: 'the offering, giving, or soliciting of money or any item of value as a means of influencing the actions of an individual holding a public or legal duty.' },
  { code: 'P.C. 220', crime: 'Vigilantism', months: 15, fine: 850, description: 'law enforcement undertaken without legal authority by a self-appointed group of people.' },
  { code: 'P.C. 221', crime: 'Escaping From Custody', months: 30, fine: 1500, description: 'the departure without lawful authority or the failure to return to custody following an assignment or temporary leave granted for a specific purpose or limited period.' },
  { code: 'P.C. 222', crime: 'Intent/Distribution of Illegal Contraband', months: 25, fine: 800, description: 'The Selling of a contraband item' },
  { code: 'P.C. 223', crime: 'Possession of Illegal Contrabands', months: 10, fine: 650, description: 'The Possession of Contraband item' },
  { code: 'P.C. 224', crime: 'Manufacture of Contraband', months: 20, fine: 750, description: 'Making of Contraband item' },
  { code: 'P.C. 301', crime: 'Unarmed Assault', months: 10, fine: 550, description: 'That he possessed a specific or actual intent to cause the death of the person assaulted' },
  { code: 'P.C. 302', crime: 'Evading or Resisting Arrest', months: 15, fine: 750, description: 'Fleeing away from Law Enforcment' },
  { code: 'P.C. 303', crime: 'Aiding and Abetting', months: 10, fine: 800, description: 'Aiding or abetting a known fugitive of the law' },
  { code: 'P.C. 304', crime: 'Obstruction of Justice', months: 10, fine: 600, description: 'is an act that involves unduly influencing, impeding, or otherwise interfering with the justice system' },
  { code: 'P.C. 305', crime: 'False Impersonation', months: 15, fine: 600, description: 'when someone impersonates another person expressly for the purpose of defrauding others.' },
  { code: 'P.C. 306', crime: 'Reckless Endangerment', months: 15, fine: 600, description: 'the offense of recklessly engaging in conduct that creates a substantial risk of serious physical injury or death to another person.' },
  { code: 'P.C. 307', crime: 'Destruction of Property', months: 15, fine: 650, description: 'Damage or destruction of real or tangible personal property, caused by negligence' },
  { code: 'P.C. 308', crime: 'Providing False Information', months: 10, fine: 750, description: 'Giving law enforcement false information' },
  { code: 'P.C. 309', crime: 'Harassment', months: 15, fine: 750, description: 'aggressive pressure or intimidation.' },
  { code: 'P.C. 310', crime: 'Disregarding a Lawful Order/Town Ordinance', months: 15, fine: 750, description: 'violations or failures to obey lawful general orders or regulations, failures to obey other lawful orders, and dereliction of duty' },
  { code: 'P.C. 311', crime: 'Negligent Discharge of a Firearm', months: 15, fine: 650, description: 'an unintentional firing of a shot due to a violation of the Four Universal Firearms Safety Rules, or other improper weapon handling' },
  { code: 'P.C. 312', crime: 'Cruelty to Domesticated Animals', months: 10, fine: 600, description: 'the crime of inflicting physical pain, suffering or death on an animal, usually a tame one, beyond necessity for normal discipline' },
  { code: 'P.C. 313', crime: 'Conspiracy to Commit Any Act of Crime', months: 15, fine: 800, description: 'an agreement between two or more people to commit an illegal act, along with an intent to achieve the agreement\'s goal' },
  { code: 'P.C. 314', crime: 'Disorderly Conduct', months: 10, fine: 650, description: 'unruly behavior constituting a minor offense.' },
  { code: 'P.C. 315', crime: 'Disturbing the Peace', months: 10, fine: 650, description: 'an act of violent or noisy behavior that causes a public disturbance and is considered a criminal offense.' },
  { code: 'P.C. 316', crime: 'Trespassing', months: 10, fine: 600, description: 'knowingly entering another owners\' property or land without permission' },
  { code: 'P.C. 317', crime: 'Improper Commercial Sales', months: 10, fine: 600, description: 'Not having the right licenses to sell' },
  { code: 'P.C. 318', crime: 'Illegal Panning/Mining', months: 15, fine: 600, description: 'mining activity that is undertaken without state permission, in particular in absence of land rights, mining licenses, and exploration or mineral transportation permits' },
  { code: 'P.C. 319', crime: 'Loitering/Obstruction of Traffic', months: 10, fine: 600, description: 'Obstruction of Traffic means the intentional act of walking, standing, sitting, lying, or placing, or use of an object in any manner that results in the interference, slowing, or interruption of the passage of the normal flow of traffic on the Road.' }
];

export class PenalCodeProcessor {
  constructor() {
    this.penalCodes = new Map();
    this.loadPenalCodes();
  }

  loadPenalCodes() {
    PENAL_DATA.forEach(data => {
      if (data.crime) {
        this.penalCodes.set(data.crime.toLowerCase(), {
          crime: data.crime,
          months: typeof data.months === 'number' ? data.months : data.months,
          fine: typeof data.fine === 'number' ? data.fine : data.fine,
          description: data.description || 'No description available',
          code: data.code || 'PC-XXX'
        });
      }
    });
    
    console.log(`Loaded ${this.penalCodes.size} penal codes`);
  }

  getPenalCodeNumber(crime) {
    // The penal code number is now stored directly in the data
    // This method is kept for backward compatibility but the actual code
    // is now loaded from the embedded data
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
        const result = this.getPenalCode(penalType);
        if (result) {
          return result;
        }
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
      .filter(code => typeof code.months === 'number')
      .sort((a, b) => (b.months || 0) - (a.months || 0));
  }

  // Format penal code for display
  formatPenalCode(penalData, showDetails = true) {
    if (!penalData) return null;

    const fine = typeof penalData.fine === 'number' 
      ? `$${penalData.fine.toLocaleString()}` 
      : penalData.fine;

    const months = typeof penalData.months === 'number' 
      ? penalData.months.toString() 
      : penalData.months;

    if (showDetails) {
      return {
        title: penalData.crime,
        months: months,
        fine: fine,
        code: penalData.code || 'PC-XXX',
        description: penalData.description || 'No description available',
        fullDescription: `**Penal Code:** ${penalData.code || 'PC-XXX'}\n**Sentence:** ${months} months\n**Fine:** ${fine}\n**Description:** ${penalData.description || 'No description available'}`
      };
    }

    return {
      title: penalData.crime,
      summary: `${penalData.code || 'PC-XXX'} | ${months} months | ${fine}`
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
