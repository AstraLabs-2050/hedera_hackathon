require('dotenv').config();
const axios = require('axios');

const API_BASE_URL = process.env.API_URL || 'https://render-backend-drm4.onrender.com';

// Collections that need status update (from your test output)
const collectionsToUpdate = [
  'de0a4b27-5723-46b9-8fa7-19622ec9744a',
  '0d0e8287-71db-4879-b17d-2b79805650c3',
  '749f876d-9dba-40e3-8ee7-6f34b4c04e8e',
  '7e3d59ba-9908-4977-b2d7-850713ec57d2',
  '5b09e024-92b8-4efe-9f38-2c635c8b6660',
  '3ec78145-de0e-4632-99ee-f8daa01096c0',
  '0e271873-6edb-49bd-81f5-5d499706cdf7',
  'eb353dac-3e2b-49ee-937e-7191c9c04855',
  '9696bd57-443b-4c09-bf76-d225c2f2525b',
  '07be7b17-5ebb-4927-8fd5-8e6da76c0dc3',
  '0b33d57c-e3db-437a-abab-a50990650e2d'
];

async function updateCollectionStatus(collectionId: string, token: string) {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/design/update-collection-status`,
      {
        collectionId,
        status: true // Set status to published
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(`✅ Updated collection ${collectionId}:`, response.data.message);
    return response.data;
  } catch (error: any) {
    console.error(`❌ Error updating collection ${collectionId}:`, error.response?.data?.message || error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  try {
    // Get token from environment variable or prompt
    const token = process.env.AUTH_TOKEN;
    if (!token) {
      console.error('❌ Error: AUTH_TOKEN environment variable is required');
      console.log('\nPlease set your auth token as follows:');
      console.log('1. Get your auth token from the successful test output');
      console.log('2. Run: export AUTH_TOKEN=your_token_here');
      console.log('3. Run: npm run update-collections-status\n');
      return;
    }

    console.log('🚀 Starting to update collection statuses...');
    
    // Update each collection
    for (const collectionId of collectionsToUpdate) {
      console.log(`\n🔄 Updating collection: ${collectionId}`);
      await updateCollectionStatus(collectionId, token);
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log('\n🎉 All collections have been updated!');
  } catch (error: any) {
    console.error('❌ Error in main process:', error.message);
  }
}

// Run the script
main();
