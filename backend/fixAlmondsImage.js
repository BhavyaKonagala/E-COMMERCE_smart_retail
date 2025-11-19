const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function fixAlmondsImageDirectly() {
  try {
    console.log('🔧 Connecting to MongoDB...');
  await mongoose.connect('mongodb://localhost:27017/smart-retail-recommendations');

    // Try a different reliable almond image
    const newAlmondImage = "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop&crop=center";
    
    console.log('🔧 Updating Almonds image directly...');
    const result = await Product.findOneAndUpdate(
      { name: "Almonds 500g" },
      { 
        $set: { 
          images: [
            newAlmondImage,
            "https://via.placeholder.com/400x400/DEB887/8B4513?text=Almonds+500g"
          ] 
        }
      },
      { new: true }
    );

    if (result) {
      console.log('✅ Successfully updated Almonds image!');
      console.log('New image URL:', result.images[0]);
      console.log('🔄 Please refresh your frontend and clear browser cache');
    } else {
      console.log('❌ Could not find Almonds product to update');
    }

    mongoose.disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixAlmondsImageDirectly();