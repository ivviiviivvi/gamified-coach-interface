const ACTION_VERBS = [
  'build',
  'create',
  'launch',
  'plan',
  'design',
  'implement',
  'optimize',
  'deploy',
  'analyze',
  'execute',
  'ship',
  'draft',
  'validate',
  'test',
  'map',
  'prioritize',
  'schedule',
  'deliver',
];

const REQUIRED_FIELDS = {
  hero_class: ['painPoints', 'aspirations'],
  loot_table: ['freeRelic', 'potion', 'coreQuest', 'raid'],
  propaganda: ['originMyth', 'coreValues'],
  threat_analysis: ['competitors', 'differentiationStrategy'],
  mission_logs: ['mainQuests', 'metrics'],
  guild_charter: ['missionStatement', 'communityRules'],
  scriptorium: ['contentPiece', 'callToAction'],
};

function collectStrings(payload) {
  if (payload === null || payload === undefined) return [];
  if (typeof payload === 'string') return [payload];
  if (Array.isArray(payload)) return payload.flatMap(item => collectStrings(item));
  if (typeof payload === 'object') {
    return Object.values(payload).flatMap(value => collectStrings(value));
  }
  return [];
}

function hasActionVerbs(strings) {
  return strings.some(str => ACTION_VERBS.some(verb => str.toLowerCase().includes(verb)));
}

function hasListData(payload) {
  if (Array.isArray(payload)) return payload.length > 0;
  if (typeof payload === 'object' && payload !== null) {
    return Object.values(payload).some(value => hasListData(value));
  }
  return false;
}

function missingRequiredFields(terminalType, payload) {
  const requiredKeys = REQUIRED_FIELDS[terminalType] || [];
  if (requiredKeys.length === 0 || typeof payload !== 'object' || payload === null) {
    return [];
  }

  return requiredKeys.filter(key => !(key in payload));
}

function validateStrategyResponse(terminalType, aiResponse) {
  const issues = [];

  if (!aiResponse || typeof aiResponse !== 'object') {
    issues.push('AI response missing or not structured');
    return { isValid: false, issues };
  }

  const flatStrings = collectStrings(aiResponse);
  if (flatStrings.length === 0) {
    issues.push('AI response contains no actionable text');
  }

  if (!hasActionVerbs(flatStrings)) {
    issues.push('AI response missing action-oriented language');
  }

  if (!hasListData(aiResponse)) {
    issues.push('AI response missing lists or bullet-like data');
  }

  const missingKeys = missingRequiredFields(terminalType, aiResponse);
  if (missingKeys.length > 0) {
    issues.push(`Missing required fields: ${missingKeys.join(', ')}`);
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
}

module.exports = {
  validateStrategyResponse,
};
