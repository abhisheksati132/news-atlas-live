async function main() {
  const urls = [
    'http://localhost:3000/health',
    'http://localhost:3000/api/config',
    'http://localhost:3000/api/news',
    'http://localhost:3000/api/economics?country=USA,IND,GBR,JPN,CHN',
    'http://localhost:5173',
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u);
      const text = await res.text();
      console.log(`OK ${u} => ${res.status} ${res.statusText || ''}`);
      console.log(text.slice(0, 200));
    } catch (e) {
      console.error(`ERR ${u}:`, e.message);
    }
  }
}
main();
