const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function checkHorlicksName() {
  try {
  await mongoose.connect('mongodb://localhost:27017/smart-retail-recommendations');
    
    // Search for any product containing "Horlicks"
    const horlicksProducts = await Product.find({ 
      name: { $regex: /horlicks/i } 
    });
    
    console.log('🔍 Horlicks products found:');
    horlicksProducts.forEach(product => {
      console.log(`- Name: "${product.name}"`);
      console.log(`- Current images: ${product.images}`);
      console.log('---');
    });
    
    if (horlicksProducts.length === 0) {
      console.log('❌ No Horlicks products found');
      
      // Let's see all products with "health" in name
      const healthProducts = await Product.find({ 
        name: { $regex: /health|drink/i } 
      });
      console.log('\n🔍 Health/Drink products:');
      healthProducts.forEach(product => {
        console.log(`- "${product.name}"`);
      });
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkHorlicksName();