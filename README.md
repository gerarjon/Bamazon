# Bamazon

## About
Bamazon is a command line node app that serves as a small marketplace. 
A user can use:
- bamazonCustomer.js to buy/view products
- bamazonManager.js to update stock and add new items

## Demo
bamazonCustomer
<p align="center">
  <img src="https://user-images.githubusercontent.com/47680567/66979827-c049c780-f063-11e9-8c1f-36614bcde3a3.gif">
</p>

bamazonManager
<p align="center">
  <img src="https://user-images.githubusercontent.com/47680567/66979999-5251d000-f064-11e9-9127-0ceceee38fe0.gif">
</p>

## How to Install
Clone the repository:
```
git clone git@github.com:gerarjon/Bamazon.git
```
Install node within the directory: 
```
npm install
```
or install the packages used below individually.

Create a .env and place your keys like so:
```
#Bamazon MySQL Password

DB_HOST=yourhost
DB_USER=youruser
DB_NAME=yourDBname
DB_PASS=yourpassword
```

## Technologies used
* [MySQL](https://www.npmjs.com/package/mysql)
* [inquirer](https://www.npmjs.com/package/inquirer)
* [console.table](https://www.npmjs.com/package/console.table)
* [dotenv](https://www.npmjs.com/package/dotenv)
* [MySQL Workbench](https://www.mysql.com/products/workbench/)

## Author
[Gerar Suaverdez](https://github.com/gerarjon)

## Acknowledgements
Thanks to UW Coding Bootcamp for all the coding and the bootcamp!