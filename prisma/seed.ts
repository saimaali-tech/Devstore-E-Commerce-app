import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await db.orderItem.deleteMany();
  await db.order.deleteMany();
  await db.cartItem.deleteMany();
  await db.cart.deleteMany();
  await db.review.deleteMany();
  await db.product.deleteMany();

  // Create products
  const products = await db.product.createMany({
    data: [
      {
        name: 'ProMech X1 Mechanical Keyboard',
        slug: 'promech-x1-mechanical-keyboard',
        description: 'Premium mechanical keyboard with hot-swappable switches and per-key RGB lighting.',
        longDescription: 'The ProMech X1 is a top-tier mechanical keyboard designed for professionals and enthusiasts alike. Featuring hot-swappable switches, you can customize your typing experience without soldering. The per-key RGB lighting offers 16.8 million colors with multiple lighting effects. Built with a solid aluminum frame, PBT keycaps, and a detachable USB-C cable, this keyboard delivers both durability and style. The N-key rollover and anti-ghosting technology ensure every keystroke is registered accurately.',
        price: 149.99,
        comparePrice: 189.99,
        image: '/images/products/keyboard.png',
        images: '["/images/products/keyboard.png"]',
        category: 'Keyboards',
        tags: '["mechanical","rgb","hot-swap","aluminum","usb-c"]',
        rating: 4.7,
        reviewCount: 234,
        stock: 45,
        featured: true,
        version: 'v1',
      },
      {
        name: 'SoundShield Pro Headphones',
        slug: 'soundshield-pro-headphones',
        description: 'Wireless noise-cancelling headphones with 40-hour battery life and Hi-Res Audio.',
        longDescription: 'Experience pure audio bliss with the SoundShield Pro. These premium wireless headphones feature advanced adaptive noise cancellation that intelligently adjusts to your environment. With 40 hours of battery life on a single charge and quick charge capability (5 minutes = 3 hours of playback), you will never be without your music. The custom 40mm drivers deliver Hi-Res Audio with exceptional clarity across all frequencies. The memory foam ear cushions and lightweight design ensure all-day comfort for work or travel.',
        price: 299.99,
        comparePrice: 349.99,
        image: '/images/products/headphones.png',
        images: '["/images/products/headphones.png"]',
        category: 'Audio',
        tags: '["wireless","noise-cancelling","bluetooth","hi-res","long-battery"]',
        rating: 4.8,
        reviewCount: 567,
        stock: 30,
        featured: true,
        version: 'v1',
      },
      {
        name: 'ErgoGlide Vertical Mouse',
        slug: 'ergoglide-vertical-mouse',
        description: 'Ergonomic vertical wireless mouse designed to reduce wrist strain and improve comfort.',
        longDescription: 'The ErgoGlide Vertical Mouse is scientifically designed to promote a natural handshake position, reducing wrist strain and preventing repetitive stress injuries. With its 57° vertical angle, adjustable DPI (800-4000), and six programmable buttons, it is perfect for long work sessions. The ergonomic sculpted shape fits comfortably in your hand, while the silent click switches ensure a quiet workspace. Compatible with both USB receiver and Bluetooth 5.0 for versatile connectivity.',
        price: 59.99,
        comparePrice: 79.99,
        image: '/images/products/mouse.png',
        images: '["/images/products/mouse.png"]',
        category: 'Mice',
        tags: '["ergonomic","vertical","wireless","bluetooth","silent-click"]',
        rating: 4.5,
        reviewCount: 189,
        stock: 60,
        featured: false,
        version: 'v1',
      },
      {
        name: 'UltraDock 12-in-1 USB-C Hub',
        slug: 'ultradock-12-in-1-usbc-hub',
        description: '12-in-1 USB-C docking station with dual HDMI, ethernet, and 100W power delivery.',
        longDescription: 'Transform your laptop into a full desktop workstation with the UltraDock 12-in-1. This premium aluminum docking station features dual HDMI 4K@60Hz outputs, Gigabit Ethernet, 100W USB-C Power Delivery, 3x USB-A 3.0 ports, USB-C data, SD/microSD card readers, 3.5mm audio jack, and a VGA port. The pass-through charging capability means you only need one cable connected to your laptop. Supports Plug & Play with no additional drivers required. Compatible with macOS, Windows, ChromeOS, and Linux.',
        price: 89.99,
        comparePrice: 119.99,
        image: '/images/products/dock.png',
        images: '["/images/products/dock.png"]',
        category: 'Accessories',
        tags: '["usb-c","docking-station","hdmi","ethernet","power-delivery"]',
        rating: 4.6,
        reviewCount: 312,
        stock: 25,
        featured: true,
        version: 'v2',
      },
      {
        name: 'AirLift Pro Laptop Stand',
        slug: 'airlift-pro-laptop-stand',
        description: 'Adjustable aluminum laptop stand with ventilation for improved airflow and ergonomics.',
        longDescription: 'Elevate your workspace with the AirLift Pro Laptop Stand. CNC machined from a single block of premium aluminum, this stand provides a stable and elegant platform for your laptop. The 6-level height adjustment system lets you find the perfect viewing angle to reduce neck strain. The open design promotes natural airflow to keep your laptop cool during intensive tasks. Supports laptops from 10" to 17" and folds flat for easy portability. Silicone pads ensure your device stays securely in place without scratches.',
        price: 69.99,
        comparePrice: null,
        image: '/images/products/laptop-stand.png',
        images: '["/images/products/laptop-stand.png"]',
        category: 'Accessories',
        tags: '["laptop-stand","aluminum","ergonomic","adjustable","portable"]',
        rating: 4.9,
        reviewCount: 421,
        stock: 35,
        featured: true,
        version: 'v2',
      },
      {
        name: 'LumiBar Monitor Light',
        slug: 'lumibar-monitor-light',
        description: 'Asymmetric LED monitor light bar with adjustable color temperature and brightness.',
        longDescription: 'The LumiBar Monitor Light is the perfect lighting solution for your desk. Its asymmetric optical design illuminates your desk without causing screen glare. With adjustable color temperature (2700K-6500K) and brightness levels, you can create the ideal lighting for any task. The touch-sensitive controls and memory function make it effortless to use. The USB-C powered design keeps your desk clutter-free. Fits monitors from 1cm to 3cm thickness with the adjustable clamp.',
        price: 49.99,
        comparePrice: 64.99,
        image: '/images/products/light-bar.png',
        images: '["/images/products/light-bar.png"]',
        category: 'Lighting',
        tags: '["led","monitor-light","adjustable","usb-c","anti-glare"]',
        rating: 4.4,
        reviewCount: 156,
        stock: 50,
        featured: false,
        version: 'v2',
      },
      {
        name: 'ClearView 4K Webcam',
        slug: 'clearview-4k-webcam',
        description: '4K UHD webcam with auto-focus, built-in ring light, and noise-cancelling microphone.',
        longDescription: 'Look your best on every video call with the ClearView 4K Webcam. Featuring a Sony STARVIS sensor, it delivers stunning 4K UHD video at 30fps or smooth 1080p at 60fps. The built-in adjustable ring light ensures perfect lighting in any environment, while the dual noise-cancelling microphones capture crystal-clear audio. The AI-powered auto-framing keeps you centered in the frame even as you move. Compatible with all major video conferencing platforms including Zoom, Teams, Meet, and Slack.',
        price: 129.99,
        comparePrice: 169.99,
        image: '/images/products/webcam.png',
        images: '["/images/products/webcam.png"]',
        category: 'Audio',
        tags: '["webcam","4k","ring-light","auto-focus","noise-cancelling"]',
        rating: 4.6,
        reviewCount: 278,
        stock: 20,
        featured: false,
        version: 'v3',
      },
      {
        name: 'DeskCraft XL Premium Desk Mat',
        slug: 'deskcraft-xl-premium-desk-mat',
        description: 'Extra-large premium desk mat with water-resistant PU leather surface and anti-slip base.',
        longDescription: 'Transform your desk with the DeskCraft XL Premium Desk Mat. Made from high-quality water-resistant PU leather with a smooth microfiber surface, it provides an ideal surface for both writing and mouse usage. The extra-large 35" x 17" size covers your entire workspace, protecting your desk from scratches and spills. The anti-slip natural rubber base keeps the mat firmly in place. Double-stitched edges prevent fraying and ensure long-lasting durability. Easy to clean with a damp cloth.',
        price: 34.99,
        comparePrice: 44.99,
        image: '/images/products/desk-mat.png',
        images: '["/images/products/desk-mat.png"]',
        category: 'Desk Accessories',
        tags: '["desk-mat","leather","water-resistant","anti-slip","extra-large"]',
        rating: 4.3,
        reviewCount: 445,
        stock: 80,
        featured: false,
        version: 'v1',
      },
      {
        name: 'NeoBook Smart Reusable Notebook',
        slug: 'neobook-smart-reusable-notebook',
        description: 'Eco-friendly smart notebook with reusable pages that sync handwritten notes to the cloud.',
        longDescription: 'The NeoBook Smart Notebook combines the feel of traditional writing with modern digital convenience. Each page is made from special reusable paper that works with the included Pilot FriXion erasable pen. Write, scan with the companion app, and your notes are automatically sent to your favorite cloud services like Google Drive, Dropbox, or Evernote. Simply wipe the pages clean with a damp cloth and start fresh. Includes 50 pages (25 sheets) with dot grid, lined, and planner templates.',
        price: 24.99,
        comparePrice: 34.99,
        image: '/images/products/notebook.png',
        images: '["/images/products/notebook.png"]',
        category: 'Desk Accessories',
        tags: '["smart-notebook","reusable","eco-friendly","cloud-sync","erasable"]',
        rating: 4.2,
        reviewCount: 198,
        stock: 55,
        featured: false,
        version: 'v3',
      },
      {
        name: 'PowerPad Trio Wireless Charger',
        slug: 'powerpad-trio-wireless-charger',
        description: '3-in-1 wireless charging station for phone, smartwatch, and earbuds simultaneously.',
        longDescription: 'Charge all your devices at once with the PowerPad Trio. This sleek 3-in-1 wireless charging station supports simultaneous charging for your Qi-enabled smartphone (up to 15W), smartwatch, and wireless earbuds. The intelligent charging technology automatically detects your device and delivers optimal power. The built-in LED indicator shows charging status at a glance. The anti-slip silicone surface keeps your devices secure. Compatible with all Qi-enabled devices including iPhone, Samsung Galaxy, AirPods, and more.',
        price: 44.99,
        comparePrice: 59.99,
        image: '/images/products/charger.png',
        images: '["/images/products/charger.png"]',
        category: 'Accessories',
        tags: '["wireless-charger","qi","3-in-1","fast-charge","multi-device"]',
        rating: 4.5,
        reviewCount: 334,
        stock: 40,
        featured: true,
        version: 'v3',
      },
      {
        name: 'CablePro Deluxe Management Kit',
        slug: 'cablepro-deluxe-management-kit',
        description: 'Complete cable management kit with adhesive clips, velcro ties, and under-desk cable tray.',
        longDescription: 'Say goodbye to cable clutter with the CablePro Deluxe Management Kit. This comprehensive set includes 20 adhesive cable clips in 3 sizes, 10 reusable velcro cable ties, 5 silicone cable sleeves, and a 15-inch under-desk cable management tray. The premium 3M adhesive backing ensures clips stay firmly attached to any surface. The velcro ties are reusable and adjustable, perfect for organizing cables of any thickness. The powder-coated steel cable tray installs easily under any desk for a clean, professional look.',
        price: 29.99,
        comparePrice: 39.99,
        image: '/images/products/cable-kit.png',
        images: '["/images/products/cable-kit.png"]',
        category: 'Desk Accessories',
        tags: '["cable-management","organization","velcro","adhesive-clips","desk-tray"]',
        rating: 4.1,
        reviewCount: 267,
        stock: 70,
        featured: false,
        version: 'v2',
      },
    ],
  });

  console.log(`✅ Created ${products.count} products`);

  // Create reviews
  const allProducts = await db.product.findMany();

  const reviewData = [
    // Keyboard reviews
    { productName: 'ProMech X1 Mechanical Keyboard', userName: 'Alex M.', rating: 5, title: 'Best keyboard I ever owned!', comment: 'The hot-swap feature is amazing. I switched from Cherry Reds to Zealios and it took 5 minutes. Build quality is outstanding.' },
    { productName: 'ProMech X1 Mechanical Keyboard', userName: 'Sarah K.', rating: 4, title: 'Great keyboard, minor RGB issue', comment: 'Typing feel is phenomenal and the aluminum frame is solid. The RGB lighting could be brighter, but overall very happy with the purchase.' },
    { productName: 'ProMech X1 Mechanical Keyboard', userName: 'David L.', rating: 5, title: 'Perfect for programming', comment: 'As a software engineer, I spend 10+ hours a day on this keyboard. The comfort and responsiveness are unmatched. Highly recommend for developers.' },
    { productName: 'ProMech X1 Mechanical Keyboard', userName: 'Mike R.', rating: 4, title: 'Solid build quality', comment: 'The PBT keycaps have a great texture and the detachable cable is a nice touch. Only wish it came with a wrist rest.' },

    // Headphones reviews
    { productName: 'SoundShield Pro Headphones', userName: 'Jessica T.', rating: 5, title: 'Incredible noise cancellation', comment: 'I use these on my daily commute and they completely block out subway noise. Battery life is exactly as advertised.' },
    { productName: 'SoundShield Pro Headphones', userName: 'Ryan P.', rating: 5, title: 'Best ANC headphones', comment: 'Tested these against Sony and Bose, and the SoundShield Pro holds its own. The sound quality is exceptional for the price.' },
    { productName: 'SoundShield Pro Headphones', userName: 'Emma W.', rating: 4, title: 'Comfortable for all-day wear', comment: 'Super comfortable ear cushions. I wear them 8 hours straight for work meetings with no discomfort. Sound is great too.' },
    { productName: 'SoundShield Pro Headphones', userName: 'Chris B.', rating: 5, title: 'Game changer for remote work', comment: 'The noise cancellation transforms my home office. Calls are clearer and I can focus without distractions.' },

    // Mouse reviews
    { productName: 'ErgoGlide Vertical Mouse', userName: 'Tom H.', rating: 5, title: 'Saved my wrist', comment: 'After years of wrist pain from regular mice, this vertical design eliminated my discomfort within a week. Wish I found it sooner.' },
    { productName: 'ErgoGlide Vertical Mouse', userName: 'Lisa N.', rating: 4, title: 'Takes getting used to', comment: 'The ergonomic design is clearly better for your wrist. There is a learning curve of about 2-3 days but now I cannot go back to a regular mouse.' },
    { productName: 'ErgoGlide Vertical Mouse', userName: 'Mark J.', rating: 4, title: 'Quiet and comfortable', comment: 'The silent clicks are a game changer for office work. The Bluetooth connection is stable and battery lasts forever.' },

    // Dock reviews
    { productName: 'UltraDock 12-in-1 USB-C Hub', userName: 'Kevin S.', rating: 5, title: 'Replaced my entire dock setup', comment: 'This single hub replaced 3 separate dongles I was using. Dual HDMI works flawlessly with my MacBook Pro M3.' },
    { productName: 'UltraDock 12-in-1 USB-C Hub', userName: 'Anna L.', rating: 4, title: 'Great value for the features', comment: 'All ports work as expected. The aluminum body matches my laptop perfectly. 100W charging is a huge plus.' },
    { productName: 'UltraDock 12-in-1 USB-C Hub', userName: 'James C.', rating: 5, title: 'Essential for laptop users', comment: 'If you use a laptop as your main machine, this dock is a must-have. The ethernet port is fast and reliable.' },

    // Laptop stand reviews
    { productName: 'AirLift Pro Laptop Stand', userName: 'Nina R.', rating: 5, title: 'Beautiful and functional', comment: 'The build quality is premium - this is a solid piece of aluminum. My MacBook runs cooler and my neck thanks me every day.' },
    { productName: 'AirLift Pro Laptop Stand', userName: 'Paul G.', rating: 5, title: 'Perfect height adjustment', comment: '6 levels of adjustment cover every scenario. It folds flat and fits in my backpack. Best laptop stand I have owned.' },
    { productName: 'AirLift Pro Laptop Stand', userName: 'Olivia M.', rating: 4, title: 'Sturdy and portable', comment: 'Holds my 16 inch laptop without any wobble. The silicone pads keep it from sliding. Only wish it had a cable management slot.' },

    // Light bar reviews
    { productName: 'LumiBar Monitor Light', userName: 'Frank D.', rating: 4, title: 'Great lighting solution', comment: 'Lights up my desk perfectly without causing any screen glare. The color temperature adjustment is smooth and easy to use.' },
    { productName: 'LumiBar Monitor Light', userName: 'Grace H.', rating: 4, title: 'Much better than a desk lamp', comment: 'Frees up desk space and provides more even lighting. USB-C power is convenient. Good product overall.' },

    // Webcam reviews
    { productName: 'ClearView 4K Webcam', userName: 'Brian K.', rating: 5, title: 'Professional quality video', comment: 'The 4K quality is outstanding. My colleagues noticed the difference immediately. Auto-framing works great during presentations.' },
    { productName: 'ClearView 4K Webcam', userName: 'Susan L.', rating: 5, title: 'Best webcam upgrade', comment: 'The ring light feature is brilliant - no need for separate lighting. Setup was plug and play. Works perfectly with Zoom.' },

    // Desk mat reviews
    { productName: 'DeskCraft XL Premium Desk Mat', userName: 'Jason W.', rating: 4, title: 'Huge and comfortable', comment: 'This mat covers my entire desk. The leather surface feels great and my mouse tracks perfectly on it. Easy to clean too.' },
    { productName: 'DeskCraft XL Premium Desk Mat', userName: 'Rachel P.', rating: 4, title: 'Looks professional', comment: 'The leather look adds a premium feel to my workspace. Water resistant feature saved my desk from a coffee spill already.' },

    // Notebook reviews
    { productName: 'NeoBook Smart Reusable Notebook', userName: 'Dan F.', rating: 4, title: 'Eco-friendly and practical', comment: 'Great concept and execution. The app scanning works well and the pages erase cleanly. Perfect for meeting notes.' },
    { productName: 'NeoBook Smart Reusable Notebook', userName: 'Amy C.', rating: 4, title: 'Fun and useful', comment: 'I love that I can reuse the pages. The cloud sync to Google Drive is seamless. Would make a great gift too.' },

    // Charger reviews
    { productName: 'PowerPad Trio Wireless Charger', userName: 'Steve M.', rating: 5, title: 'Charges everything at once', comment: 'Phone, watch, and earbuds all charging simultaneously. The alignment is forgiving so you do not have to be precise.' },
    { productName: 'PowerPad Trio Wireless Charger', userName: 'Maria G.', rating: 4, title: 'Clean design, works well', comment: 'Looks great on my nightstand. Charges my iPhone 15 fast. The indicator light is subtle and not annoying.' },

    // Cable kit reviews
    { productName: 'CablePro Deluxe Management Kit', userName: 'Robert T.', rating: 4, title: 'Desk looks so much better', comment: 'The cable tray is the star of this kit. Combined with the clips and ties, my desk went from messy to minimal in 30 minutes.' },
    { productName: 'CablePro Deluxe Management Kit', userName: 'Jennifer K.', rating: 4, title: 'Great variety of accessories', comment: 'Everything you need for cable management in one box. The adhesive clips are strong and the velcro ties are reusable.' },
  ];

  for (const review of reviewData) {
    const product = allProducts.find(p => p.name === review.productName);
    if (product) {
      await db.review.create({
        data: {
          productId: product.id,
          userName: review.userName,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
        },
      });
    }
  }

  console.log(`✅ Created ${reviewData.length} reviews`);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
