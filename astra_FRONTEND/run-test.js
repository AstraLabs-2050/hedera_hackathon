// This is a simple JavaScript wrapper to run our TypeScript test
require('ts-node').register({
  project: './tsconfig.ts-node.json',
  transpileOnly: true
});

// Import the test function
const { testCollectionStatusUpdate } = require('./src/__tests__/collectionStatus.test');

// Get the collection ID from command line arguments
const collectionId = process.argv[2];

if (!collectionId) {
  console.error('❌ Error: Please provide a collection ID');
  console.log('Usage: node run-test.js <collectionId>');
  process.exit(1);
}

// Run the test
console.log('🚀 Starting test with collection ID:', collectionId);
testCollectionStatusUpdate(collectionId)
  .then(result => {
    console.log('✅ Test completed successfully');
    console.log('Result:', JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
