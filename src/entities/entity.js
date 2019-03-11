export default class Entity{
    constructor(dbInstance){
        this.dbInstance = dbInstance;

        this.Name = undefined;
    };
    async save(data) {
        return await this.dbInstance.save(this, data);
      }
      async count() {
        return await this.dbInstance.count(this);
      }
      async findByPk(id, attributes) {
        return await this.dbInstance.findByPk(this, id, attributes);
      }
      async findAll(attributes) {
        return await this.dbInstance.findAll(this, attributes);
      }
      async findOne( where, attributes ) {
        return await this.dbInstance.findOne(this, where, attributes);
      }
      async update(where, data) {
        return await this.dbInstance.update(this, where, data);
      }
      async remove(data) {
        return await this.dbInstance.remove(this, data);
      }
}