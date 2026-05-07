// Script to fetch accurate coordinates for Sangli district talukas using Nominatim API
// Nominatim is OpenStreetMap's FREE geocoding service - NO API key required!

const talukas = {
  'आटपाडी': 'Atpadi',
  'जत': 'Jat',
  'खानापूर': 'Khanapur',
  'कडेगाव': 'Kadegaon',
  'तासगाव': 'Tasgaon',
  'कवठेमहांकाळ': 'Kavathemahankal',
  'वाळवा': 'Walwa',
  'पलूस': 'Palus',
  'मिरज': 'Miraj',
  'सांगली': 'Sangli'
};

async function fetchCoordinates() {
  const results = {};
  const errors = [];
  
  console.log('🗺️  Fetching coordinates using Nominatim (OpenStreetMap) - FREE, no API key needed!');
  console.log('📍 Sangli District, Maharashtra, India');
  console.log('⏱️  This will take ~10 seconds (respecting rate limits)...\n');
  
  for (const [devanagari, english] of Object.entries(talukas)) {
    const query = `${english}, Sangli District, Maharashtra, India`;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
        {
          headers: {
            'User-Agent': 'Wildlife-Call-Management-Dashboard/1.0 (Educational Project)'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        // Validate coordinates are in reasonable range for Sangli district
        if (lat >= 16.5 && lat <= 17.6 && lon >= 73.7 && lon <= 75.4) {
          results[devanagari] = { lat, lon };
          console.log(`✅ ${devanagari.padEnd(12)} (${english.padEnd(15)}) → ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        } else {
          errors.push(`${devanagari} (${english}): Coordinates out of expected range`);
          console.log(`⚠️  ${devanagari.padEnd(12)} (${english.padEnd(15)}) → Out of range: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        }
      } else {
        errors.push(`${devanagari} (${english}): Not found`);
        console.log(`❌ ${devanagari.padEnd(12)} (${english.padEnd(15)}) → Not found`);
      }
      
      // Wait 1 second between requests to respect Nominatim's usage policy
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      errors.push(`${devanagari} (${english}): ${error.message}`);
      console.error(`❌ ${devanagari.padEnd(12)} (${english.padEnd(15)}) → Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total talukas: ${Object.keys(talukas).length}`);
  console.log(`Successfully fetched: ${Object.keys(results).length}`);
  console.log(`Failed: ${errors.length}`);
  
  if (errors.length > 0) {
    console.log('\n⚠️  ERRORS:');
    errors.forEach(err => console.log(`   - ${err}`));
  }
  
  if (Object.keys(results).length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log('📝 TYPESCRIPT COORDINATES OBJECT');
    console.log('='.repeat(80));
    console.log('Copy this into src/components/charts/geographical-map.tsx:\n');
    
    console.log('const TALUKA_COORDINATES: Record<string, { lat: number; lon: number }> = {');
    for (const [devanagari, coords] of Object.entries(results)) {
      const english = talukas[devanagari];
      console.log(`  '${devanagari}': { lat: ${coords.lat.toFixed(4)}, lon: ${coords.lon.toFixed(4)} }, // ${english}`);
    }
    console.log('};');
    
    console.log('\n' + '='.repeat(80));
    console.log('✨ NEXT STEPS');
    console.log('='.repeat(80));
    console.log('1. ✅ Copy the coordinates object above');
    console.log('2. 📄 Create/open src/components/charts/geographical-map.tsx');
    console.log('3. 📋 Paste the coordinates at the top of the component');
    console.log('4. 🚀 Continue with Phase 2 of implementation');
    console.log('='.repeat(80) + '\n');
  }
}

fetchCoordinates();
