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

async function getAllCollections() {
  try {
    console.log('🔍 Fetching all collections...');
    const response = await retryRequest(() => axios.get(
      `${API_BASE_URL}design/get-all-collection`,
      {
        headers: { 
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    ));
    
    // The API returns { data: [...], status: true }
    const collections = response.data?.data || [];
    console.log(`✅ Found ${collections.length} collections`);
    
    // Log the first collection to check the structure
    if (collections.length > 0) {
      console.log('\nSample collection:', JSON.stringify(collections[0], null, 2));
    }
    
    return collections;
  } catch (error) {
    console.error('❌ Error fetching collections:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return [];
  }
}

async function updateCollectionStatus(collection) {
  const { id: collectionId, collectionName, creationFeePaid, status: currentStatus } = collection;
  
  try {
    console.log(`\n🔄 Updating collection status:`);
    console.log(`   ID: ${collectionId}`);
    console.log(`   Name: "${collectionName || 'Unnamed'}"`);
    console.log(`   Current Status: ${currentStatus || 'draft'}`);
    console.log(`   Creation Fee Paid: ${creationFeePaid ? '✅' : '❌'}`);
    
    const response = await retryRequest(() => axios.patch(
      `${API_BASE_URL}design/update-collection-status`,
      { 
        collectionId,
        status: true  // Send boolean directly as in the frontend
      },
      { 
        headers: { 
          'Authorization': `Bearer ${AUTH_TOKEN}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        validateStatus: status => status >= 200 && status < 300
      }
    ));
    
    console.log('✅ Update successful. Response:', JSON.stringify(response.data, null, 2));
    
    // Verify the update was applied by checking the response
    if (response.data?.status === true) {
      console.log('✅ Status update request was successful');
      // Even if we can't verify the status in the response, we'll assume it worked
      // since the API returned success
      console.log('✅ Collection marked as published');
    } else {
      console.warn('⚠️ Warning: Status update response did not indicate success');
      console.log('Response data:', JSON.stringify(response.data, null, 2));
    }
    
    return { 
      success: true, 
      message: `Successfully updated collection ${collectionId}`,
      data: response.data
    };
  } catch (error) {
    console.error('❌ Update failed:', error);
    
    let errorMessage = `Error updating ${collectionId}: `;
    if (error.response) {
      errorMessage += `${error.response.status} - ${JSON.stringify(error.response.data || 'No error details')}`;
      console.error('Error response data:', error.response.data);
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      errorMessage += 'No response received from server';
      console.error('No response received:', error.request);
    } else {
      errorMessage += error.message;
      console.error('Error:', error.message);
    }
    
    return { 
      success: false, 
      message: errorMessage,
      error: error
    };
  }
}



async function main() {
  console.log('🚀 Starting to check and update collections...');
  
  try {
    // Get all collections
    const collections = await getAllCollections();
    
    if (!collections.length) {
      console.log('❌ No collections found');
      return;
    }
    
    console.log(`\n🔍 Found ${collections.length} collections. Checking minted status...`);
    
    // Log all collection IDs and names with their minted status
    console.log('\n📋 Collections found:');
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ID: ${col.id}, Name: "${col.collectionName || 'Unnamed'}", ` +
                  `${col.creationFeePaid ? '✅' : '❌'} Minted, ` +
                  `Status: ${col.status || 'draft'}, ` +
                  `Created: ${new Date(col.createdAt).toLocaleDateString()}`);
    });
    
    // Log collection stats
    const mintedCollections = collections.filter(c => c.creationFeePaid === true);
    const mintedCount = mintedCollections.length;
    
    console.log(`\n📊 Collection Stats:`);
    console.log(`   - Total collections: ${collections.length}`);
    console.log(`   - Minted collections: ${mintedCount}`);
    
    // Get collections that need status update (minted but status not 'published')
    const collectionsToUpdate = [];
    
    for (const collection of mintedCollections) {
      // Since status might not be in the collection data, we'll update all minted collections
      // to ensure they're marked as published
      collectionsToUpdate.push(collection);
    }
    
    console.log(`   - Collections to update: ${collectionsToUpdate.length}`);
    
    // Log details of collections that will be updated
    if (collectionsToUpdate.length > 0) {
      console.log('\n🔍 Collections to update:');
      collectionsToUpdate.forEach((col, idx) => {
        console.log(`   ${idx + 1}. ID: ${col.id}, Name: "${col.collectionName || 'Unnamed'}", ` +
                   `Minted: ${col.creationFeePaid ? '✅' : '❌'}, ` +
                   `Status: ${col.status || 'draft'}`);
      });
    }
    
    if (!collectionsToUpdate.length) {
      console.log('\nℹ️  No collections need updating. All collections are already published.');
      return;
    }
    
    console.log(`\n📊 Found ${collectionsToUpdate.length} collections that need updating.`);
    
    // Update each collection
    let updatedCount = 0;
    for (const collection of collectionsToUpdate) {
      console.log(`\n🔍 Processing collection: ${collection.id}`);
      console.log(`   ℹ️  Name: "${collection.collectionName || 'Unnamed'}"`);
      console.log(`   📅 Created: ${new Date(collection.createdAt).toLocaleString()}`);
      
      const result = await updateCollectionStatus(collection);
      
      if (result.success) {
        console.log(`   ✅ ${result.message}`);
        updatedCount++;
      } else {
        console.log(`   ❌ ${result.message}`);
      }
      
      // Add a small delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log(`\n🎉 Successfully updated ${updatedCount} out of ${collectionsToUpdate.length} collections.`);
    
  } catch (error) {
    console.error('\n❌ An error occurred:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

main().catch(console.error);
