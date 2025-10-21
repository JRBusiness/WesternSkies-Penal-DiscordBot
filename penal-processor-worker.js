// Embedded penal code data (no file system access in Cloudflare Workers)
const PENAL_DATA = [
  { crime: 'Capital Murder', months: 60, fine: 20000, class: '' },
  { crime: 'Murder', months: 60, fine: 10000, class: '' },
  { crime: 'Attempted Capital Murder', months: 45, fine: 3000, class: '' },
  { crime: 'Attempted Murder', months: 35, fine: 2000, class: '' },
  { crime: 'Aggravated Assault', months: 30, fine: 2000, class: '' },
  { crime: 'Torture', months: 40, fine: 2000, class: '' },
  { crime: 'Serial Crime', months: 35, fine: 'Judge Discretion', class: '' },
  { crime: 'Kidnapping of a Government Official', months: 35, fine: 2000, class: '' },
  { crime: 'Kidnapping', months: 25, fine: 900, class: '' },
  { crime: 'Major Armed Robbery', months: 30, fine: 3550, class: '' },
  { crime: 'Armed Robbery', months: 25, fine: 950, class: '' },
  { crime: 'Unarmed Robbery', months: 20, fine: 900, class: '' },
  { crime: 'Arson', months: 25, fine: 850, class: '' },
  { crime: 'Terrorism', months: 50, fine: 2500, class: '' },
  { crime: 'Riot', months: 30, fine: 2000, class: '' },
  { crime: 'Government Corruption', months: 'Judge Discretion', fine: 'Judge Discretion', class: '' },
  { crime: 'Extortion', months: 'Judge Discretion', fine: 'Judge Discretion', class: '' },
  { crime: 'Bribery to a Government Official', months: 20, fine: 550, class: '' },
  { crime: 'Vigilantism', months: 15, fine: 850, class: '' },
  { crime: 'Escaping From Custody', months: 30, fine: 1500, class: '' },
  { crime: 'Intent/Distribution of Illegal Contraband', months: 25, fine: 800, class: '' },
  { crime: 'Possession of Illegal Contraband', months: 10, fine: 650, class: '' },
  { crime: 'Manufacture of Contraband', months: 20, fine: 750, class: '' },
  { crime: 'Unarmed Assault', months: 10, fine: 550, class: '' },
  { crime: 'Evading or Resisting Arrest', months: 15, fine: 750, class: '' },
  { crime: 'Aiding and Abetting', months: 10, fine: 800, class: '' },
  { crime: 'Obstruction of Justice', months: 10, fine: 600, class: '' },
  { crime: 'False Impersonation', months: 15, fine: 600, class: '' },
  { crime: 'Reckless Endangerment', months: 15, fine: 600, class: '' },
  { crime: 'Destruction of Property', months: 15, fine: 650, class: '' },
  { crime: 'Providing False Information', months: 10, fine: 750, class: '' },
  { crime: 'Harassment', months: 15, fine: 750, class: '' },
  { crime: 'Disregarding a Lawful Order/Town Ordinance', months: 15, fine: 750, class: '' },
  { crime: 'Negligent Discharge of a Firearm', months: 15, fine: 650, class: '' },
  { crime: 'Cruelty to Domesticated Animals', months: 10, fine: 600, class: '' },
  { crime: 'Conspiracy to Commit Any Act of Crime', months: 15, fine: 800, class: '' },
  { crime: 'Disorderly Conduct', months: 10, fine: 650, class: '' },
  { crime: 'Disturbing the Peace', months: 10, fine: 650, class: '' },
  { crime: 'Trespassing', months: 10, fine: 600, class: '' },
  { crime: 'Improper Commercial Sales', months: 10, fine: 600, class: '' },
  { crime: 'Illegal Panning/Mining', months: 15, fine: 600, class: '' },
  { crime: 'Loitering/Obstruction of Traffic', months: 10, fine: 600, class: '' }
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
          class: data.class || '',
          code: this.getPenalCodeNumber(data.crime)
        });
      }
    });
    
    console.log(`Loaded ${this.penalCodes.size} penal codes`);
  }

  getPenalCodeNumber(crime) {
    // Assign penal code numbers based on crime severity and type
    const codeMap = {
      'capital murder': 'PC-001',
      'murder': 'PC-002', 
      'attempted capital murder': 'PC-003',
      'attempted murder': 'PC-004',
      'aggravated assault': 'PC-005',
      'torture': 'PC-006',
      'serial crime': 'PC-007',
      'kidnapping of a government official': 'PC-008',
      'kidnapping': 'PC-009',
      'major armed robbery': 'PC-010',
      'armed robbery': 'PC-011',
      'unarmed robbery': 'PC-012',
      'arson': 'PC-013',
      'terrorism': 'PC-014',
      'riot': 'PC-015',
      'government corruption': 'PC-016',
      'extortion': 'PC-017',
      'bribery to a government official': 'PC-018',
      'vigilantism': 'PC-019',
      'escaping from custody': 'PC-020',
      'intent/distribution of illegal contraband': 'PC-021',
      'possession of illegal contraband': 'PC-022',
      'manufacture of contraband': 'PC-023',
      'unarmed assault': 'PC-024',
      'evading or resisting arrest': 'PC-025',
      'aiding and abetting': 'PC-026',
      'obstruction of justice': 'PC-027',
      'false impersonation': 'PC-028',
      'reckless endangerment': 'PC-029',
      'destruction of property': 'PC-030',
      'providing false information': 'PC-031',
      'harassment': 'PC-032',
      'disregarding a lawful order/town ordinance': 'PC-033',
      'negligent discharge of a firearm': 'PC-034',
      'cruelty to domesticated animals': 'PC-035',
      'conspiracy to commit any act of crime': 'PC-036',
      'disorderly conduct': 'PC-037',
      'disturbing the peace': 'PC-038',
      'trespassing': 'PC-039',
      'improper commercial sales': 'PC-040',
      'illegal panning/mining': 'PC-041',
      'loitering/obstruction of traffic': 'PC-042'
    };
    
    return codeMap[crime.toLowerCase()] || 'PC-XXX';
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
      
      'kidnap': 'kidnapping',
      // Kidnapping variations
      'kidnap law': 'kidnapping of a government official',
      'kidnap gov': 'kidnapping of a government official',
      'kidnap cop': 'kidnapping of a government official',
      'kidnap officer': 'kidnapping of a government official',
      'kidnap official': 'kidnapping of a government official',
      'kidnap government': 'kidnapping of a government official',
      
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
      'drug dealing': 'intent/distribution of illegal contraband',
      'drug deal': 'intent/distribution of illegal contraband',
      'selling drugs': 'intent/distribution of illegal contraband',
      'sell drugs': 'intent/distribution of illegal contraband',
      'sell drug': 'intent/distribution of illegal contraband',
      'selling drug': 'intent/distribution of illegal contraband',
      'distribute drugs': 'intent/distribution of illegal contraband',
      'selling cocaine': 'intent/distribution of illegal contraband',
      'selling meth': 'intent/distribution of illegal contraband',
      'selling heroin': 'intent/distribution of illegal contraband',
      'selling weed': 'intent/distribution of illegal contraband',
      'selling opioids': 'intent/distribution of illegal contraband',
      'selling ketamine': 'intent/distribution of illegal contraband',
      'selling moonshine': 'intent/distribution of illegal contraband',
      'selling k': 'intent/distribution of illegal contraband',
      'carry drugs': 'possession of illegal contraband',
      'carry cocaine': 'possession of illegal contraband',
      'carry meth': 'possession of illegal contraband',
      'carry heroin': 'possession of illegal contraband',
      'carry weed': 'possession of illegal contraband',
      'carry opioids': 'possession of illegal contraband',
      'carry ketamine': 'possession of illegal contraband',
      'carry moonshine': 'possession of illegal contraband',
      'carry k': 'possession of illegal contraband',
      'carrying drugs': 'possession of illegal contraband',
      'carrying cocaine': 'possession of illegal contraband',
      'carrying meth': 'possession of illegal contraband',
      'carrying heroin': 'possession of illegal contraband',
      'carrying weed': 'possession of illegal contraband',
      'carrying opioids': 'possession of illegal contraband',
      'carrying ketamine': 'possession of illegal contraband',
      'carrying moonshine': 'possession of illegal contraband',
      'carrying k': 'possession of illegal contraband',
      'drug possession': 'possession of illegal contraband',
      'possess drugs': 'possession of illegal contraband',
      'drug manufacture': 'manufacture of contraband',
      'making drugs': 'manufacture of contraband',
      
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
        class: penalData.class || 'N/A',
        code: penalData.code || 'PC-XXX',
        description: `**Penal Code:** ${penalData.code || 'PC-XXX'}\n**Sentence:** ${months} months\n**Fine:** ${fine}\n**Class:** ${penalData.class || 'N/A'}`
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
