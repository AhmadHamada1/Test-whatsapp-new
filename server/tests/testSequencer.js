const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Define the order of test files
    const testOrder = [
      'health-api.test.js',
      'auth-api.test.js', 
      'admin-api.test.js',
      'api-keys-api.test.js',
      'middleware-api.test.js',
      'wa-service.test.js',
      'wa-controller.test.js',
      'wa-integration.test.js'
    ];

    const sortedTests = tests.sort((a, b) => {
      const aIndex = testOrder.findIndex(name => a.path.includes(name));
      const bIndex = testOrder.findIndex(name => b.path.includes(name));
      
      // If both tests are in the order array, sort by their position
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }
      
      // If only one test is in the order array, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      // If neither test is in the order array, maintain original order
      return 0;
    });

    return sortedTests;
  }
}

module.exports = CustomSequencer;
