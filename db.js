const { Client } = require('pg');


const client = new Client({
  user: 'postgres',         
  host: 'localhost',        
  database: 'systemdatabase',       
  password: '01402',  
  port: 5432,                
});


client.connect((err) => {
  if (err) {
    console.error('Connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL');
  }
});

module.exports = client; 
