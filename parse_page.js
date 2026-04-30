const fs = require('fs');
fetch("http://localhost:3000/estabilshement/cfdc7eae-207c-4d79-8305-f28dec0775d2")
  .then(r => r.text())
  .then(text => {
    fs.writeFileSync('page_output.html', text);
    console.log("Saved to page_output.html");
  })
