import api from '../utils/api.class';
import axios from 'axios';

// Test function to check collection status update
async function testCollectionStatusUpdate(collectionId: string) {
  if (!collectionId) {
    console.error('❌ Error: No collection ID provided');
    console.log('Usage: npm run test:status -- <collectionId>');
    return { success: false, error: 'No collection ID provided' };
  }
  
  try {
    console.log('🚀 Starting collection status update test...');
    console.log(`📌 Collection ID: ${collectionId}`);
    
    // 0. First, authenticate
    console.log('\n🔐 Authenticating...');
    // WARNING: For testing only - don't commit real credentials to version control
    const credentials = {
      email: 'lawblaze4@gmail.com',  // Replace with actual email
      password: 'Daniel@12345'        // Replace with actual password
    };
    
    console.log(`Logging in as: ${credentials.email}`);
    const loginResponse = await api.login(credentials);
    console.log('✅ Login successful');
    console.log('🔍 Login response:', JSON.stringify(loginResponse, null, 2));
    
    // Manually set the auth token for subsequent requests
    const token = loginResponse?.token || loginResponse?.data?.token || loginResponse?.data?.data?.token;
    if (token) {
      console.log('🔑 Setting auth token for subsequent requests');
      // @ts-ignore
      api.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found in login response. Available keys:', Object.keys(loginResponse));
      if (loginResponse?.data) {
        console.log('🔍 Data keys:', Object.keys(loginResponse.data));
      }
    }
    
    // 1. Get current collections to verify the ID exists
    console.log('\n📋 Fetching collections...');
    const collections = await api.getCollection();
    console.log('✅ Collections data:');
    console.log(JSON.stringify(collections, null, 2));
    
    // 2. Update collection status
    console.log('\n🔄 Updating collection status to published (true)...');
    const updateResponse = await api.getCollectionStatus(collectionId, true);
    console.log('✅ Status update response:');
    console.log(JSON.stringify(updateResponse, null, 2));
    
    // 3. Get collections again to verify the update
    console.log('\n🔍 Verifying update...');
    const updatedCollections = await api.getCollection();
    console.log('✅ Updated collections data:');
    console.log(JSON.stringify(updatedCollections, null, 2));
    
    // 4. Log final status
    console.log('\n🎉 Test completed successfully!');
    console.log('----------------------------------');
    
    return {
      success: true,
      updateResponse,
      collectionsBefore: collections,
      collectionsAfter: updatedCollections
    };
  } catch (error) {
    console.error('❌ Test failed:');
    console.error(error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Export the test function for use in other files
export { testCollectionStatusUpdate };
