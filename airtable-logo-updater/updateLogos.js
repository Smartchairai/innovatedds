const Airtable = require('airtable');
const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

const extractDomain = (url) => {
  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

const uploadToImgbb = async (imageBuffer, imageName = 'logo') => {
  const base64Image = imageBuffer.toString('base64');
  const formData = new FormData();
  formData.append('key', process.env.IMGBB_API_KEY);
  formData.append('image', base64Image);
  formData.append('name', imageName);

  const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
    headers: formData.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });

  return response.data.data.url;
};

const updateMissingLogos = async () => {
  console.log('🚀 Starting logo update process...\n');

  try {
    const records = await base(TABLE_NAME).select({ view: 'Grid view' }).all();
    console.log(`📊 Found ${records.length} total records\n`);

    let processedCount = 0;
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      const website = record.fields.Website;
      const hasLogo = record.fields.Logo?.length > 0;

      if (!website) {
        skippedCount++;
        continue;
      }

      if (hasLogo) {
        skippedCount++;
        continue;
      }

      processedCount++;
      const domain = extractDomain(website);
      const logoUrl = `https://logo.clearbit.com/${domain}`;

      try {
        console.log(`[${processedCount}] Processing: ${domain}`);
        
        // Fetch logo from Clearbit
        const response = await axios.get(logoUrl, { 
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        // Verify it's an image
        const contentType = response.headers['content-type'];
        if (!contentType || !contentType.includes('image')) {
          throw new Error('Response is not an image');
        }

        // Upload to ImgBB
        const imgbbUrl = await uploadToImgbb(response.data, domain);
        console.log(`    ✅ Uploaded to ImgBB`);

        // Update Airtable
        await base(TABLE_NAME).update(record.id, {
          Logo: [{ url: imgbbUrl }]
        });

        console.log(`    ✅ Updated Airtable\n`);
        successCount++;
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
        
      } catch (err) {
        console.error(`    ❌ Error: ${err.message}\n`);
        errorCount++;
        
        // If it's a 404, the logo doesn't exist
        if (err.response?.status === 404) {
          console.log(`    ℹ️  No logo available for this domain\n`);
        }
        
        // If rate limited, wait longer
        if (err.response?.status === 429 || err.statusCode === 429) {
          console.log('    ⏳ Rate limited. Waiting 5 seconds...\n');
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }

    console.log('\n🎉 Logo update process complete!');
    console.log(`   📊 Total records: ${records.length}`);
    console.log(`   ⏩ Skipped (has logo or no website): ${skippedCount}`);
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
};

// Run the update process
updateMissingLogos();