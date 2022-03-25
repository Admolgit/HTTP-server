// import database from './database.json';
const http = require('http');
const fs = require('fs');

const { v4: uuidv4 } = require('uuid')
/*
implement your server code here
*/

let filePaths = './database.json';

let isExists = fs.existsSync("./database.json");

if(isExists === false) {
  fs.writeFile("./database.json", '[]', (err) => console.log(err));
}

let database = JSON.parse(fs.readFileSync("./database.json", "utf8"))



const server = http.createServer((req, res) => {

  switch(req.method) {
    // Get all the information in the database.
    case "GET": {
      if(req.url === "/api/") {
        if(isExists === true) {
          fs.readFile('./database.json', 'utf8', (err, content) => {
            let data = JSON.parse(content);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(data, null, 2));
            res.end();
          })
        }
        else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify("Please enter your details and send in a post request"))
          res.end();
        }
      }
      break;
    } 

    // Get information by id (getting individual information)
    case "GET": {
        let matchingUrl = req.url.match(/\/api\/id\/([A-Za-z0-9]+)/).input;
        const id = matchingUrl.split("/")[3]; 
        const det = id;

        database.forEach((item, index) => {
          console.log("individual",item)
          if(item['userId'] == det) {
            console.log(item)
            res.setHeader('Location', '/api');
            res.writeHead(200, { "Content-Type": "application/json" });
            res.write(JSON.stringify(item, null, 2))
            res.end();
          }
        });
      break;
    }

    // Post an information to the database
    case "POST": {
      if(req.url == "/") {
        const data = [];
        const parsedData = [];
        req.on('data', (chunk) => {
            // Storing the chunk data
            data.push(chunk);
        });
        req.on('end', () => {
          // Parsing the chunk data
          const parsedBody = Buffer.concat(data).toString();

          let pairdData = JSON.parse(parsedBody);

          let userData = {userId: uuidv4(), ...pairdData} 
          parsedData.push(userData);

          fs.readFile(filePaths, 'utf8', function(err, data){
            let readData = JSON.parse(data);
            readData.push(userData);
            fs.writeFileSync('./database.json', JSON.stringify(readData, null, 2), "utf8");
          })

          res.setHeader('Location', '/api');
          res.writeHead(200, { "Content-Type": "application/json" });
          res.write(JSON.stringify(userData, null, 2))
          res.end();
        });
      }
      break;
    }

    // Update information
    case "PUT": {
      let matchingUrl = req.url.match(/\/api\/([A-Za-z0-9]+)/).input;

      const id = matchingUrl.split("/")[2]; 

      let det = id;

      const data = [];
      req.on('data', (chunk) => {
          // Storing the chunk data
          data.push(chunk);
      });
      req.on('end', () => {
        const upData = Buffer.concat(data).toString();
        let updated = JSON.parse(upData);
        let newDate = new Date();
        
        const {  userId, organization, createdAt, updatedAt, products, marketValue, address, country, id, noOfEmployees, employees } = updated 
        let detailsData = {
          userId: userId || updated.userId,
          organization: organization || updated.organization,
          createdAt: createdAt || updated.createdAt,
          updatedAt: newDate.toISOString(),
          products: products || updated.products,
          marketValue: marketValue || updated.marketValue,
          address: address || updated.address,
          country: country || updated.country,
          id: id || updated.id,
          noOfEmployees: noOfEmployees || updated.noOfEmployees,
          employees: employees || updated.employees
        }
      
        database.forEach((item, index) => {
          if (item['userId'] === det){
            database[index] = detailsData;
            fs.writeFile(filePaths, JSON.stringify(database, null, 2), 'utf8', err => console.log(err));
          }
        });

        res.setHeader('Location', '/api');
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(detailsData, null, 2))
        res.end();
      });
      break; 
    }
    // Delete information
    case 'DELETE': {
      let matchingUrl = req.url.match(/\/api\/id\/([A-Za-z0-9]+)/).input;
      const id = matchingUrl.split("/")[3]; 
  
      const det = id;

      database.forEach((item, index) => {
        if (item['userId'] === det){
        database.splice(index, 1);
        fs.writeFile(filePaths, JSON.stringify(database, null, 2), 'utf8', err => console.log(err));
        }
      });

      res.setHeader('Location', '/api');
      res.writeHead(200, { "Content-Type": "application/json" });
      res.write(JSON.stringify(database, null, 2))
      res.end();
    break;
    }
    // No details
    default: {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Not found." }));
    }
  }
});

server.listen(3011, () => console.log("Server running on port 3011"))

module.exports = server 