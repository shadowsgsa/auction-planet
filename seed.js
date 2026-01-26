const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Category = require('./models/Category');

dotenv.config();

const categories = [
  {
    name: 'Electronics',
    description: 'Computers, phones, cameras, and electronic devices',
    icon: '💻'
  },
  {
    name: 'Vehicles',
    description: 'Cars, motorcycles, boats, and other vehicles',
    icon: '🚗'
  },
  {
    name: 'Art & Collectibles',
    description: 'Paintings, sculptures, antiques, and collectible items',
    icon: '🎨'
  },
  {
    name: 'Jewelry & Watches',
    description: 'Fine jewelry, luxury watches, and accessories',
    icon: '💎'
  },
  {
    name: 'Home & Garden',
    description: 'Furniture, appliances, and garden equipment',
    icon: '🏠'
  },
  {
    name: 'Fashion',
    description: 'Clothing, shoes, bags, and fashion accessories',
    icon: '👗'
  },
  {
    name: 'Sports & Outdoors',
    description: 'Sports equipment, outdoor gear, and fitness items',
    icon: '⚽'
  },
  {
    name: 'Books & Media',
    description: 'Books, music, movies, and games',
    icon: '📚'
  },
  {
    name: 'Toys & Hobbies',
    description: 'Toys, games, and hobby supplies',
    icon: '🎮'
  },
  {
    name: 'Other',
    description: 'Miscellaneous items',
    icon: '📦'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auction-planet', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB Connected');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    await Category.insertMany(categories);
    console.log('Categories seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

