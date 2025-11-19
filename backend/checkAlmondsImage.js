const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function checkAlmondsImage() {
  try {
  console.log('🔍 Connecting to MongoDB...');
  await mongoose.connect('mongodb://localhost:27017/smart-retail-recommendations');

    console.log('🔍 Looking for Almonds product...');
    const almondsProduct = await Product.findOne({ name: "Almonds 500g" });
    
    if (almondsProduct) {
      console.log('✅ Found Almonds product:');
      console.log('Name:', almondsProduct.name);
      console.log('Current images:', almondsProduct.images);
      console.log('Brand:', almondsProduct.brand);
      console.log('Category:', almondsProduct.category);
    } else {
      console.log('❌ Almonds product not found!');
      
      // Let's see what products we have
      const allProducts = await Product.find({ businessType: 'grocery' });
      console.log('\n📋 Available grocery products:');
      allProducts.forEach(product => {
        console.log(`- ${product.name} (Brand: ${product.brand})`);
      });
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAlmondsImage();