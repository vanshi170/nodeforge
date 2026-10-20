/**
 * NodeForge - Greeting Utility Module
 * Demonstrates CommonJS export and function encapsulation
 */

function createGreeting(name = 'Developer', role = 'Student') {
  const cleanName = String(name).trim() || 'Developer';
  const cleanRole = String(role).trim() || 'Student';
  return `Welcome to NodeForge, ${cleanName}! Excited to explore Node.js as a ${cleanRole}.`;
}

function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
}

function getModuleInfo() {
  return {
    moduleName: 'utils/greeting.js',
    format: 'CommonJS (require / module.exports)',
    exportedFunctions: ['createGreeting', 'getTimeBasedGreeting', 'getModuleInfo']
  };
}

module.exports = {
  createGreeting,
  getTimeBasedGreeting,
  getModuleInfo
};
