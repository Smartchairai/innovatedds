import axios from 'axios';

// Replace these with your actual values
const AIRTABLE_BASE_ID = 'appzLtE8ZoHJz6ptu'; // Example: appzLtE8ZoHJz6ptu
const AIRTABLE_TABLE_NAME = 'Table 1';
const AIRTABLE_TOKEN = 'patHq4WdU3mWAtK86.16cab2d88bf1a71f402518a6eb61be50e9cf8bbe9f3cd2bc20712ec1f639675a'; // Example: patGoh5R... (no quotes around Bearer)

const airtableApi = axios.create({
  baseURL: `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
  headers: {
    Authorization: `Bearer ${AIRTABLE_TOKEN}`,
  },
});

export const fetchProducts = async () => {
  try {
    const response = await airtableApi.get();
    return response.data.records.map((record) => ({
      id: record.id,
      ...record.fields,
    }));
  } catch (error) {
    console.error('Error fetching Airtable records:', error.response?.data || error.message);
    return [];
  }
};
