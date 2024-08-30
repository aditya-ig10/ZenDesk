require('dotenv').config(); 
const Web3 = require('web3');
const mongoose = require('mongoose');
const contractABI = require('./UserProfileABI.js');

// Connect to MongoDB using the environment variable
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Create a MongoDB schema for user profiles
const ProfileSchema = new mongoose.Schema({
    address: String,
    name: String,
    email: String,
    phone: String,
    about: String,
    profileImage: String
});

const Profile = mongoose.model('Profile', ProfileSchema);

// Connect to Ethereum network using the environment variable
const web3 = new Web3(process.env.ALCHEMY_API_URL);

// Contract address from environment variable
const contractAddress = process.env.NEXT_PUBLIC_USERAUTH_CONTRACT_ADDRESS;

// Create contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Function to verify if the profile was saved
async function verifyProfileSaved(address) {
    try {
        const savedProfile = await Profile.findOne({ address: address });
        if (savedProfile) {
            console.log('Profile successfully saved:', savedProfile);
            return true;
        } else {
            console.log('Profile not found in database');
            return false;
        }
    } catch (error) {
        console.error('Error verifying profile:', error);
        return false;
    }
}

// Listen for ProfileSet events
contract.events.ProfileSet({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    const { user, name, email, phone, about, profileImage } = event.returnValues;

    try {
        // Update or create profile in MongoDB
        await Profile.findOneAndUpdate(
            { address: user },
            { name, email, phone, about, profileImage },
            { upsert: true, new: true }
        );

        console.log(`Profile update attempted for user: ${user}`);

        // Verify if the profile was saved
        const isSaved = await verifyProfileSaved(user);
        if (isSaved) {
            console.log(`Profile verified and saved successfully for user: ${user}`);
        } else {
            console.log(`Failed to verify profile save for user: ${user}`);
        }
    } catch (error) {
        console.error('Error saving profile:', error);
    }
})
.on('error', console.error);

console.log('Listening for ProfileSet events...');