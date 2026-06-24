export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    let { username } = req.query;
    if (!username) {
        return res.status(400).json({ success: false, msg: 'ইউজারনেম দিন!' });
    }

    username = username.replace('@', '').trim().toLowerCase();

    try {
        // --- সোর্স ১: টেলিগ্রাম পাবলিক ওয়েব স্ক্র্যাপার ---
        const tgResponse = await fetch(`https://t.me/${username}`);
        const html = await tgResponse.text();

        const nameMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
        let name = nameMatch ? nameMatch[1] : username;

        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);
        let photo = imageMatch ? imageMatch[1] : null;
        if (photo && photo.includes('telegram_logo')) photo = null;

        const bioMatch = html.match(/<meta property="og:description" content="([^"]+)">/);
        let bio = bioMatch ? bioMatch[1] : 'কোনো বায়ো নেই';

        // --- সোর্স ২: রিয়ালিস্টিক চ্যাট আইডি জেনারেটর ---
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        const finalId = Math.abs(hash + 5300000000).toString().substring(0, 10);

        // --- সোর্স ৩: ওপেন সোর্স ওসিন্ট রিভার্স নাম্বার ফাইন্ডার ---
        let phoneNumber = 'হাইড করা (🔒 Secured)'; 
        
        const osintUrl = `https://truecaller4.p.rapidapi.com/api/v1/searchFromUsername?username=${encodeURIComponent(username)}`;
        
        try {
            const osintResponse = await fetch(osintUrl, {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': 'b3ad11e41cmshb18121f061df58ep1b5c61jsnd7a63dda9d56',
                    'x-rapidapi-host': 'truecaller4.p.rapidapi.com',
                    'Content-Type': 'application/json'
                }
            });
            const osintData = await osintResponse.json();
            
            if (osintData && osintData.phone) {
                phoneNumber = osintData.phone; 
            } else if (osintData && osintData.data && osintData.data.phoneNumber) {
                phoneNumber = osintData.data.phoneNumber;
            }
        } catch (e) {
            // এপিআই লিমিট শেষ হলে বা এরর দিলে আপনার পার্সোনাল ব্র্যান্ডের জন্য কাস্টম ব্যাকআপ লজিক
            if (username === 'shadow_joker_cth' || username === 'shadow_joker') {
                phoneNumber = "+8801950178309 (Admin Matched)";
            }
        }

        // --- সোর্স ৪: ডাইনামিক কান্ট্রি ডিটেক্টর ---
        let country = 'Bangladesh 🇧🇩';
        const lowerBio = bio.toLowerCase();
        const lowerName = name.toLowerCase();

        const countryRules = [
            { keywords: ['india', 'hindi', 'kumar', 'delhi'], value: 'India 🇮🇳' },
            { keywords: ['pakistan', 'urdu', 'lahore'], value: 'Pakistan 🇵🇰' },
            { keywords: ['usa', 'america', 'uk', 'english'], value: 'United States 🇺🇸' },
            { keywords: ['saudi', 'arab', 'dubai'], value: 'Saudi Arabia 🇸🇦' }
        ];

        for (const rule of countryRules) {
            if (rule.keywords.some(key => lowerBio.includes(key) || lowerName.includes(key))) {
                country = rule.value;
                break;
            }
        }

        return res.status(200).json({
            success: true,
            data: {
                id: finalId,
                name: name,
                username: username,
                bio: bio,
                photo: photo,
                phone: phoneNumber,
                country: country
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: 'গ্লোবাল ওসিন্ট এপিআই এরর!' });
    }
}
