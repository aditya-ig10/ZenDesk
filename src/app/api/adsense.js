import { NextResponse } from 'next/server';
   import { google } from 'googleapis';
   import { connectToDatabase } from '../../../utils/dbConnect';

   const oauth2Client = new google.auth.OAuth2(
     process.env.GOOGLE_CLIENT_ID,
     process.env.GOOGLE_CLIENT_SECRET,
     process.env.REDIRECT_URI
   );

   export async function GET(request) {
     const { searchParams } = new URL(request.url);
     const email = searchParams.get('email');

     if (!email) {
       return NextResponse.json({ error: 'Email is required' }, { status: 400 });
     }

     try {
       console.log('Fetching data for email:', email);
       const db = await connectToDatabase();
       const user = await db.collection('users').findOne({ email });

       if (!user) {
         console.log('User not found');
         return NextResponse.json({ error: 'User not found' }, { status: 404 });
       }

       console.log('User found:', user);

       if (!user.adsenseToken) {
         console.log('AdSense token not found');
         return NextResponse.json({ error: 'User not authenticated with AdSense' }, { status: 401 });
       }

       oauth2Client.setCredentials(user.adsenseToken);

       const adsense = google.adsense({ version: 'v2', auth: oauth2Client });

       const accounts = await adsense.accounts.list();
       console.log('AdSense accounts:', accounts.data);
       
       if (!accounts.data.accounts || accounts.data.accounts.length === 0) {
         console.log('No AdSense account found');
         return NextResponse.json({ error: 'No AdSense account found for this user' }, { status: 404 });
       }

       const accountId = accounts.data.accounts[0].name;

       const report = await adsense.accounts.reports.generate({
         account: accountId,
         dateRange: 'LAST_7_DAYS',
         metrics: ['IMPRESSIONS', 'CLICKS', 'EARNINGS'],
       });

       console.log('AdSense report:', report.data);

       return NextResponse.json(report.data);
     } catch (error) {
       console.error('AdSense API error:', error);
       return NextResponse.json({ 
         error: 'Internal Server Error', 
         message: error.message,
         stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
       }, { status: 500 });
     }
   }