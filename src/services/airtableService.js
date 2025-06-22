// airtableService.js - Fixed version that filters out unknown companies
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
    }
    
    // Extract domain name from website URL for company name
    const extractCompanyName = (url) => {
      if (!url) return null; // Return null instead of 'Unknown Company'
      try {
        const hostname = new URL(url).hostname;
        // Remove www. and .com/.io etc
        const name = hostname
          .replace(/^www\./, '')
          .replace(/\.(com|io|co|net|org|ai|app|dev).*$/, '')
          .split(/[.-]/)
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return name || null;
      } catch {
        return null;
      }
    };
    
    // Filter and map records
    return data.records
      .filter(record => {
        // Only include records that have a website AND a valid company name can be extracted
        const website = record.fields.Website;
        const companyName = extractCompanyName(website);
        return website && companyName;
      })
      .map(record => {
        const website = record.fields.Website || '';
        const companyName = extractCompanyName(website);
        
        return {
          id: record.id,
          name: companyName,
          manufacturer: companyName,
          category: record.fields.Category || 'Dental Technology',
          basicDescription: `Professional dental solutions from ${companyName}`,
          detailedDescription: `${companyName} provides innovative dental technology and services to enhance patient care and practice efficiency.`,
          website: website,
          email: record.fields.Email || '',
          phone: record.fields.Phone || '',
          address: record.fields.Address || '',
          rating: record.fields.Rating || null,
          logo: record.fields.Logo?.[0]?.url || null,
          image: 'https://via.placeholder.com/400x320?text=' + encodeURIComponent(companyName)
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
    
    // Extract unique categories or use defaults
    const categories = new Set(['all']);
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
    
    data.records.forEach(record => {
      if (record.fields.Category) {
        categories.add(record.fields.Category);
      }
    });
    
    // If no categories found, use defaults
    if (categories.size === 1) {
      defaultCategories.forEach(cat => categories.add(cat));
    }
    
    return Array.from(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['all'];
  }
};