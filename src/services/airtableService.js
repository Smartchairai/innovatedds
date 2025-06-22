// airtableService.js - Fixed version using Product Name field from Airtable
export const fetchProducts = async () => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.REACT_APP_AIRTABLE_BASE_ID}/${process.env.REACT_APP_AIRTABLE_TABLE_NAME}?view=Grid%20view`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from Airtable');
    }

    const data = await response.json();
    
    // Log first record to check field names
    if (data.records.length > 0) {
      console.log('Available fields:', Object.keys(data.records[0].fields));
      console.log('Sample record:', data.records[0].fields);
    }
    
    // Filter and map records
    return data.records
      .filter(record => {
        // Include records that have a product name
        // Check for different possible field names (Airtable field names are case-sensitive)
        const productName = record.fields['Product Name'] || 
                           record.fields['ProductName'] || 
                           record.fields['Product name'] ||
                           record.fields['product name'] ||
                           record.fields.Name ||
                           record.fields.name;
        return productName; // Only include if we have a name
      })
      .map(record => {
        // Get the product name from Airtable (check various possible field names)
        const productName = record.fields['Product Name'] || 
                           record.fields['ProductName'] || 
                           record.fields['Product name'] ||
                           record.fields['product name'] ||
                           record.fields.Name ||
                           record.fields.name ||
                           'Unknown Product';
        
        // Get manufacturer - might be same as product name or a separate field
        const manufacturer = record.fields.Manufacturer || 
                           record.fields.Company ||
                           record.fields['Company Name'] ||
                           productName; // Fallback to product name if no manufacturer field
        
        return {
          id: record.id,
          name: productName, // Use the actual product name from Airtable
          manufacturer: manufacturer,
          category: record.fields.Category || 'Dental Technology',
          basicDescription: record.fields.Description || 
                           record.fields['Basic Description'] || 
                           `Professional dental solutions from ${manufacturer}`,
          detailedDescription: record.fields['Detailed Description'] || 
                              record.fields['Full Description'] ||
                              record.fields.Description || 
                              `${productName} by ${manufacturer} provides innovative dental technology and services to enhance patient care and practice efficiency.`,
          website: record.fields.Website || '',
          email: record.fields.Email || '',
          phone: record.fields.Phone || '',
          address: record.fields.Address || '',
          rating: record.fields.Rating || null,
          logo: record.fields.Logo?.[0]?.url || null,
          image: record.fields.Image?.[0]?.url || 
                 record.fields.Photo?.[0]?.url ||
                 'https://via.placeholder.com/400x320?text=' + encodeURIComponent(productName)
        };
      });
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.REACT_APP_AIRTABLE_BASE_ID}/${process.env.REACT_APP_AIRTABLE_TABLE_NAME}?view=Grid%20view`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch categories from Airtable');
    }

    const data = await response.json();
    
    // Extract unique categories
    const categories = new Set(['all']);
    
    data.records.forEach(record => {
      if (record.fields.Category) {
        categories.add(record.fields.Category);
      }
    });
    
    // If we only have 'all', add some default categories
    if (categories.size === 1) {
      const defaultCategories = [
        'Practice Management',
        'Clinical Software', 
        'Imaging & Diagnostics',
        'Patient Communication',
        'Billing & Insurance',
        'Marketing & Analytics',
        'Supplies & Equipment',
        'Laboratory Services'
      ];
      defaultCategories.forEach(cat => categories.add(cat));
    }
    
    return Array.from(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['all'];
  }
};