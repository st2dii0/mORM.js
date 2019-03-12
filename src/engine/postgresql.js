import { Client } from 'pg';
import Core from './core';

export default class PostgreSQL extends Core {
    constructor(options) {
        super(options);
    }
    async initialize() {
        const { host, port, username, password, database} = this;

        this.client = new Client({
            user: username, host, port, database, password
        }
        );

        try {
            await this.client.connect();
            await this.create();
            // await this.count();
            // await this.save();
            await this.disconect();


        } catch (e) {
            console.log(`Database ${database} doesn't exist`);
            console.log(`${e.message}`);
        }
    }

    async disconect() {
        this.client.end();
    }

    async create() {
        await this.entities.forEach(entity => {
            const keys = Object.keys(entity.meta().columns);
            const parametre = keys
                .map((key) => {
                    const value = entity.meta().columns[key];
                    return `${key} ${value.generated ? " SERIAL" : this.toPostgresType(value.type)} ${value.primary ? " PRIMARY KEY" : ''}`;
                })
                .join(", ")
                
            this.client.query(`CREATE TABLE IF NOT EXISTS ${entity.name.toLowerCase()} (${parametre})`)
        });
    }

    toPostgresType(type) {
        const typesPostgres = {
            number: "integer",
            string: "text"
        }

        if (typesPostgres[type]) {
            return typesPostgres[type];
        }
        throw new Error("Error type -- Conversion PostgresSQL failed");
    }

    async save(entity, data) {
        const label = Object.keys(data).join(", ");
        const values = Object.values(data)
        .map((value => `'${value}'`))
        .join(', ');

            console.log('label '+label);
            console.log('values '+values);            
            
            const queryExec = `INSERT INTO ${entity.name} ${label} VALUES ${values} RETURNING *`;

        try {
            console.log(queryExec);
            console.log(entity.name);
            console.log(this.entities.name);
            
            const res = await this.client.query(queryExec);
            console.log(res);
            
            return res.rows[0];

        } catch (e) {
            console.log(`[${entity.name}] save is impossible`);
        }
    }

    async count(entity) {
        try {
            const res = await this.client.query(`SELECT COUNT (*) FROM ${entity.toLowerCase()}`);
            return res.rows[0].count;
        } catch (e) {
            console.log(`Error ${entity.name.toLowerCase()} could not be counted. Table must be missing`);
        }
    }

    async findByPk(entity, id = {}, { attributes }) {
        if (!id.id || id.id == null) throw new Error`Primary key missing`;

        const Pk = Object.keys(id);
        if (Pk.length != 1) throw new Error`Id too long`;
        if (typeof id[Pk] != "number") throw new Error`Id must be a number`;
        if (typeof attributes == "object" && attributes.length == undefined) throw new Error`Parametres must be un an array`;

        const params = attributes.length == 0 ? "*" : attributes.join(", ");

        const queryExec = `SELECT ${params} FROM ${entity.name.toLowerCase()} WHERE ${Pk} = ${id[Pk]}`;
        try {
            const res = await this.client.query(queryExec);
            if (typeof res == "undefined") {
                console.log(`PK ${id[Pk]} doesn't exist`);
                return;
            }
            return res.rows[0];
        } catch (e) {
            console.log(`Incorrect query [findByPk...) ---> ${e.message}`);

        }
    }

    async findAll(entity, attributes = []) {
        if ((typeof attributes == "object" && attributes.length == undefined || typeof attributes != "object")) throw new Error`Parameters must be in an array`;

        const params = attributes.length == 0 ? "*" : attributes.join(", ");
        const queryExec = `SELECT ${params} FROM ${entity.name.toLowerCase()}`;

        try {
            const res = await this.client.query(queryExec);
            if (typeof res == "undefined") {
                console.log(`${entity} doesn't exist`);
                return;
            }
        } catch (e) {
            console.log(`FINDAll() query is not possible --- ${e.message}`);
        }
    }

    async findOne({ entity, where = {}, attributes = [] }) {
        const pWhere = Object.keys(where)
            .map(key => {
                return `${key} = ${pWhere}`;
            })
            .join(", ")

        if (typeof attributes == "object" && attributes.length == undefined) throw new Error`Parameters must be in an array`;

        const Attributesparams = attributes.length == 0 ? "*" : attributes.join(", ");

        const queryExec = `SELECT ${Attributesparams} FROM ${entity.name.toLowerCase()} WHERE ${pWhere}`;
        try {
            const res = await this.client.query(queryExec);
            return res.rows[0];
        } catch (e) {
            console.log(`Incorrect query [FindOne(...)] --> ${e.message}`);

        }

    }

    async update(entity, where = {}, change = {}) {
        const whereparams = Object.keys(where)
            .map(key => {
                return `${key} = '${where[key]}'`;
            })
            .join("AND")

        const changeparams = Object.keys(change)
            .map(key => {
                return `${key} = '${change[key]}'`;
            })
            .join(", ")

        const queryExec = `UPDATE ${entity.name.toLowerCase()} SET ${changeparams}  WHERE ${whereparams} RETURNING *`;

        try {
            const res = await this.client.query(queryExec);
        } catch (e) {
            console.log(`Incorrect query [update(...)] ---> ${e.message}`);

        }
    }

    async remove(entity, params = {}) {
        const whereparams = Object.keys(params)
            .map(key => {
                return `${key} = '${params[keys]}'`
            })
            .join("AND")

        const queryExec = `DELETE FROM ${entity.name.toLowerCase()} WHERE ${whereparams}`;

        try {
            const res = await this.client.query(queryExec);
            console.log(`Successfully removed`);
        } catch (e) {
            console.log(`Incorrect query [remove(...)] ---> ${e.message}`);

        }
    }
}