const fs = require('fs');

async function main() {
  const res = await fetch("https://www.wxntv.com/assets/index-CIqJaJUQ.js");
  const text = await res.text();
  
  // Find endpoints
  const apiMatches = text.match(/\/api\/[a-zA-Z0-9_\/-]+/g);
  console.log("API endpoints:", [...new Set(apiMatches)].slice(0, 30));

  // Find images
  const imgMatches = text.match(/\/static\/[a-zA-Z0-9_\/.-]+/g);
  console.log("Static images:", [...new Set(imgMatches)].slice(0, 30));
}

main().catch(console.error);
