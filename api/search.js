export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    let { username } = req.query;
    if (!username) {
        return res.status(400).json({ success: false, msg: 'ইউজারনেম দিন!' });
    }

    username = username.replace('@', '').trim();

    // RapidAPI-এর এন্ডপয়েন্ট ইউআরএল
    const url = `https://telegram-scraper-api.p.rapidapi.com/entity/get-entity?username=${encodeURIComponent(username)}`;

    const options = {
        method: 'GET',
        headers: {
            'x-rapidapi-key': 'b3ad11e41cmshb18121f061df58ep1b5c61jsnd7a63dda9d56',
            'x-rapidapi-host': 'telegram-scraper-api.p.rapidapi.com',
            'Content-Type': 'application/json'
        }
    };

    try {
        const apiResponse = await fetch(url, options);
        const data = await apiResponse.json();
        
        // এপিআই যদি সাকসেসফুল ডাটা দেয়
        if (data && !data.error) {
            return res.status(200).json({ success: true, data: data });
        } else {
            return res.status(200).json({ success: false, msg: 'ইউজারনেমটি খুঁজে পাওয়া যায়নি!' });
        }
    } catch (error) {
        return res.status(500).json({ success: false, msg: 'সার্ভার কানেকশন এরর!' });
    }
}
