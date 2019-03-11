import {Client} from 'pg';
import Core from './core';
import Entity from '../entities/entity';

export default class PostgreSQL extends Core {
    constructor(options){
        super(options);
    }
    async initialize() {
        const { host, port, username, password, database, synchronize, entities } = this;

        this.client = new Client({
            user: username, host, port, database, password}
        );

        try {
            await this.client.connect();

            await this.create();
            await this.disconect();
            

        } catch (e){
            console.log(`Database ${database} doesn't exist`);
            console.log(`${e.message}`);
        }
    }

    async disconect(){
        this.client.query("SELECT NOW()", (err, res) =>{
            console.log(err, res);
            this.client.end();
        });
    }
    
    async create(){
        await this.entities.forEach(element => {
            const keys = Object.keys(element.meta().columns);
            const parametre = keys
            .map((key)=>{
                const value = element.meta().columns[key];
                return `${key} ${value.generated ? " SERIAL" : this.toPostgresType(value.type)}${value.primary ? " PRIMARY KEY" : ''}`;
            })
            .join(", ")
            this.client.query(`CREATE TABLE IF NOT EXISTS ${element.name.toLowerCase()} (${parametre})`)
        });
    }

    toPostgresType(type){
        const typesPostgres = {
            number: "integer",
            string: "text"
        }

        if (typesPostgres[type]) {
            return typesPostgres[type];
        }
        throw new Error ("Conversion to PostgresSQL type not possible");
    }

    async save(data) {}
    
    async count(entity) {
        try{
            const res = await this.client.query(`SELECT COUNT (*) FROM ${entity.toLowerCase()}`);
            return res.rows[0].count;
        } catch(e) {
            console.log(`Error ${entity.name.toLowerCase()} could not be counted. Table must be missing`);
        }
    }

    async findByPk(id, { attributes }) {}
    
    async findAll({ attributes }) {

    }

    async findOne({ where, attributes }) {}

    async update(data) {}

    async remove(data) {}
  }