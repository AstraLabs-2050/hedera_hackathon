const axios = require('axios');

const API_BASE_URL = 'https://render-backend-drm4.onrender.com/';

// Add retry logic for network errors
async function retryRequest(func, maxRetries = 3, delay = 1000) {
  let retries = 0;
  while (retries < maxRetries) {
    try {
      return await func();
    } catch (error) {
      if (error.code === 'EAI_AGAIN' || error.code === 'ENOTFOUND') {
        console.log(`⚠️ Network error occurred. Retry ${retries + 1}/${maxRetries}...`);
        retries++;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('Max retries exceeded');
}
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMGRkYTY3ODMtMDhkZS00ZTg4LTk0ZTgtMTI5NmNkNjYxYTk4IiwiZW1haWwiOiJsYXdibGF6ZTRAZ21haWwuY29tIiwibGFuZ3VhZ2UiOm51bGwsIndhbGxldCI6bnVsbCwiY2l0eSI6ImxhZ29zIiwiY291bnRyeSI6Im5pZ2VyaWEiLCJ2ZXJpZmllZCI6dHJ1ZSwiYWN0aXZlIjpmYWxzZSwibGFzdHNlZW4iOm51bGwsIm90cCI6IjI4M2QiLCJpc090cFZlcmlmaWVkIjpmYWxzZSwib3RwQ3JlYXRlZEF0IjoiMjAyNS0wMS0wM1QxMjo0Njo1NC40MzBaIiwiaXNPdHBFeHAiOnRydWUsImlzQWRtaW4iOmZhbHNlLCJ1c2VyVHlwZSI6bnVsbCwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yOFQxMzoxNDo1My4zNTdaIiwidXBkYXRlZEF0IjoiMjAyNS0wMS0wM1QxMjo0NzoxOS44NjZaIn0sImlhdCI6MTc0OTAzNzAwOCwiZXhwIjozNDk4Njc4ODE2fQ.x3RV4rB8v2KijMR4kOJj0ewylEnPrrbT4QQwEHaZrXg';

const collectionsToCheck = [
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

async function getCollectionDetails(collectionId) {
  try {
    const response = await retryRequest(() => axios.get(
      `${API_BASE_URL}/design/collection/${collectionId}`,
      {
        headers: { 
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      }
    ));
    return response.data.data;
  } catch (error) {
    console.error(`❌ Error fetching details for ${collectionId}:`, error.message);
    return null;
  }
}

async function updateCollectionStatus(collectionId) {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}/design/update-collection-status`,
      { collectionId, status: true },
      { 
        headers: { 
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return { success: true, message: response.data.message };
  } catch (error) {
    return { 
      success: false, 
      message: `Error updating ${collectionId}: ${error.response?.data?.message || error.message}`
    };
  }
}

async function main() {
  console.log('🚀 Starting to check and update collections...');
  let updatedCount = 0;
  let checkedCount = 0;
  
  for (const collectionId of collectionsToCheck) {
    checkedCount++;
    console.log(`\n🔍 Checking collection (${checkedCount}/${collectionsToCheck.length}): ${collectionId}`);
    
    try {
      // Get collection details
      const collection = await getCollectionDetails(collectionId);
      
      if (!collection) {
        console.log(`   ⚠️  Skipping - Could not fetch details`);
        continue;
      }
      
      console.log(`   ℹ️  Status: ${collection.status || 'draft'}, Minted: ${collection.isMinted || false}`);
      
      // Only update if collection is minted and not already published
      if (collection.isMinted && collection.status !== 'published') {
        console.log(`   🔄 Updating status to published...`);
        const result = await updateCollectionStatus(collectionId);
        
        if (result.success) {
          console.log(`   ✅ ${result.message}`);
          updatedCount++;
        } else {
          console.log(`   ❌ ${result.message}`);
        }
      } else {
        console.log(`   ℹ️  No update needed - ${collection.isMinted ? 'already published' : 'not minted'}`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error processing ${collectionId}:`, error.message);
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n🎉 Done! Updated ${updatedCount} out of ${collectionsToCheck.length} collections.`);
}

main().catch(console.error);
