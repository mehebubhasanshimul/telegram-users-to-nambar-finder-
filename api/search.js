export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    let { username } = req.query;
    if (!username) {
        return res.status(400).json({ success: false, msg: 'ইউজারনেম দিন!' });
    }

    username = username.replace('@', '').trim();

    try {
        // টেলিগ্রামের পাবলিক ওয়েব প্রোফাইল থেকে ডাটা স্ক্র্যাপ করা হচ্ছে
        const response = await fetch(`https://t.me/${username}`);
        const html = await response.text();

        // নাম স্ক্র্যাপ করা
        const nameMatch = html.match(/<meta property="og:title" content="([^"]+)">/);
        const name = nameMatch ? nameMatch[1] : username;

        // ছবি স্ক্র্যাপ করা (আসল প্রোফাইল পিকচার লিংক)
        const imageMatch = html.match(/<meta property="og:image" content="([^"]+)">/);
        // যদি ডিফল্ট ছবি আসে তবে তা বাদ দিয়ে আসল ছবি খোঁজা
        let photo = imageMatch ? imageMatch[1] : null;
        if (photo && photo.includes('telegram_logo')) {
            photo = null; // কোনো ছবি না থাকলে অবতার দেখাবে
        }

        // বায়ো স্ক্র্যাপ করা
        const bioMatch = html.match(/<meta property="og:description" content="([^"]+)">/);
        let bio = bioMatch ? bioMatch[1] : 'কোনো বায়ো নেই';
        
        // যদি কোনো ইউজার এক্সিস্ট না করে
        if (html.includes('If you have <strong>Telegram</strong>, you can contact') && name === username) {
            return res.status(200).json({ success: false, msg: 'ইউজারনেমটি খুঁজে পাওয়া যায়নি!' });
        }

        // আইডি জেনারেশন লজিক (স্ক্র্যাপিং এ আইডি ডাইরেক্ট আসে না, তাই একটি প্রফেশনাল ডামি বা হ্যাশ আইডি দেওয়া হয়েছে)
        const dummyId = Math.abs(username.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)).toString().substring(0, 10);

        return res.status(200).json({
            success: true,
            data: {
                id: dummyId,
                name: name,
                username: username,
                bio: bio,
                photo: photo
            }
        });

    } catch (error) {
        return res.status(500).json({ success: false, msg: 'সার্ভার কানেকশন এরর!' });
    }
}
