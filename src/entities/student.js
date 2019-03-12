import Entity from "./entity";

export default class Student extends Entity {
  constructor(dbInstance, Name) {
    super(dbInstance, Name);

    this.Name = Student.meta().name;
  }

  static meta() {
    return {
      name: "Student",
      columns: {
        id: {
          primary: true,
          generated: true
        },
        firstname: {
          type: "string"
        },
        lastname: {
          type: "string"
        },
        age: {
          type: "number",
          optional: true
        }
      }
    };
  }
}