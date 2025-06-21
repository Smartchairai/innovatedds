// src/services/airtableService.js
import axios from 'axios';

// Hard-coded values for testing
const AIRTABLE_API_KEY = 'patv2IuWH8fmbDxOc.ed73ac9ca795ec2063e8896ea6f886064e1e9ad71905368e5268c90ad5dae427';
const AIRTABLE_BASE_ID = 'appzLtE8ZoHJz6ptu';
const AIRTABLE_TABLE_NAME = 'tblNP0ogRI74esBwT';

// Airtable API endpoint
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Configure axios instance
const airtableApi = axios.create({
  baseURL: AIRTABLE_URL,
  headers: {
    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Get appropriate image based on category
const getImageByCategory = (category) => {
  const categoryImages = {
    'Back Office AI': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    'Claims & RCM': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop',
    'Credentialing': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
    'Dental Equipment': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
    'Dental Office Construction': 'https://images.unsplash.com/photo-1581922814484-4c2b14929110?w=400&h=300&fit=crop',
    'Dental Office Leasing': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop',
    'Front Office AI': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    'Practice Intelligence': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    'Practice Management Systems': 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=300&fit=crop',
    'Procurement Software': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
    'Radiographic AI': 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
    'Radiographic Capture': 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
    'Robotics': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop',
    'Supplies & Materials': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=300&fit=crop',
    'VoIP Systems': 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400&h=300&fit=crop'
  };
  
  return categoryImages[category] || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop';
};

// Transform Airtable record to our app format
const transformRecord = (record) => {
  const fields = record.fields;
  
  return {
    id: record.id,
    name: fields['Product Name'] || 'Unknown Company',
    category: fields['Category'] || 'Uncategorized',
    manufacturer: fields['Product Name'] || 'Unknown',
    basicDescription: `Professional ${fields['Category'] || 'dental'} solutions for dental practices`,
    detailedDescription: `${fields['Product Name'] || 'This company'} provides comprehensive ${fields['Category'] || 'dental'} solutions designed specifically for dental practices. Visit their website to learn more about their products and services.`,
    image: getImageByCategory(fields['Category']),
rating: null, // No rating data available    website: fields['Website'] || '',
    email: '',
    phone: '',
    address: '',
    status: fields['Approval status'] || 'Unknown',
    createdBy: fields['Created By'] || 'Unknown',
    showFullInfo: fields['Show Full Info'] || false
  };
};

// Fetch all products from Airtable
export const fetchProducts = async () => {
  try {
    console.log('Fetching products from Airtable...');
    console.log('API Key:', AIRTABLE_API_KEY ? 'Set' : 'Missing');
    console.log('Base ID:', AIRTABLE_BASE_ID || 'Missing');
    console.log('Table Name:', AIRTABLE_TABLE_NAME || 'Missing');
    console.log('Full URL:', AIRTABLE_URL);
    
    const response = await airtableApi.get('');
    
    console.log('Airtable response status:', response.status);
    console.log('Airtable response records:', response.data.records?.length || 0);
    
    if (response.data && response.data.records) {
      const products = response.data.records.map(transformRecord);
      console.log('Transformed products:', products.length, 'items');
      console.log('First product:', products[0]);
      return products;
    }
    
    console.warn('No records found in Airtable response');
    return [];
    
  } catch (error) {
    console.error('Error fetching products from Airtable:', error);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    
    throw error;
  }
};

// Get unique categories
export const getCategories = async () => {
  try {
    const response = await airtableApi.get('', {
      params: {
        fields: ['Category']
      }
    });
    
    if (response.data && response.data.records) {
      const categories = [...new Set(
        response.data.records
          .map(record => record.fields.Category)
          .filter(category => category)
      )].sort();
      
      return ['all', ...categories];
    }
    
    return ['all'];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['all'];
  }
};

const airtableService = {
  fetchProducts,
  getCategories
};

export default airtableService;