import mOrm from './mOrm';
import Student from './entities/student';

(async () => {
    const orm = new mOrm();

    try {
        await orm.createConnection({
            "uri": "postgres://st2diio:pssw0rD&@localhost:5432/iLovePragmatic",
            synchronize: true,
            entities: [ Student ]
        });

        const studentEntity = orm.getEntity(Student);
        const StudentSaved = await studentEntity.save({
            firstname: 'Perry',
            lastname: 'Plactypus'
        })
        console.log(`New student ${StudentSaved}`)

        console.log(`New student ${StudentSaved.firstname}`)

    } catch (err) {
        console.log(err);
        process.exit(-1)
    }
})();


