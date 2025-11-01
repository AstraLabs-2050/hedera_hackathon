const axios = require('axios');

const API_BASE_URL = 'https://render-backend-drm4.onrender.com';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiMGRkYTY3ODMtMDhkZS00ZTg4LTk0ZTgtMTI5NmNkNjYxYTk4IiwiZW1haWwiOiJsYXdibGF6ZTRAZ21haWwuY29tIiwibGFuZ3VhZ2UiOm51bGwsIndhbGxldCI6bnVsbCwiY2l0eSI6ImxhZ29zIiwiY291bnRyeSI6Im5pZ2VyaWEiLCJ2ZXJpZmllZCI6dHJ1ZSwiYWN0aXZlIjpmYWxzZSwibGFzdHNlZW4iOm51bGwsIm90cCI6IjI4M2QiLCJpc090cFZlcmlmaWVkIjpmYWxzZSwib3RwQ3JlYXRlZEF0IjoiMjAyNS0wMS0wM1QxMjo0Njo1NC40MzBaIiwiaXNPdHBFeHAiOnRydWUsImlzQWRtaW4iOmZhbHNlLCJ1c2VyVHlwZSI6bnVsbCwiY3JlYXRlZEF0IjoiMjAyNC0xMi0yOFQxMzoxNDo1My4zNTdaIiwidXBkYXRlZEF0IjoiMjAyNS0wMS0wM1QxMjo0NzoxOS44NjZaIn0sImlhdCI6MTc0OTAzNzAwOCwiZXhwIjozNDk4Njc4ODE2fQ.x3RV4rB8v2KijMR4kOJj0ewylEnPrrbT4QQwEHaZrXg'; // Replace with your actual token

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
    console.log(`✅ Updated ${collectionId}:`, response.data.message);
    return true;
  } catch (error) {
    console.error(`❌ Error updating ${collectionId}:`, error.response?.data?.message || error.message);
    return false;
  }
}

async function main() {
  if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
    console.error('❌ Error: Please replace YOUR_AUTH_TOKEN_HERE with your actual auth token');
    return;
  }

  console.log('🚀 Starting to update collections...');
  let success = 0;
  
  for (const id of collectionsToUpdate) {
    const result = await updateCollectionStatus(id);
    if (result) success++;
    await new Promise(resolve => setTimeout(resolve, 500)); // Rate limiting
  }
  
  console.log(`\n🎉 Done! Updated ${success}/${collectionsToUpdate.length} collections.`);
}

main().catch(console.error);
