export default async function handler(req, res) {
  try {
      const PLACE_ID = process.env.GOOGLE_PLACE_ID;
      const API_KEY = process.env.GOOGLE_API_KEY;
      const fields = "current_opening_hours,reviews,photos,rating,url,name,formatted_phone_number,formatted_address"
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${PLACE_ID}&fields=${fields}&key=${API_KEY}`;

      const response = await fetch(url);

      const data = await response.json();

      return res.status(200).json({...data,PLACE_ID,API_KEY,fields,url,PLACE_ID});
  } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch place details' });
  }

}