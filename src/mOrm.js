import {isEmpty} from 'lodash';
import {existsSync } from 'fs';
import path from 'path';
import PostgreSQL from './engine/postgresql';

export default class mOrm {
    configPathName = "./mOrm.config.json";
  
    async createConnection(dbConfig = {}) {
        if (isEmpty(dbConfig)){
            console.log(__dirname);
    
            if(!existsSync(path.join(__dirname, this.configPathName))) {
                throw new Error("Configuration file m0rm.config.json required")
            }
            this.config = require(this.configPathName);
        } else {
            if(dbConfig.uri){
                // "uri": "postgres://pssw0rD&::st2diio@localhost:5432/iLovePragmatic"
                const regExp = /^(.*):\/\/(.*):(.*)@(.*):(\d+)\/(.*)/g;

                const [, type, username, password, host, port, database] = regExp.exec(dbConfig.uri);

                this.config = {
                    type,
                    username,
                    password,
                    host,
                    port, 
                    database
                }; 

                }else {
                   this.config = dbConfig; 
                }
                        
            }
            console.log(this.config);        

            //Init database engine
            switch(this.config.type){
                case 'postgres':
                    this.dbInstance = new PostgreSQL(this.config);
                    break;
                case 'mysql':
                    this.dbInstance = new MySQL(this.config);
                    break;
                default: 
                throw new Error (`Engine ${this.config.type} not supported`);
            }

            await this.dbInstance.initialize();
        }
    }
